import { cache } from "react";
import { loadContent, type ContentStore } from "@/lib/content";
import type { Place, Person, School, Village } from "@/lib/types";

/**
 * কনটেন্ট পড়ার ফাংশন। সব পেজ এগুলো ব্যবহার করে; সরাসরি ডেটাবেস বা content/ ফোল্ডার পড়ে না।
 * ব্যবহার: const db = await data(); তারপর db.getVillages(), db.unionName(slug) …
 * তথ্য একবার পড়া হয় (content.ts-এর cache), তাই বারবার ডাকলেও খরচ নেই।
 */

export interface Coords {
  lat: number;
  lng: number;
  /** true হলে নিজস্ব স্থানাঙ্ক নেই, গ্রাম বা ইউনিয়নের কেন্দ্র দেখানো হচ্ছে */
  approx: boolean;
}

function uniqueBySlug<T extends { slug: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.slug)) return false;
    seen.add(item.slug);
    return true;
  });
}

function makeData(s: ContentStore) {
  function villageCoords(village: Village): Coords {
    if (village.lat !== undefined && village.lng !== undefined) {
      return { lat: village.lat, lng: village.lng, approx: false };
    }
    const union = s.unionMap.get(village.union);
    if (!union) throw new Error(`[ডেটা ত্রুটি] গ্রাম "${village.name}" এর ইউনিয়ন পাওয়া যায়নি`);
    return { lat: union.lat, lng: union.lng, approx: true };
  }

  return {
    getUnions: () => s.unions,
    getVillages: () => s.villages,
    getPlaces: () => s.places,
    getPeople: () => s.people,
    /** নতুন খবর আগে */
    getNewsList: () => s.news,
    getEvents: () => s.events,
    getEmergency: () => s.emergency,
    /** ধরন অনুযায়ী সাজানো (কলেজ আগে, তারপর মাধ্যমিক, মাদ্রাসা, প্রাথমিক) */
    getSchools: () => s.schools,

    getStats: () => ({
      unions: s.unions.length,
      villages: s.villages.length,
      villagesWithInfo: s.villages.filter((v) => v.status !== "stub").length,
      villagesComplete: s.villages.filter((v) => v.status === "complete").length,
      places: s.places.length,
      people: s.people.length,
      news: s.news.length,
      events: s.events.length,
      schools: s.schools.length,
    }),

    getUnion: (slug: string) => s.unionMap.get(slug),
    getVillage: (slug: string) => s.villageMap.get(slug),
    getPlace: (slug: string) => s.placeMap.get(slug),
    getPerson: (slug: string) => s.personMap.get(slug),
    getNews: (slug: string) => s.newsMap.get(slug),
    getEvent: (slug: string) => s.eventMap.get(slug),
    getSchool: (slug: string) => s.schoolMap.get(slug),

    unionName: (slug: string) => s.unionMap.get(slug)?.name ?? slug,
    villagesOfUnion: (unionSlug: string) => s.villages.filter((v) => v.union === unionSlug),

    /** গ্রামের দর্শনীয় স্থান: গ্রামে উল্লেখ করা + ওই গ্রামের নামে থাকা স্থান */
    placesOfVillage: (villageSlug: string): Place[] => {
      const village = s.villageMap.get(villageSlug);
      const listed = (village?.attractions ?? []).map((slug) => s.placeMap.get(slug)).filter((p): p is Place => Boolean(p));
      return uniqueBySlug([...listed, ...s.places.filter((p) => p.village === villageSlug)]);
    },
    placesOfUnion: (unionSlug: string) => s.places.filter((p) => p.union === unionSlug),

    peopleOfVillage: (villageSlug: string): Person[] => {
      const village = s.villageMap.get(villageSlug);
      const listed = (village?.people ?? []).map((slug) => s.personMap.get(slug)).filter((p): p is Person => Boolean(p));
      return uniqueBySlug([...listed, ...s.people.filter((p) => p.village === villageSlug)]);
    },
    peopleOfUnion: (unionSlug: string) => s.people.filter((p) => p.union === unionSlug),

    eventsOfVillage: (villageSlug: string) => s.events.filter((e) => e.village === villageSlug),
    schoolsOfVillage: (villageSlug: string) => s.schools.filter((x) => x.village === villageSlug),
    schoolsOfUnion: (unionSlug: string) => s.schools.filter((x) => x.union === unionSlug),
    featuredPlaces: () => s.places.filter((p) => p.featured),
    villagesWithInfo: () => s.villages.filter((v) => v.status !== "stub"),

    villageCoords,
    placeCoords: (place: Place): Coords => {
      if (place.lat !== undefined && place.lng !== undefined) {
        return { lat: place.lat, lng: place.lng, approx: false };
      }
      if (place.village) {
        const village = s.villageMap.get(place.village);
        if (village) return { ...villageCoords(village), approx: true };
      }
      const union = s.unionMap.get(place.union);
      if (!union) throw new Error(`[ডেটা ত্রুটি] স্থান "${place.name}" এর ইউনিয়ন পাওয়া যায়নি`);
      return { lat: union.lat, lng: union.lng, approx: true };
    },

    schoolCoords: (school: School): Coords => {
      if (school.lat !== undefined && school.lng !== undefined) {
        return { lat: school.lat, lng: school.lng, approx: false };
      }
      if (school.village) {
        const village = s.villageMap.get(school.village);
        if (village) return { ...villageCoords(village), approx: true };
      }
      const union = s.unionMap.get(school.union);
      if (!union) throw new Error(`[ডেটা ত্রুটি] শিক্ষা প্রতিষ্ঠান "${school.name}" এর ইউনিয়ন পাওয়া যায়নি`);
      return { lat: union.lat, lng: union.lng, approx: true };
    },

    /** একই ইউনিয়নের অন্য গ্রাম (নিজেকে বাদ দিয়ে), তথ্যসহ গ্রাম আগে */
    nearbyVillages: (village: Village, limit = 8) =>
      s.villages
        .filter((v) => v.union === village.union && v.slug !== village.slug)
        .sort((a, b) => (a.status === "stub" ? 1 : 0) - (b.status === "stub" ? 1 : 0))
        .slice(0, limit),
  };
}

export type Data = ReturnType<typeof makeData>;

/** সব পড়ার ফাংশন একসঙ্গে (প্রতি রিকোয়েস্টে একবার তৈরি হয়) */
export const data = cache(async (): Promise<Data> => makeData(await loadContent()));

import fs from "node:fs";
import path from "node:path";
import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import type { z } from "zod";
import { getSql, hasDatabase } from "./db";
import {
  emergencyFileSchema,
  eventItemSchema,
  formatIssues,
  newsPostSchema,
  personSchema,
  placeSchema,
  schoolSchema,
  schoolTypeSchema,
  unionSchema,
  villageSchema,
  type EmergencyFile,
  type EventItem,
  type NewsPost,
  type Person,
  type Place,
  type School,
  type Union,
  type Village,
} from "./schemas";

/**
 * কনটেন্ট লোডার (শুধু সার্ভারে চলে)।
 * DATABASE_URL থাকলে Neon ডেটাবেসের content_docs টেবিল থেকে পড়ে ("use cache", ট্যাগ "content")।
 * অ্যাডমিনে কিছু সেভ করলে updateTag("content") ডাকা হয়, তাই সঙ্গে সঙ্গে নতুন তথ্য দেখায়।
 * DATABASE_URL না থাকলে content/ ফোল্ডারের JSON ফাইল থেকে পড়ে: unions.json, places.json, people.json,
 * news.json, events.json, emergency.json, schools.json আর villages/<slug>.json (গ্রামপ্রতি একটি ফাইল)।
 */

export const contentDir = path.join(process.cwd(), "content");
export const villagesDir = path.join(contentDir, "villages");
/** content-এর cache ট্যাগ; অ্যাডমিন সেভের পর updateTag(CONTENT_TAG) */
export const CONTENT_TAG = "content";

export interface ContentStore {
  unions: Union[];
  villages: Village[];
  places: Place[];
  people: Person[];
  news: NewsPost[];
  events: EventItem[];
  emergency: EmergencyFile;
  schools: School[];
  unionMap: Map<string, Union>;
  villageMap: Map<string, Village>;
  placeMap: Map<string, Place>;
  personMap: Map<string, Person>;
  newsMap: Map<string, NewsPost>;
  eventMap: Map<string, EventItem>;
  schoolMap: Map<string, School>;
}

/** যাচাইয়ের আগের কাঁচা তথ্য; label দিয়ে ভুলের জায়গা দেখানো হয় */
interface RawDoc {
  label: string;
  data: unknown;
  /** গ্রামের ক্ষেত্রে: ফাইলের নাম বা ডেটাবেস key থেকে পাওয়া slug */
  slug?: string;
}

interface RawContent {
  unions: RawDoc;
  places: RawDoc;
  people: RawDoc;
  news: RawDoc;
  events: RawDoc;
  emergency: RawDoc;
  schools: RawDoc;
  villages: RawDoc[];
}

type CollectionKey = "unions" | "places" | "people" | "news" | "events" | "emergency" | "schools";

function fail(message: string): never {
  throw new Error(`[ডেটা ত্রুটি] ${message}`);
}

function parseDoc<T>(doc: RawDoc, schema: z.ZodType<T>): T {
  const parsed = schema.safeParse(doc.data);
  if (!parsed.success) fail(`${doc.label}: ${formatIssues(parsed.error)}`);
  return parsed.data;
}

function parseArray<T>(doc: RawDoc, itemSchema: z.ZodType<T>): T[] {
  if (!Array.isArray(doc.data)) fail(`${doc.label} একটি তালিকা (array) হওয়ার কথা`);
  return doc.data.map((item, index) => {
    const parsed = itemSchema.safeParse(item);
    if (!parsed.success) {
      const label = typeof item === "object" && item && "slug" in item ? String((item as { slug: unknown }).slug) : `#${index + 1}`;
      fail(`${doc.label} → ${label}: ${formatIssues(parsed.error)}`);
    }
    return parsed.data;
  });
}

/** একটা JSON ফাইল পড়ে যাচাই (অ্যাডমিনের ফাইল-মোডেও কাজে লাগে) */
export function readJsonFile<T>(file: string, schema: z.ZodType<T>): T {
  const label = path.relative(process.cwd(), file);
  let data: unknown;
  try {
    data = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    fail(`${label} পড়া যায়নি: ${(error as Error).message}`);
  }
  return parseDoc({ label, data }, schema);
}

function readRawFromFiles(): RawContent {
  const read = (name: string): RawDoc => {
    const file = path.join(contentDir, name);
    try {
      return { label: `content/${name}`, data: JSON.parse(fs.readFileSync(file, "utf8")) };
    } catch (error) {
      fail(`content/${name} পড়া যায়নি: ${(error as Error).message}`);
    }
  };
  const villageFiles = fs.existsSync(villagesDir) ? fs.readdirSync(villagesDir).filter((f) => f.endsWith(".json")) : [];
  return {
    unions: read("unions.json"),
    places: read("places.json"),
    people: read("people.json"),
    news: read("news.json"),
    events: read("events.json"),
    emergency: read("emergency.json"),
    schools: read("schools.json"),
    villages: villageFiles.map((f) => ({ ...read(`villages/${f}`), slug: f.replace(/\.json$/, "") })),
  };
}

/** ডেটাবেস থেকে সব তথ্য একবারে; ফল cache-এ থাকে, অ্যাডমিন সেভ বা এক ঘণ্টা পরে নতুন করে পড়া হয় */
async function readRawFromDb(): Promise<RawContent> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("hours");
  const rows = (await getSql()`select key, data from content_docs`) as { key: string; data: unknown }[];
  const byKey = new Map(rows.map((r) => [r.key, r.data]));
  const doc = (key: CollectionKey): RawDoc => {
    if (!byKey.has(key)) fail(`ডেটাবেসে "${key}" নেই। content/ ফোল্ডার থেকে তুলতে npm run db:push চালান।`);
    return { label: `ডেটাবেস: ${key}`, data: byKey.get(key) };
  };
  return {
    unions: doc("unions"),
    places: doc("places"),
    people: doc("people"),
    news: doc("news"),
    events: doc("events"),
    emergency: doc("emergency"),
    schools: doc("schools"),
    villages: rows
      .filter((r) => r.key.startsWith("village:"))
      .map((r) => ({ label: `ডেটাবেস: ${r.key}`, data: r.data, slug: r.key.slice("village:".length) })),
  };
}

function bnCompare(a: string, b: string): number {
  return a.localeCompare(b, "bn");
}

function buildStore(raw: RawContent): ContentStore {
  const unions = parseArray(raw.unions, unionSchema);
  const unionOrder = new Map(unions.map((u, i) => [u.slug, i]));

  const villages = raw.villages
    .map((doc) => {
      const village = parseDoc(doc, villageSchema);
      if (doc.slug && doc.slug !== village.slug) fail(`${doc.label}: নাম/চাবি (${doc.slug}) আর slug (${village.slug}) এক হতে হবে`);
      return village;
    })
    .sort((a, b) => {
      const byUnion = (unionOrder.get(a.union) ?? 99) - (unionOrder.get(b.union) ?? 99);
      if (byUnion !== 0) return byUnion;
      // ইউনিয়নের নামের গ্রাম আগে, তারপর বাংলা বর্ণানুক্রমে
      if (a.slug === a.union) return -1;
      if (b.slug === b.union) return 1;
      return bnCompare(a.name, b.name);
    });

  const places = parseArray(raw.places, placeSchema);
  const people = parseArray(raw.people, personSchema);
  const news = parseArray(raw.news, newsPostSchema).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const events = parseArray(raw.events, eventItemSchema);
  const emergency = parseDoc(raw.emergency, emergencyFileSchema);
  // ধরন অনুযায়ী (কলেজ আগে), তারপর বাংলা বর্ণানুক্রমে
  const typeRank = new Map(schoolTypeSchema.options.map((t, i) => [t, i]));
  const schools = parseArray(raw.schools, schoolSchema).sort(
    (a, b) => (typeRank.get(a.type) ?? 99) - (typeRank.get(b.type) ?? 99) || bnCompare(a.name, b.name),
  );

  const store: ContentStore = {
    unions,
    villages,
    places,
    people,
    news,
    events,
    emergency,
    schools,
    unionMap: new Map(unions.map((u) => [u.slug, u])),
    villageMap: new Map(villages.map((v) => [v.slug, v])),
    placeMap: new Map(places.map((p) => [p.slug, p])),
    personMap: new Map(people.map((p) => [p.slug, p])),
    newsMap: new Map(news.map((n) => [n.slug, n])),
    eventMap: new Map(events.map((e) => [e.slug, e])),
    schoolMap: new Map(schools.map((s) => [s.slug, s])),
  };
  validateRelations(store);
  return store;
}

/** slug-গুলো পরস্পরের সাথে মিলছে কি না (ভুল থাকলে build/রেন্ডার থেমে যায়, যাতে ভাঙা লিংক প্রকাশ না হয়) */
export function validateRelations(store: ContentStore): void {
  const dup = (items: { slug: string }[], label: string) => {
    const seen = new Set<string>();
    for (const item of items) {
      if (seen.has(item.slug)) fail(`${label} তালিকায় "${item.slug}" slug একাধিকবার আছে`);
      seen.add(item.slug);
    }
  };
  dup(store.unions, "ইউনিয়ন");
  dup(store.villages, "গ্রাম");
  dup(store.places, "স্থান");
  dup(store.people, "ব্যক্তি");
  dup(store.news, "খবর");
  dup(store.events, "আয়োজন");
  dup(store.schools, "শিক্ষা প্রতিষ্ঠান");

  for (const v of store.villages) {
    if (!store.unionMap.has(v.union)) fail(`গ্রাম "${v.name}" (${v.slug}) এর ইউনিয়ন "${v.union}" পাওয়া যায়নি`);
    for (const a of v.attractions ?? []) if (!store.placeMap.has(a)) fail(`গ্রাম "${v.name}" এর স্থান "${a}" দর্শনীয় স্থানের তালিকায় নেই`);
    for (const p of v.people ?? []) if (!store.personMap.has(p)) fail(`গ্রাম "${v.name}" এর ব্যক্তি "${p}" মানুষের তালিকায় নেই`);
  }
  for (const p of store.places) {
    if (!store.unionMap.has(p.union)) fail(`স্থান "${p.name}" এর ইউনিয়ন "${p.union}" পাওয়া যায়নি`);
    if (p.village && !store.villageMap.has(p.village)) fail(`স্থান "${p.name}" এর গ্রাম "${p.village}" পাওয়া যায়নি`);
  }
  for (const p of store.people) {
    if (p.union && !store.unionMap.has(p.union)) fail(`ব্যক্তি "${p.name}" এর ইউনিয়ন "${p.union}" পাওয়া যায়নি`);
    if (p.village && !store.villageMap.has(p.village)) fail(`ব্যক্তি "${p.name}" এর গ্রাম "${p.village}" পাওয়া যায়নি`);
  }
  for (const s of store.schools) {
    if (!store.unionMap.has(s.union)) fail(`শিক্ষা প্রতিষ্ঠান "${s.name}" এর ইউনিয়ন "${s.union}" পাওয়া যায়নি`);
    if (s.village && !store.villageMap.has(s.village)) fail(`শিক্ষা প্রতিষ্ঠান "${s.name}" এর গ্রাম "${s.village}" পাওয়া যায়নি`);
  }
  for (const e of store.events) {
    if (e.union && !store.unionMap.has(e.union)) fail(`আয়োজন "${e.title}" এর ইউনিয়ন "${e.union}" পাওয়া যায়নি`);
    if (e.village && !store.villageMap.has(e.village)) fail(`আয়োজন "${e.title}" এর গ্রাম "${e.village}" পাওয়া যায়নি`);
  }
}

/** সব তথ্য (প্রতি রিকোয়েস্টে একবার যাচাই হয়; ডেটাবেসের ফল "use cache"-এ থাকে) */
export const loadContent = cache(
  async (): Promise<ContentStore> => buildStore(hasDatabase() ? await readRawFromDb() : readRawFromFiles()),
);

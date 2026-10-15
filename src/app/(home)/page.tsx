import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bus,
  Camera,
  Drum,
  Home as HomeIcon,
  Landmark,
  MapPin,
  MessageSquareText,
  Phone,
  ScrollText,
  ShieldCheck,
  Users,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { EventCard, NewsCard, PersonPhoto, PlaceTypeBadge, placeTypeStyle } from "@/components/cards";
import { ScrollRow, Slides } from "@/components/carousel";
import { ContributeForm } from "@/components/contribute-form";
import { HeroScene } from "@/components/hero-scene";
import { JsonLd } from "@/components/json-ld";
import type { MapMarker } from "@/components/map/leaflet-map";
import type { EventItem } from "@/lib/types";
import { MapView } from "@/components/map/map-view";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Checklist, Container, IconTile, MoreLink, Section, type Tone } from "@/components/section";
import { site } from "@/data/site";
import { toBn } from "@/lib/bn";
import { withEventCover, withNewsCover, withPersonPhoto, withPlaceImages, withVillageImages } from "@/lib/images";
import { data, type Data } from "@/lib/data";

export const metadata: Metadata = {
  title: { absolute: `${site.name} | ${site.tagline}` },
};

/** public/images/hero.jpg থাকলে সেটি, না থাকলে আঁকা দৃশ্য */
function heroImage(): string | null {
  const file = path.join(process.cwd(), "public", "images", "hero.jpg");
  return fs.existsSync(file) ? "/images/hero.jpg" : null;
}

function placeLocation(db: Data, unionSlug: string, villageSlug?: string): string {
  const village = villageSlug ? db.getVillage(villageSlug) : undefined;
  return `${village ? `${village.name}, ` : ""}${db.unionName(unionSlug)} ইউনিয়ন`;
}

const h2 = "mt-3 text-[2.2rem] font-bold leading-[1.3] text-brand-900 sm:text-[2.6rem]";

/**
 * দর্শনীয় স্থানের স্লাইডের লেখা (হোমপেজের নিজস্ব; স্থানের পেজের লেখা content/places.json-এ)।
 * কোন স্থান দেখাবে তা ঠিক করে অ্যাডমিনের "হোমপেজে দেখান"; ক্রম এই তালিকা অনুযায়ী।
 * তালিকার বাইরের কোনো স্থান হোমপেজে এলে তার নিজের নাম আর সারসংক্ষেপ দেখায়।
 */
const placeHighlights: { slug: string; name: string; category: string; text: string; rows: [string, string][] }[] = [
  {
    slug: "guniauk-bagan-bari",
    name: "গুনিয়াউক বাগানবাড়ি",
    category: "ঐতিহাসিক",
    text: "নাসিরনগরের গুনিয়াউক গ্রামের প্রাচীন বাগানবাড়ি। পুরোনো স্থাপত্য ও স্থানীয় ইতিহাসের স্মৃতি বহন করে চলেছে এই ঐতিহ্যবাহী স্থানটি।",
    rows: [
      ["অবস্থান", "গুনিয়াউক, গুনিয়াউক ইউনিয়ন"],
      ["বিশেষত্ব", "প্রাচীন স্থাপত্য ও ঐতিহাসিক নিদর্শন"],
    ],
  },
  {
    slug: "kahetura-masjid",
    name: "কাহেতুরা মসজিদ",
    category: "ঐতিহাসিক ও ধর্মীয়",
    text: "কুন্ডা ইউনিয়নের কাহেতুরা গ্রামে অবস্থিত প্রাচীন এই মসজিদটি স্থানীয় ধর্মীয় ঐতিহ্যের অন্যতম নিদর্শন। এর সঙ্গে জড়িয়ে আছে গ্রামের ইতিহাস ও মানুষের স্মৃতি।",
    rows: [
      ["অবস্থান", "কাহেতুরা গ্রাম, কুন্ডা ইউনিয়ন, নাসিরনগর।"],
      ["বিশেষত্ব", "পুরোনো মসজিদ ও ধর্মীয় ঐতিহ্য"],
    ],
  },
  {
    slug: "gopinath-jiu-mandir",
    name: "শ্রীশ্রী গোপীনাথ জিউ মন্দির",
    category: "ধর্মীয়",
    text: "ফান্দাউক গ্রামের ঐতিহ্যবাহী শ্রীশ্রী গোপীনাথ জিউ মন্দির স্থানীয় সনাতন ধর্মাবলম্বীদের একটি গুরুত্বপূর্ণ উপাসনালয়। ধর্মীয় উৎসব ও পূজার সময় মন্দিরটি ভক্তদের মিলনস্থলে পরিণত হয়।",
    rows: [
      ["অবস্থান", "ফান্দাউক, ফান্দাউক ইউনিয়ন"],
      ["বিশেষত্ব", "ধর্মীয় উৎসব, পূজা ও ঐতিহ্য"],
    ],
  },
  {
    slug: "medir-haor-mini-coxsbazar",
    name: "মেদির হাওর (মিনি কক্সবাজার)",
    category: "প্রাকৃতিক",
    text: "গোয়ালনগরের মেদির হাওর বর্ষাকালে জলরাশিতে অপরূপ রূপ ধারণ করে। দিগন্তজোড়া পানি, খোলা আকাশ ও মনোমুগ্ধকর পরিবেশ প্রকৃতিপ্রেমীদের আকর্ষণ করে।",
    rows: [
      ["অবস্থান", "গোয়ালনগর, গোয়ালনগর ইউনিয়ন"],
      ["বিশেষত্ব", "হাওরের সৌন্দর্য, নৌভ্রমণ ও প্রাকৃতিক দৃশ্য"],
      ["ভ্রমণের উপযুক্ত সময়", "বর্ষাকাল (জুন–সেপ্টেম্বর)"],
    ],
  },
  {
    slug: "gokarna-nawab-bari",
    name: "গোকর্ণ নবাববাড়ি",
    category: "ঐতিহাসিক",
    text: "গোকর্ণ গ্রামের ঐতিহাসিক নবাববাড়ি নাসিরনগরের অতীত ঐতিহ্যের স্মারক। প্রাচীন স্থাপত্য ও স্থানীয় ইতিহাসের সঙ্গে জড়িয়ে রয়েছে এই বাড়ির পরিচিতি।",
    rows: [
      ["অবস্থান", "গোকর্ণ, গোকর্ণ ইউনিয়ন"],
      ["বিশেষত্ব", "ঐতিহাসিক বাড়ি ও প্রাচীন স্থাপত্য"],
    ],
  },
  {
    slug: "haripur-barabari",
    name: "হরিপুর বড়বাড়ি (জমিদারবাড়ি)",
    category: "ঐতিহাসিক",
    text: "তিতাস নদীর তীরে অবস্থিত হরিপুর বড়বাড়ি নাসিরনগরের অন্যতম পরিচিত ঐতিহাসিক স্থাপনা। প্রাচীন স্থাপত্যশৈলী ও নদীতীরের মনোরম পরিবেশ এই জমিদারবাড়িকে দিয়েছে স্বতন্ত্র পরিচয়।",
    rows: [
      ["অবস্থান", "হরিপুর, হরিপুর ইউনিয়ন"],
      ["বিশেষত্ব", "জমিদারবাড়ির স্থাপত্য ও তিতাস নদীর সৌন্দর্য"],
    ],
  },
];

/**
 * "খবর ও আয়োজন" সেকশনের উৎসবের কার্ডের লেখা (হোমপেজের নিজস্ব; উৎসবের পেজের পুরো বিবরণ content/events.json-এ)।
 * খবরের কার্ড সরাসরি content/news.json থেকে আসে।
 */
const eventHighlights: Record<string, { title: string; category: string; when: string; text: string }> = {
  "rath-jatra": {
    title: "রথযাত্রা উৎসব",
    category: "ধর্মীয় উৎসব",
    when: "আষাঢ় মাস (জুন–জুলাই), প্রতিবছর",
    text: "নাসিরনগরের সনাতন ধর্মাবলম্বীদের অন্যতম ধর্মীয় আয়োজন রথযাত্রা। পূজা, ভক্তিমূলক অনুষ্ঠান ও ধর্মীয় আনুষ্ঠানিকতার মধ্য দিয়ে এই উৎসব উদ্‌যাপিত হয়।",
  },
  "boishakhi-mela": {
    title: "পহেলা বৈশাখ ও গ্রামীণ মেলা",
    category: "ঐতিহ্যবাহী উৎসব",
    when: "১৪ এপ্রিল, প্রতিবছর",
    text: "বাংলা নববর্ষকে ঘিরে নাসিরনগরের বিভিন্ন এলাকায় উৎসবমুখর পরিবেশ তৈরি হয়। বৈশাখী মেলা, গ্রামীণ খেলাধুলা, লোকজ সংস্কৃতি ও নানা আয়োজনে ফুটে ওঠে বাংলার চিরায়ত ঐতিহ্য।",
  },
};

/** হোমপেজের উৎসবের কার্ড: তালিকায় লেখা থাকলে সেটা, না থাকলে উৎসবের নিজের লেখা */
function HomeEventCard({ event }: { event: EventItem }) {
  const h = eventHighlights[event.slug];
  if (!h) return <EventCard event={event} fullText />;
  return <EventCard event={{ ...event, title: h.title, when: h.when, description: h.text }} pill={h.category} fullText />;
}

/** স্লাইডের ক্রম: তালিকায় থাকলে তার জায়গা, না থাকলে শেষে */
function highlightRank(slug: string): number {
  const i = placeHighlights.findIndex((h) => h.slug === slug);
  return i < 0 ? placeHighlights.length : i;
}

/** রঙিন প্যানেলের গাঢ় রং (রেফারেন্সের কেস-স্টাডি ও প্রসেস ব্লকের মতো) */
const solidBg: Record<Tone, string> = {
  accent: "bg-accent-500",
  azure: "bg-azure-500",
  iris: "bg-iris-500",
  sky: "bg-sky-500",
  sunny: "bg-sunny-500",
};
const toneText: Record<Tone, string> = {
  accent: "text-accent-500",
  azure: "text-azure-500",
  iris: "text-iris-500",
  sky: "text-sky-500",
  sunny: "text-[#c99000]",
};

/** হোমপেজের "কেস স্টাডি" অংশে যে গ্রামগুলো আগে দেখাবে */
/**
 * "গ্রামের কথা" সেকশনের কার্ডের লেখা (হোমপেজের নিজস্ব; গ্রামের পেজের লেখা content/villages-এ)।
 * কার্ড আসে এই ক্রমে; চারটির কম হলে বাকি জায়গা লেখা থাকা অন্য গ্রাম দিয়ে ভরে।
 */
const villageHighlights: { slug: string; title: string; text: string }[] = [
  {
    slug: "haripur",
    title: "তিতাসের পাড়ে ইতিহাস ও ঐতিহ্যের হরিপুর",
    text: "তিতাস নদীর তীরে গড়ে ওঠা হরিপুর গ্রাম নাসিরনগরের ঐতিহ্যবাহী জনপদগুলোর একটি। প্রাচীন জমিদারবাড়ি, নদীকেন্দ্রিক জীবনযাত্রা ও গ্রামীণ সংস্কৃতি এই গ্রামের পরিচয়ের সঙ্গে মিশে আছে।",
  },
  {
    slug: "gokarna",
    title: "নবাববাড়ির স্মৃতি বুকে নিয়ে গোকর্ণ গ্রাম",
    text: "ঐতিহাসিক নবাববাড়ির জন্য পরিচিত গোকর্ণ গ্রাম। পুরোনো স্থাপত্য, স্থানীয় লোককথা এবং প্রজন্মের পর প্রজন্ম ধরে চলে আসা ঐতিহ্য এই গ্রামকে দিয়েছে আলাদা পরিচয়।",
  },
  {
    slug: "goalnagar",
    title: "হাওরের জলরাশিতে ঘেরা গোয়ালনগরের গল্প",
    text: "মেদির হাওরের সৌন্দর্যে সমৃদ্ধ গোয়ালনগর। বর্ষায় দিগন্তজোড়া পানি আর শুষ্ক মৌসুমে সবুজ মাঠ—প্রকৃতির এই পরিবর্তনের সঙ্গে জড়িয়ে আছে এখানকার মানুষের জীবন ও জীবিকা।",
  },
  {
    slug: "chatalpar",
    title: "মেঘনার পাড়ে গড়ে ওঠা চাতলপাড়ের জীবন",
    text: "নদী, কৃষি ও গ্রামীণ জীবনধারার সঙ্গে জড়িয়ে আছে চাতলপাড়ের পরিচয়। মেঘনার কাছাকাছি এই জনপদের মানুষের জীবনযাত্রা, স্থানীয় বাজার ও সংস্কৃতিতে ফুটে ওঠে গ্রামের নিজস্ব বৈশিষ্ট্য।",
  },
];
const spotlightVillageSlugs = villageHighlights.map((v) => v.slug);

export default async function HomePage() {
  const db = await data();
  const stats = db.getStats();
  const hero = heroImage();
  const unions = db.getUnions();
  const places = [...db.featuredPlaces()]
    .sort((a, b) => highlightRank(a.slug) - highlightRank(b.slug))
    .slice(0, 6)
    .map(withPlaceImages);
  const people = await Promise.all(db.getPeople().slice(0, 6).map(withPersonPhoto));
  const news = db.getNewsList().slice(0, 2).map(withNewsCover);
  const events = db.getEvents().slice(0, 2).map(withEventCover);
  const withInfo = db.villagesWithInfo();
  const featuredVillages = [
    ...spotlightVillageSlugs.map((s) => withInfo.find((v) => v.slug === s)).filter((v) => v !== undefined),
    ...withInfo.filter((v) => !spotlightVillageSlugs.includes(v.slug)),
  ]
    .filter((v) => v.tagline)
    .slice(0, 4)
    .map(withVillageImages);
  // ইতিহাসের সেকশনের চারটি কার্ড (হোমপেজের নিজস্ব লেখা; উপজেলা পেজের টাইমলাইন upazila.ts-এ)
  const milestones = [
    {
      year: "১৭৬৫",
      title: "ইস্ট ইন্ডিয়া কোম্পানির শাসন",
      text: "ইস্ট ইন্ডিয়া কোম্পানির দেওয়ানি লাভের মধ্য দিয়ে এ অঞ্চলে ঔপনিবেশিক শাসনের নতুন অধ্যায় শুরু হয়।",
    },
    {
      year: "১৮৬০",
      title: "নাসিরনগর মহকুমা",
      text: "তৎকালীন প্রশাসনিক কাঠামোতে নাসিরনগর মহকুমা গঠিত হয়, যা পরবর্তীতে ব্রাহ্মণবাড়িয়ার সঙ্গে যুক্ত হয়।",
    },
    {
      year: "১৯১০",
      title: "নাসিরনগর থানা",
      text: "এ অঞ্চলের আইনশৃঙ্খলা ও প্রশাসনিক কার্যক্রম পরিচালনার জন্য নাসিরনগর থানা প্রতিষ্ঠিত হয়।",
    },
    {
      year: "১৯৮৩",
      title: "উপজেলায় রূপান্তর",
      text: "প্রশাসনিক পুনর্গঠনের ধারাবাহিকতায় নাসিরনগর থানা উপজেলায় উন্নীত হয়।",
    },
  ];
  const base = site.url.replace(/\/$/, "");

  const unionMarkers: MapMarker[] = unions.map((u) => ({
    lat: u.lat,
    lng: u.lng,
    label: `${u.name} ইউনিয়ন`,
    sub: `${toBn(db.villagesOfUnion(u.slug).length)}টি গ্রাম`,
    href: `/unions/${u.slug}`,
    kind: "union",
  }));

  // হিরোর নিচের প্যানেলের ডান পাশ: প্রতিটা ঘর সংশ্লিষ্ট পেজে নিয়ে যায়
  const figures: { href: string; icon: LucideIcon; tint: string; value: string; label: string }[] = [
    { href: "/unions", icon: Landmark, tint: "bg-iris-50 text-iris-500", value: `${toBn(stats.unions)}টি`, label: "ইউনিয়ন" },
    { href: "/villages", icon: HomeIcon, tint: "bg-sunny-50 text-[#c99000]", value: "গ্রামসমূহ", label: "গ্রামের পরিচিতি" },
    { href: "/upazila#history", icon: ScrollText, tint: "bg-azure-50 text-azure-500", value: "ইতিহাস", label: "ঐতিহাসিক নিদর্শন" },
    { href: "/events", icon: Drum, tint: "bg-accent-50 text-accent-500", value: "ঐতিহ্য", label: "সংস্কৃতি ও ঐতিহ্য" },
    { href: "/places", icon: Camera, tint: "bg-iris-50 text-iris-500", value: "দর্শনীয় স্থান", label: "পর্যটন আকর্ষণ" },
    { href: "/places#nature", icon: Waves, tint: "bg-sky-50 text-sky-500", value: "হাওর ও প্রকৃতি", label: "প্রাকৃতিক সৌন্দর্য" },
  ];

  // মানচিত্র সেকশনে চার দিকের সীমানা
  const borders: { dir: string; icon: LucideIcon; text: string }[] = [
    { dir: "উত্তরে", icon: ArrowUp, text: "লাখাই ও অষ্টগ্রাম উপজেলা" },
    { dir: "দক্ষিণে", icon: ArrowDown, text: "সরাইল ও বিজয়নগর উপজেলা" },
    { dir: "পূর্বে", icon: ArrowRight, text: "মাধবপুর উপজেলা" },
    { dir: "পশ্চিমে", icon: ArrowLeft, text: "মেঘনা নদী, বাজিতপুর ও অষ্টগ্রাম উপজেলা।" },
  ];

  const features: { href: string; icon: LucideIcon; tone: Tone; title: string; text: string; cta: string }[] = [
    {
      href: "/villages",
      icon: HomeIcon,
      tone: "accent",
      title: "নাসিরনগরের প্রতিটি গ্রাম",
      text: "নাসিরনগরের প্রতিটি গ্রামের ইতিহাস, ঐতিহ্য, সংস্কৃতি ও মানুষের জীবনযাত্রার গল্প জানুন। আবিষ্কার করুন গ্রামের পরিচিতি, অবস্থান এবং অজানা সব তথ্য।",
      cta: "গ্রাম খুঁজুন",
    },
    {
      href: "/places",
      icon: Camera,
      tone: "azure",
      title: "দর্শনীয় স্থান ও প্রাকৃতিক সৌন্দর্য",
      text: "হাওর, নদী, ঐতিহাসিক স্থাপনা ও প্রাকৃতিক সৌন্দর্যে ঘেরা নাসিরনগরের দর্শনীয় স্থানগুলো আবিষ্কার করুন। জানুন প্রতিটি স্থানের ইতিহাস ও বিশেষত্ব।",
      cta: "ঘুরে দেখুন",
    },
    {
      href: "/unions",
      icon: Landmark,
      tone: "iris",
      title: `${toBn(stats.unions)}টি ইউনিয়ন`,
      text: "১৩টি ইউনিয়নের গ্রাম, ইতিহাস, অবস্থান, গুরুত্বপূর্ণ প্রতিষ্ঠান ও স্থানীয় পরিচিতি এক জায়গায় দেখুন।",
      cta: "ইউনিয়ন দেখুন",
    },
    {
      href: "/people",
      icon: Users,
      tone: "sunny",
      title: "বিশিষ্ট ব্যক্তি",
      text: "ইতিহাসে অবদান রাখা রাজনীতিবিদ, শিক্ষাবিদ, মুক্তিযোদ্ধা ও সমাজসেবকসহ নাসিরনগরের কৃতী মানুষদের পরিচয় জানুন।",
      cta: "পরিচয় পড়ুন",
    },
    {
      href: "/transport",
      icon: Bus,
      tone: "sky",
      title: "যাতায়াত গাইড",
      text: "নাসিরনগরে আসার প্রধান সড়ক ও নৌপথ, স্থানীয় যানবাহন এবং যাতায়াতের প্রয়োজনীয় তথ্য জেনে নিন।",
      cta: "পথ দেখুন",
    },
    {
      href: "/emergency",
      icon: Phone,
      tone: "accent",
      title: "জরুরি নম্বর",
      text: "জরুরি পরিস্থিতিতে কাজে আসতে পারে এমন জাতীয় হেল্পলাইন, হাসপাতাল, থানা ও অন্যান্য সেবার যোগাযোগের তথ্য দেখুন।",
      cta: "নম্বর দেখুন",
    },
  ];

  const placeSlides = places.map((p) => {
    const s = placeTypeStyle[p.type];
    const Icon = s.icon;
    const h = placeHighlights.find((x) => x.slug === p.slug);
    const items = h
      ? h.rows.map(([k, v]) => (
          <span key={k}>
            <span className="font-bold">{k}:</span> <span className="font-normal text-ink-500">{v}</span>
          </span>
        ))
      : [placeLocation(db, p.union, p.village), p.bestTime ? `কখন যাবেন: ${p.bestTime}` : null, p.tips?.[0] ?? null]
          .filter((t): t is string => t !== null)
          .map((t) => (
            <span key={t} className="line-clamp-2">
              {t}
            </span>
          ));
    return (
      <div key={p.slug} className="relative">
        <div
          className={`relative z-10 mx-auto aspect-[384/364] w-full max-w-[384px] overflow-hidden rounded-[50px] ${solidBg[s.tone]} lg:absolute lg:left-0 lg:top-1/2 lg:mx-0 lg:w-[384px] lg:-translate-y-1/2`}
        >
          {p.cover ? (
            <Image src={p.cover} alt={p.name} fill sizes="384px" className="object-cover" />
          ) : (
            <div className="absolute inset-0" aria-hidden="true">
              <div className="absolute left-[10%] top-[12%] flex h-[56%] w-[52%] -rotate-6 flex-col justify-between rounded-[28px] bg-white p-5 shadow-lift">
                <Icon className={`h-10 w-10 ${toneText[s.tone]}`} />
                <div className="space-y-2">
                  <div className="h-2.5 w-4/5 rounded-full bg-brand-100" />
                  <div className="h-2.5 w-3/5 rounded-full bg-brand-100" />
                  <div className="h-2.5 w-2/3 rounded-full bg-brand-100" />
                </div>
              </div>
              <div className="absolute bottom-[12%] right-[9%] flex h-[48%] w-[46%] rotate-3 flex-col justify-center gap-3 rounded-[28px] bg-white p-5 shadow-lift">
                <MapPin className="h-7 w-7 text-accent-500" />
                <p className="text-[0.95rem] font-bold leading-snug text-brand-900">{db.unionName(p.union)} ইউনিয়ন</p>
              </div>
            </div>
          )}
        </div>
        <div className="relative -mt-16 rounded-[40px] border border-line bg-white px-7 pb-10 pt-24 shadow-card sm:px-10 lg:ml-48 lg:mt-0 lg:min-h-[466px] lg:py-20 lg:pl-60 lg:pr-16">
          <PlaceTypeBadge type={p.type} label={h?.category} />
          <h3 className="mt-4 text-[1.9rem] font-bold leading-snug text-brand-900">{h?.name ?? p.name}</h3>
          <p className={`mt-3 text-lg leading-relaxed text-ink-500 ${h ? "" : "line-clamp-3"}`}>{h?.text ?? p.summary}</p>
          {items.length > 0 && (
            <div className="mt-6">
              <Checklist items={items} tone="iris" />
            </div>
          )}
          <MoreLink href={`/places/${p.slug}`} label="বিস্তারিত দেখুন" className="mt-8" />
        </div>
      </div>
    );
  });

  const personSlides = people.map((p) => {
    return (
      <div
        key={p.slug}
        className="mx-auto grid max-w-[1000px] grid-cols-1 items-center gap-10 rounded-[40px] border border-line bg-white p-8 shadow-card sm:p-14 lg:grid-cols-[1.35fr_1fr]"
      >
        <div>
          <p className="inline-flex items-center gap-3 text-[1.15rem] font-bold text-brand-900">
            <span className="flex gap-1" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-iris-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-accent-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-sunny-500" />
            </span>
            {p.category}
          </p>
          <h3 className="mt-5 text-[1.9rem] font-bold leading-snug text-brand-900">{p.name}</h3>
          <p className="mt-4 text-lg leading-relaxed text-ink-500">{p.summary}</p>
          <p className="mt-8 font-bold text-brand-900">{p.years ?? "নাসিরনগরের কৃতী সন্তান"}</p>
          {p.union && <p className="text-accent-600">{db.unionName(p.union)} ইউনিয়ন</p>}
        </div>
        <div className="flex justify-center">
          <PersonPhoto person={p} size="large" />
        </div>
      </div>
    );
  });

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: site.name,
          url: base,
          description: site.description,
          inLanguage: "bn",
          potentialAction: {
            "@type": "SearchAction",
            target: { "@type": "EntryPoint", urlTemplate: `${base}/villages?q={search_term_string}` },
            "query-input": "required name=search_term_string",
          },
        }}
      />

      {/* হিরো: পুরো চওড়া হাওরের ছবি, ওপরে লেখা ও বোতাম (টাইপোগ্রাফি রেফারেন্সের মতো) */}
      <section className="relative isolate overflow-hidden bg-brand-950">
        <div className="absolute inset-0 -z-10">
          {hero ? (
            <Image
              src={hero}
              alt="নাসিরনগরের হাওরে সূর্যাস্ত"
              fill
              priority
              sizes="100vw"
              className="object-cover object-[46%_center]"
            />
          ) : (
            <HeroScene className="h-full w-full" />
          )}
        </div>
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-brand-950/85 via-brand-950/50 to-brand-950/10" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-linear-to-t from-brand-950/60 to-transparent" aria-hidden="true" />

        <Container className="flex min-h-[max(640px,min(calc(100svh_-_6rem),840px))] items-center pb-44 pt-20 sm:pb-52">
          <Stagger className="max-w-3xl">
            <StaggerItem>
              <p className="section-eyebrow text-white">নাসিরনগর, ব্রাহ্মণবাড়িয়া</p>
            </StaggerItem>
            <StaggerItem>
              {/* বড় পর্দায় ঠিক দুই লাইনে; মোবাইলে স্বাভাবিকভাবে ভাঙে */}
              <h1 className="mt-5 text-[2.6rem] font-bold leading-[1.2] text-white sm:text-[3.4rem] lg:text-[3.75rem]">
                <span className="sm:block">হাওর-বেষ্টিত নাসিরনগরের</span>{" "}
                <span className="sm:block">প্রতিটি গ্রামের গল্প জানুন</span>
              </h1>
            </StaggerItem>
            <StaggerItem>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl">
                হাওর, প্রকৃতি, ইতিহাস, ঐতিহ্য ও সংস্কৃতিতে সমৃদ্ধ নাসিরনগর। এই জনপদের প্রতিটি গ্রামের অজানা গল্প, দর্শনীয় স্থান, মানুষের
                জীবনযাত্রা ও ঐতিহ্যের নানা তথ্য জানুন এক প্ল্যাটফর্মেই।
              </p>
            </StaggerItem>
            <StaggerItem>
              {/* ফোনে বোতাম দুটো পুরো চওড়া, একটার নিচে আরেকটা */}
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-5">
                <Link href="/villages" className="c-btn c-btn--solid c-btn--lg w-full sm:w-auto">
                  গ্রাম খুঁজুন
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Link>
                <Link href="/places" className="c-btn c-btn--outline c-btn--lg w-full sm:w-auto">
                  দর্শনীয় স্থান
                </Link>
              </div>
            </StaggerItem>
          </Stagger>
        </Container>
        {hero && (
          <p className="absolute right-5 top-6 hidden items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/25 backdrop-blur sm:right-8 sm:inline-flex">
            <MapPin className="h-4 w-4 text-accent-300" aria-hidden="true" />
            হাওরে সূর্যাস্ত
          </p>
        )}
      </section>

      {/* এক নজরে: হিরোর ছবি আর ল্যাভেন্ডার পটভূমির সীমানায় বসানো প্যানেল */}
      <section className="relative z-10 -mt-24 bg-[linear-gradient(to_bottom,transparent_6rem,#f5f7fc_6rem)] sm:-mt-32 sm:bg-[linear-gradient(to_bottom,transparent_8rem,#f5f7fc_8rem)]">
        <Container>
          <div className="grid grid-cols-1 items-center gap-10 rounded-[44px] bg-white px-7 py-12 shadow-panel sm:px-14 lg:grid-cols-[1.1fr_2fr] lg:gap-14 lg:py-16">
            <p className="max-w-md text-lg leading-relaxed text-ink-500">
              ব্রাহ্মণবাড়িয়া জেলার হাওর-বেষ্টিত ঐতিহ্যবাহী উপজেলা নাসিরনগর। প্রাকৃতিক সৌন্দর্য, সমৃদ্ধ ইতিহাস, গ্রামীণ সংস্কৃতি ও মানুষের
              জীবনযাত্রায় গড়ে উঠেছে এই জনপদের অনন্য পরিচয়।
            </p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-9">
              {figures.map((f) => (
                <li key={f.href}>
                  <Link href={f.href} className="group flex items-center gap-3 sm:gap-4">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:-translate-y-0.5 sm:h-12 sm:w-12 sm:rounded-2xl ${f.tint}`}
                      aria-hidden="true"
                    >
                      <f.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[1.15rem] font-bold leading-tight text-brand-900 transition-colors group-hover:text-accent-600 sm:text-[1.35rem]">
                        {f.value}
                      </span>
                      <span className="mt-0.5 block text-[0.85rem] leading-snug text-ink-500 sm:text-[0.95rem]">{f.label}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* যা পাবেন: আড়াআড়ি কার্ডের সারি */}
      <Section tone="tint" flushTop>
        <ScrollRow
          label="ওয়েবসাইটে যা পাবেন"
          header={
            <div className="max-w-2xl">
              <p className="section-eyebrow">এখানে যা পাবেন</p>
              <h2 className={h2}>নাসিরনগরকে জানুন আরও কাছ থেকে</h2>
            </div>
          }
        >
          {features.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="group flex w-[85%] shrink-0 snap-start flex-col gap-6 rounded-[44px] border border-line bg-white p-8 shadow-card transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lift sm:w-[calc(50%-1rem)] sm:p-10 xl:flex-row"
            >
              <IconTile icon={f.icon} tone={f.tone} />
              <div>
                <h3 className="text-[1.6rem] font-bold leading-snug text-brand-900">{f.title}</h3>
                <p className="mt-3 leading-relaxed text-ink-500">{f.text}</p>
                <span className="mt-6 inline-flex items-center gap-2 font-bold text-brand-900 transition-colors group-hover:text-accent-600">
                  {f.cta}
                  <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </ScrollRow>
      </Section>

      {/* কোথায় নাসিরনগর: বাঁয়ে মানচিত্র, ডানে অবস্থান আর চার দিকের সীমানা */}
      <Section>
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-20">
          <div className="relative">
            <div
              className="pointer-events-none absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgba(106,53,255,0.12),rgba(0,160,255,0.08)_45%,transparent_70%)] blur-2xl"
              aria-hidden="true"
            />
            <div className="relative rounded-[40px] border border-line bg-white p-3 shadow-panel">
              <MapView center={[site.upazila.lat, site.upazila.lng]} zoom={10} markers={unionMarkers} className="h-[360px] w-full sm:h-[480px]" />
            </div>
          </div>
          <div>
            <p className="section-eyebrow">ভৌগোলিক অবস্থান</p>
            <h2 className={h2}>মানচিত্রে নাসিরনগরের অবস্থান</h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-500">
              ব্রাহ্মণবাড়িয়া জেলা সদর থেকে প্রায় {toBn(site.upazila.distanceFromDistrictKm)} কিলোমিটার উত্তরে অবস্থিত হাওর-বেষ্টিত নাসিরনগর
              উপজেলা। এর চারপাশে রয়েছে হবিগঞ্জ ও কিশোরগঞ্জ জেলার বিভিন্ন উপজেলা এবং মেঘনা ও বলভদ্রা নদী।
            </p>
            <ul className="mt-8 space-y-4">
              {borders.map((b) => (
                <li key={b.dir} className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-50 text-accent-500" aria-hidden="true">
                    <b.icon className="h-[18px] w-[18px]" />
                  </span>
                  <p className="text-lg leading-relaxed text-ink-500">
                    <span className="font-bold text-brand-900">{b.dir}:</span> {b.text}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <Link href="/map" className="c-btn c-btn--solid">
                মানচিত্র দেখুন
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <Container>
        <div className="border-t border-line" />
      </Container>

      {/* উপজেলা পরিচিতি: বাঁয়ে লেখা, ডানে ইতিহাসের কার্ড */}
      <Section>
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="section-eyebrow">ইতিহাসের পাতায় নাসিরনগর</p>
            <h2 className={h2}>ঐতিহ্য ও ইতিহাসে সমৃদ্ধ নাসিরনগর</h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-500">
              হাওর-বেষ্টিত নাসিরনগরের রয়েছে সমৃদ্ধ ইতিহাস ও ঐতিহ্য। একসময় মহকুমা হিসেবে পরিচিত এই জনপদ সময়ের বিবর্তনে আজকের নাসিরনগর
              উপজেলা। প্রশাসনিক পরিবর্তন, ঐতিহাসিক ঘটনাপ্রবাহ ও স্থানীয় সংস্কৃতির মধ্য দিয়ে গড়ে উঠেছে নাসিরনগরের নিজস্ব পরিচয়।
            </p>
            <Link href="/upazila" className="c-btn c-btn--solid mt-10">
              পুরো ইতিহাস পড়ুন
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
          <div className="relative pb-10">
            <div
              className="pointer-events-none absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgba(255,57,81,0.12),rgba(255,198,50,0.12)_45%,transparent_70%)] blur-2xl"
              aria-hidden="true"
            />
            <ol className="relative grid grid-cols-1 gap-5 min-[480px]:grid-cols-2">
              {milestones.map((m, i) => (
                <li key={m.year} className={`rounded-[28px] border border-line bg-white p-6 shadow-card ${i % 2 === 1 ? "min-[480px]:translate-y-10" : ""}`}>
                  <span className="flex gap-1.5" aria-hidden="true">
                    <span className="h-2.5 w-2.5 rounded-full bg-accent-500" />
                    <span className="h-2.5 w-2.5 rounded-full bg-sunny-500" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#4ade80]" />
                  </span>
                  <p className="mt-4 text-[2.2rem] font-bold leading-none text-brand-900">{m.year}</p>
                  <p className="mt-2 font-bold text-accent-600">{m.title}</p>
                  <p className="mt-2 text-[0.98rem] leading-relaxed text-ink-500">{m.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      {/* দর্শনীয় স্থান: একবারে একটি করে স্লাইড */}
      <Section tone="tint" align="center" eyebrow="ঐতিহ্য ও প্রকৃতি" title="নাসিরনগরে ঘুরে দেখার মতো স্থান">
        <Slides slides={placeSlides} label="দর্শনীয় স্থান" />
        <div className="mt-12 flex justify-center">
          <Link href="/places" className="c-btn c-btn--solid c-btn--lg">
            সব {toBn(stats.places)}টি জায়গা দেখুন
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </Section>

      {/* গ্রাম পরিচিতি: রঙিন মাথাসহ বড় কার্ড */}
      <Section>
        <div className="mb-14 grid grid-cols-1 items-end gap-8 lg:grid-cols-2">
          <div>
            <p className="section-eyebrow">গ্রামের কথা</p>
            <h2 className={h2}>নাসিরনগরের গ্রামে গ্রামে ছড়িয়ে থাকা গল্প</h2>
          </div>
          <p className="text-lg leading-relaxed text-ink-500 lg:max-w-lg lg:justify-self-end">
            নাসিরনগরের প্রতিটি গ্রামের রয়েছে নিজস্ব ইতিহাস, ঐতিহ্য ও পরিচয়। ইতিমধ্যে সংরক্ষিত হয়েছে {toBn(stats.villagesWithInfo)}টি গ্রামের গল্প।
            আপনার গ্রামের ইতিহাস, স্মৃতি ও অজানা তথ্য তুলে ধরতে আপনিও অংশ নিতে পারেন।
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {featuredVillages.map((v, i) => {
            const tone = (["azure", "sky", "iris", "accent"] as Tone[])[i % 4];
            const h = villageHighlights.find((x) => x.slug === v.slug);
            const text = h?.text ?? v.description;
            return (
              <Link
                key={v.slug}
                href={`/villages/${v.slug}`}
                className="group overflow-hidden rounded-[40px] border border-line bg-white shadow-card transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <div className={`relative flex h-56 items-center justify-center sm:h-72 ${solidBg[tone]}`}>
                  {v.cover ? (
                    <Image src={v.cover} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                  ) : (
                    <span className="flex items-center gap-4 px-6 text-white">
                      <MapPin className="h-11 w-11 shrink-0" strokeWidth={2.4} aria-hidden="true" />
                      <span className="text-[2.6rem] font-bold leading-none sm:text-[3.3rem]">{v.name}</span>
                    </span>
                  )}
                </div>
                <div className="p-8 sm:p-10">
                  <p className="font-bold text-accent-600">{db.unionName(v.union)} ইউনিয়ন</p>
                  <h3 className="mt-2 text-[1.55rem] font-bold leading-snug text-brand-900 transition-colors group-hover:text-accent-600">
                    {h?.title ?? v.tagline}
                  </h3>
                  {text && <p className={`mt-3 leading-relaxed text-ink-500 ${h ? "" : "line-clamp-2"}`}>{text}</p>}
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mt-14 flex flex-wrap justify-center gap-5">
          <Link href="/contribute" className="c-btn c-btn--solid c-btn--lg">
            আপনার গ্রামের গল্প লিখুন
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Link href="/villages" className="c-btn c-btn--outline c-btn--lg">
            সব গ্রামের গল্প দেখুন
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </Section>

      {/* বিশিষ্ট ব্যক্তি: রেফারেন্সের টেস্টিমোনিয়াল স্লাইডের মতো */}
      <Section tone="tint" align="center" eyebrow="আমাদের কৃতী সন্তান" title="যাঁদের অবদানে গর্বিত নাসিরনগর">
        <Slides slides={personSlides} label="বিশিষ্ট ব্যক্তি" />
        <div className="mt-12 flex justify-center">
          <Link href="/people" className="c-btn c-btn--solid c-btn--lg">সব কৃতী ব্যক্তিত্ব দেখুন<ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </Section>

      {/* খবর ও উৎসব */}
      <Section>
        <div className="mb-14 flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-2xl">
            <p className="section-eyebrow">খবর ও আয়োজন</p>
            <h2 className={h2}>নাসিরনগরের খবর, ঐতিহ্য ও উৎসব</h2>
          </div>
          <Link href="/news" className="c-btn c-btn--outline c-btn--lg">
            সব খবর দেখুন
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {news[0] && <NewsCard post={news[0]} fullText />}
          {events[0] && <HomeEventCard event={events[0]} />}
          {news[1] && <NewsCard post={news[1]} fullText />}
          {events[1] && <HomeEventCard event={events[1]} />}
        </div>
      </Section>

      <Container>
        <div className="border-t border-line" />
      </Container>

      {/* তথ্য দিন: বাঁয়ে আহ্বান, ডানে ফর্মের কার্ড */}
      <section id="contribute" className="relative overflow-hidden bg-white py-24 sm:py-32">
        <div
          className="pointer-events-none absolute -right-40 bottom-0 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(255,57,81,0.1),rgba(255,198,50,0.1)_45%,transparent_70%)] blur-2xl"
          aria-hidden="true"
        />
        <Container className="relative grid grid-cols-1 items-center gap-16 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <div>
            <p className="text-[1.125rem] font-bold text-accent-600">আপনার তথ্য, আমাদের ঐতিহ্য</p>
            <h2 className={h2}>আপনার গ্রামের তথ্য তুলে ধরুন সবার সামনে</h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-500">
              নাসিরনগরের প্রতিটি গ্রামের রয়েছে নিজস্ব ইতিহাস, ঐতিহ্য ও পরিচয়। আপনার জানা গ্রামের ইতিহাস, গুরুত্বপূর্ণ স্থাপনা, বিশিষ্ট ব্যক্তিত্ব,
              সংস্কৃতি কিংবা অজানা তথ্য আমাদের পাঠান। আপনার দেওয়া তথ্যের মাধ্যমে সমৃদ্ধ হোক নাসিরনগরের ডিজিটাল তথ্যভান্ডার।
            </p>
            <ul className="mt-10 space-y-6">
              <li className="flex items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent-50 text-accent-500" aria-hidden="true">
                  <MessageSquareText className="h-6 w-6" />
                </span>
                <span className="text-lg font-semibold text-brand-900">সহজ ভাষায় আপনার জানা তথ্য লিখে পাঠান।</span>
              </li>
              <li className="flex items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-azure-50 text-azure-500" aria-hidden="true">
                  <ShieldCheck className="h-6 w-6" />
                </span>
                <span className="text-lg font-semibold text-brand-900">তথ্য যাচাই করে আপনার নামসহ ওয়েবসাইটে প্রকাশ করা হবে।</span>
              </li>
            </ul>
          </div>
          <div className="relative rounded-[34px] border border-line bg-white p-7 shadow-panel sm:p-12">
            <Suspense fallback={<p className="text-ink-500">ফর্ম লোড হচ্ছে…</p>}>
              <ContributeForm unions={unions.map((u) => ({ slug: u.slug, name: u.name }))} />
            </Suspense>
          </div>
        </Container>
      </section>
    </>
  );
}

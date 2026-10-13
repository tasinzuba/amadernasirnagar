import fs from "node:fs";
import path from "node:path";
import { cacheLife } from "next/cache";
import sharp from "sharp";
import { getSql, hasDatabase } from "@/lib/db";
import type { EventItem, ImageItem, ImageSize, NewsPost, Person, PersonWithPhoto, Place, School, Village } from "@/lib/types";

/**
 * ছবি আপনা-আপনি খুঁজে নেওয়া (শুধু সার্ভার/বিল্ডের সময় চলে)।
 * ডেটা ফাইলে cover না দিলেও public/images/<ধরন>/<slug>/cover.jpg বা public/images/<ধরন>/<slug>.jpg থাকলে সেটি দেখায়।
 * গ্যালারির জন্য public/images/<ধরন>/<slug>/1.jpg, 2.jpg ... রাখলেই হয়।
 */

export type ImageKind = "villages" | "places" | "unions" | "news" | "events" | "people" | "schools";

const exts = ["jpg", "jpeg", "png", "webp"];
const publicDir = path.join(process.cwd(), "public");

function exists(rel: string): boolean {
  return fs.existsSync(path.join(publicDir, ...rel.split("/")));
}

export function coverFor(kind: ImageKind, slug: string, explicit?: string): string | undefined {
  if (explicit) return explicit;
  for (const ext of exts) {
    const inFolder = `images/${kind}/${slug}/cover.${ext}`;
    if (exists(inFolder)) return `/${inFolder}`;
    const flat = `images/${kind}/${slug}.${ext}`;
    if (exists(flat)) return `/${flat}`;
  }
  return undefined;
}

function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

/**
 * ডেটায় images তালিকা থাকলে সেটাই (খালি তালিকা মানে গ্যালারি নেই; অ্যাডমিন থেকে সব ছবি সরালে এমন হয়)।
 * না থাকলে ফোল্ডারের cover ছাড়া বাকি ছবি, নাম অনুযায়ী সাজানো (1, 2, 3 …)
 */
export function galleryFor(kind: ImageKind, slug: string, explicit?: ImageItem[]): ImageItem[] {
  if (explicit) return explicit;
  const dir = path.join(publicDir, "images", kind, slug);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f) && !/^cover\./i.test(f))
    .sort(naturalCompare)
    .map((f) => ({ src: `/images/${kind}/${slug}/${f}` }));
}

export function withVillageImages<T extends Village>(village: T): T {
  return {
    ...village,
    cover: coverFor("villages", village.slug, village.cover),
    images: galleryFor("villages", village.slug, village.images),
  };
}

export function withPlaceImages<T extends Place>(place: T): T {
  return {
    ...place,
    cover: coverFor("places", place.slug, place.cover),
    images: galleryFor("places", place.slug, place.images),
  };
}

export function withSchoolImages<T extends School>(school: T): T {
  return {
    ...school,
    cover: coverFor("schools", school.slug, school.cover),
    images: galleryFor("schools", school.slug, school.images),
  };
}

export function withNewsCover<T extends NewsPost>(post: T): T {
  return { ...post, cover: coverFor("news", post.slug, post.cover) };
}

export function withEventCover<T extends EventItem>(event: T): T {
  return { ...event, cover: coverFor("events", event.slug, event.cover) };
}

export function withPersonImage<T extends Person>(person: T): T {
  return { ...person, image: coverFor("people", person.slug, person.image) };
}

/** ছবির আসল মাপ; ফাইল বা ডেটাবেসের ছবি একবার মেপে cache-এ রাখা হয় (version বদলালে নতুন করে মাপা হয়) */
async function measureImage(src: string, version: number): Promise<ImageSize | null> {
  "use cache";
  cacheLife("max");
  void version;
  let bytes: Buffer | null = null;
  if (src.startsWith("/media/") && hasDatabase()) {
    const rows = (await getSql()`select data from media where path = ${src.slice("/media/".length)}`) as { data: Buffer }[];
    bytes = rows[0]?.data ?? null;
  } else if (src.startsWith("/images/")) {
    bytes = await fs.promises.readFile(path.join(publicDir, ...src.slice(1).split("/"))).catch(() => null);
  }
  if (!bytes) return null;
  const meta = await sharp(bytes).metadata();
  if (!meta.width || !meta.height) return null;
  // মোবাইলে তোলা ছবির EXIF ঘোরানো থাকলে দৈর্ঘ্য-প্রস্থ উল্টে যায়
  const turned = (meta.orientation ?? 1) >= 5;
  return turned ? { width: meta.height, height: meta.width } : { width: meta.width, height: meta.height };
}

/** ছবির আসল মাপ: public/images-এর ফাইল বদলালে (mtime) নতুন করে মাপা হয়; /media/ ছবির নাম প্রতিবার আলাদা, তাই বদলায় না */
export async function imageSizeOf(src: string | undefined): Promise<ImageSize | undefined> {
  if (!src) return undefined;
  let version = 0;
  if (src.startsWith("/images/")) {
    const file = path.join(publicDir, ...src.slice(1).split("/"));
    if (!fs.existsSync(file)) return undefined;
    version = fs.statSync(file).mtimeMs;
  }
  return (await measureImage(src, version)) ?? undefined;
}

/** ব্যক্তির ছবি (ফোল্ডার বা ডেটাবেস) আর তার আসল মাপ, যাতে ছবি যেমন আছে তেমন দেখানো যায় */
export async function withPersonPhoto<T extends Person>(person: T): Promise<T & PersonWithPhoto> {
  const image = coverFor("people", person.slug, person.image);
  return { ...person, image, imageSize: await imageSizeOf(image) };
}

/**
 * উইকিমিডিয়া কমন্সের মতো জায়গা থেকে নেওয়া ছবির কৃতজ্ঞতা (content/image-credits.json)।
 * CC BY / CC BY-SA ছবিতে লেখকের নাম, লাইসেন্স আর উৎস দেখানো বাধ্যতামূলক।
 */
export interface ImageCredit {
  title: string;
  author: string;
  license: string;
  licenseUrl?: string;
  source: string;
  note?: string;
}

const creditsFile = path.join(process.cwd(), "content", "image-credits.json");
let creditsCache: { mtime: number; data: Record<string, ImageCredit> } | undefined;

/** সব ছবির কৃতজ্ঞতা, ছবির পথ (যেমন /images/places/x/cover.jpg) ধরে */
export function imageCredits(): Record<string, ImageCredit> {
  if (!fs.existsSync(creditsFile)) return {};
  const mtime = fs.statSync(creditsFile).mtimeMs;
  if (!creditsCache || creditsCache.mtime !== mtime) {
    creditsCache = { mtime, data: JSON.parse(fs.readFileSync(creditsFile, "utf8")) as Record<string, ImageCredit> };
  }
  return creditsCache.data;
}

export function creditFor(src?: string): ImageCredit | undefined {
  return src ? imageCredits()[src] : undefined;
}

/** লাইটবক্সে দেখানোর মতো এক লাইনের কৃতজ্ঞতা */
export function creditLine(c: ImageCredit): string {
  const from = /wikimedia\.org/.test(c.source) ? ", উইকিমিডিয়া কমন্স" : "";
  return `ছবি: ${c.author}, ${c.license}${from}${c.note ? ` (${c.note})` : ""}`;
}

/** গ্যালারির ছবিগুলোর কৃতজ্ঞতা: ছবির পথ → এক লাইনের লেখা */
export function galleryCredits(images: ImageItem[] | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const img of images ?? []) {
    const c = creditFor(img.src);
    if (c) out[img.src] = creditLine(c);
  }
  return out;
}

/** public/images/hero.jpg থাকলে তার পথ (হিরো ও উপজেলা পেজের ফ্রেমে) */
export function heroImage(): string | null {
  return fs.existsSync(path.join(process.cwd(), "public", "images", "hero.jpg")) ? "/images/hero.jpg" : null;
}

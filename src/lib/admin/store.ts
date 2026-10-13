import fs from "node:fs";
import path from "node:path";
import { revalidatePath, updateTag } from "next/cache";
import { CONTENT_TAG, contentDir, loadContent, villagesDir } from "@/lib/content";
import { getSql, hasDatabase, villageKey } from "@/lib/db";
import { deleteImage } from "./images";
import {
  emergencyFileSchema,
  eventItemSchema,
  formatIssues,
  newsPostSchema,
  personSchema,
  placeSchema,
  schoolSchema,
  unionSchema,
  villageSchema,
  type EmergencyFile,
  type Village,
} from "@/lib/schemas";

/**
 * অ্যাডমিন প্যানেল থেকে তথ্য লেখা ও মোছা।
 * DATABASE_URL থাকলে Neon ডেটাবেসের content_docs টেবিলে, না থাকলে content/ ফোল্ডারের JSON ফাইলে।
 * সেভের পর updateTag("content") ডাকা হয়, তাই সাইটে সঙ্গে সঙ্গে নতুন তথ্য দেখায়।
 */

export type SaveResult = { ok: true } | { ok: false; message: string };

/** ডেটাবেস থাকলে সবসময় লেখা যায়; ফাইল-মোডে Vercel-এর মতো read-only হোস্টিংয়ে যায় না */
export function canWrite(): boolean {
  if (hasDatabase()) return true;
  if (process.env.VERCEL) return false;
  try {
    fs.accessSync(contentDir, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

/* ---------- ডেটাবেস বা ফাইল: একটা "ডক" পড়া, লেখা, মোছা ---------- */

function fileForKey(key: string): string {
  return key.startsWith("village:") ? path.join(villagesDir, `${key.slice("village:".length)}.json`) : path.join(contentDir, `${key}.json`);
}

async function readDoc(key: string): Promise<unknown> {
  if (hasDatabase()) {
    const rows = (await getSql()`select data from content_docs where key = ${key}`) as { data: unknown }[];
    return rows[0]?.data;
  }
  const file = fileForKey(key);
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : undefined;
}

async function writeDoc(key: string, data: unknown): Promise<void> {
  if (hasDatabase()) {
    await getSql()`insert into content_docs (key, data) values (${key}, ${JSON.stringify(data)}::json)
                   on conflict (key) do update set data = excluded.data, updated_at = now()`;
    return;
  }
  const file = fileForKey(key);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + "\n", "utf8");
  fs.renameSync(tmp, file);
}

async function deleteDoc(key: string): Promise<void> {
  if (hasDatabase()) {
    await getSql()`delete from content_docs where key = ${key}`;
    return;
  }
  const file = fileForKey(key);
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

/** আইটেম মুছলে ডেটাবেসে তোলা তার ছবিও মোছা (public/images-এর ছবি যেমন আছে থাকে) */
async function deleteMedia(srcs: unknown[]): Promise<void> {
  for (const src of srcs) if (typeof src === "string" && src.startsWith("/media/")) await deleteImage(src);
}

function imageSrcs(item: Record<string, unknown>): unknown[] {
  const gallery = Array.isArray(item.images) ? (item.images as { src?: unknown }[]) : [];
  return [item.cover, item.image, ...gallery.map((i) => i.src)];
}

function afterWrite(paths: string[]): void {
  updateTag(CONTENT_TAG);
  for (const p of paths) revalidatePath(p);
}

/* ---------- গ্রাম ---------- */

export async function villageRelationError(v: Village): Promise<string | null> {
  const s = await loadContent();
  if (!s.unionMap.has(v.union)) return `ইউনিয়ন "${v.union}" পাওয়া যায়নি`;
  for (const a of v.attractions ?? []) if (!s.placeMap.has(a)) return `দর্শনীয় স্থান "${a}" তালিকায় নেই`;
  for (const p of v.people ?? []) if (!s.personMap.has(p)) return `ব্যক্তি "${p}" তালিকায় নেই`;
  return null;
}

export async function saveVillage(input: unknown, originalSlug?: string): Promise<SaveResult> {
  const parsed = villageSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: formatIssues(parsed.error) };
  const village = parsed.data;
  const relation = await villageRelationError(village);
  if (relation) return { ok: false, message: relation };
  if (!originalSlug && (await readDoc(villageKey(village.slug))) !== undefined) {
    return { ok: false, message: `"${village.slug}" slug-এর গ্রাম আগে থেকেই আছে` };
  }
  await writeDoc(villageKey(village.slug), village);
  afterWrite(["/", "/villages", `/villages/${village.slug}`, `/unions/${village.union}`, "/map", "/sitemap.xml"]);
  return { ok: true };
}

export async function deleteVillage(slug: string): Promise<SaveResult> {
  const s = await loadContent();
  const village = s.villageMap.get(slug);
  if (!village) return { ok: false, message: "গ্রাম পাওয়া যায়নি" };
  const refs = [
    ...s.places.filter((p) => p.village === slug).map((p) => `স্থান: ${p.name}`),
    ...s.people.filter((p) => p.village === slug).map((p) => `ব্যক্তি: ${p.name}`),
    ...s.events.filter((e) => e.village === slug).map((e) => `আয়োজন: ${e.title}`),
  ];
  if (refs.length) return { ok: false, message: `আগে এগুলো থেকে গ্রামটি সরান: ${refs.join(", ")}` };
  await deleteDoc(villageKey(slug));
  await deleteMedia(imageSrcs(village));
  afterWrite(["/", "/villages", `/villages/${slug}`, `/unions/${village.union}`, "/map", "/sitemap.xml"]);
  return { ok: true };
}

/* ---------- তালিকা-ভিত্তিক তথ্য (places, people, news, events, unions, schools) ---------- */

export type CollectionKind = "places" | "people" | "news" | "events" | "unions" | "schools";

const collectionSchemas = {
  places: placeSchema,
  people: personSchema,
  news: newsPostSchema,
  events: eventItemSchema,
  unions: unionSchema,
  schools: schoolSchema,
} as const;

const collectionPaths: Record<CollectionKind, string[]> = {
  places: ["/", "/places", "/map", "/sitemap.xml"],
  people: ["/", "/people"],
  news: ["/", "/news", "/sitemap.xml"],
  events: ["/", "/events"],
  unions: ["/", "/unions", "/map", "/sitemap.xml"],
  schools: ["/schools", "/sitemap.xml"],
};

async function readCollectionRaw(kind: CollectionKind): Promise<Record<string, unknown>[]> {
  const raw = await readDoc(kind);
  return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
}

async function itemRelationError(kind: CollectionKind, item: Record<string, unknown>): Promise<string | null> {
  const s = await loadContent();
  const union = typeof item.union === "string" ? item.union : undefined;
  const village = typeof item.village === "string" ? item.village : undefined;
  if (kind !== "unions") {
    if (union && !s.unionMap.has(union)) return `ইউনিয়ন "${union}" পাওয়া যায়নি`;
    if (village && !s.villageMap.has(village)) return `গ্রাম "${village}" পাওয়া যায়নি`;
    if (village && union && s.villageMap.get(village)?.union !== union) return "গ্রামটি বাছাই করা ইউনিয়নের নয়";
  }
  return null;
}

export async function saveItem(kind: CollectionKind, input: unknown, isNew: boolean): Promise<SaveResult> {
  const parsed = collectionSchemas[kind].safeParse(input);
  if (!parsed.success) return { ok: false, message: formatIssues(parsed.error) };
  const item = parsed.data as Record<string, unknown> & { slug: string };
  const relation = await itemRelationError(kind, item);
  if (relation) return { ok: false, message: relation };

  const items = await readCollectionRaw(kind);
  const index = items.findIndex((i) => i.slug === item.slug);
  if (isNew && index >= 0) return { ok: false, message: `"${item.slug}" slug আগে থেকেই আছে` };
  if (!isNew && index < 0) return { ok: false, message: "আইটেমটি পাওয়া যায়নি" };
  if (index >= 0) items[index] = item;
  else items.push(item);
  await writeDoc(kind, items);

  const extra: string[] = [];
  if (kind === "places") extra.push(`/places/${item.slug}`);
  if (kind === "news") extra.push(`/news/${item.slug}`);
  if (kind === "unions") extra.push(`/unions/${item.slug}`);
  if (kind === "schools") extra.push(`/schools/${item.slug}`);
  if (typeof item.village === "string") extra.push(`/villages/${item.village}`);
  if (typeof item.union === "string") extra.push(`/unions/${item.union}`);
  afterWrite([...collectionPaths[kind], ...extra]);
  return { ok: true };
}

export async function deleteItem(kind: CollectionKind, slug: string): Promise<SaveResult> {
  if (kind === "unions") return { ok: false, message: "ইউনিয়ন মোছা যায় না" };
  const s = await loadContent();
  if (kind === "places") {
    const refs = s.villages.filter((v) => v.attractions?.includes(slug)).map((v) => v.name);
    if (refs.length) return { ok: false, message: `আগে এই গ্রামগুলো থেকে স্থানটি সরান: ${refs.join(", ")}` };
  }
  if (kind === "people") {
    const refs = s.villages.filter((v) => v.people?.includes(slug)).map((v) => v.name);
    if (refs.length) return { ok: false, message: `আগে এই গ্রামগুলো থেকে ব্যক্তিকে সরান: ${refs.join(", ")}` };
  }
  const items = await readCollectionRaw(kind);
  const item = items.find((i) => i.slug === slug);
  if (!item) return { ok: false, message: "আইটেমটি পাওয়া যায়নি" };
  await writeDoc(kind, items.filter((i) => i !== item));
  await deleteMedia(imageSrcs(item));
  afterWrite(collectionPaths[kind]);
  return { ok: true };
}

/* ---------- জরুরি নম্বর ---------- */

export async function saveEmergency(input: unknown): Promise<SaveResult> {
  const parsed = emergencyFileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: formatIssues(parsed.error) };
  const data: EmergencyFile = parsed.data;
  await writeDoc("emergency", data);
  afterWrite(["/", "/emergency"]);
  return { ok: true };
}

"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import {
  checkPassword,
  clearSessionCookie,
  isAdminConfigured,
  requireAdmin,
  setSessionCookie,
} from "./auth";
import * as f from "./form";
import { addGalleryImage, deleteImage, saveCover, type UploadKind } from "./images";
import {
  canWrite,
  deleteItem,
  deleteVillage,
  saveEmergency,
  saveItem,
  saveVillage,
  type CollectionKind,
  type SaveResult,
} from "./store";
import { deleteSubmission } from "./submissions";
import { CONTENT_TAG } from "@/lib/content";
import { hasDatabase } from "@/lib/db";
import {
  eventItemSchema,
  newsPostSchema,
  personSchema,
  placeSchema,
  schoolSchema,
  unionSchema,
  villageSchema,
  formatIssues,
} from "@/lib/schemas";
import type { ImageItem } from "@/lib/types";
import type { z } from "zod";

export type ActionState = { ok: boolean; message: string; savedAt?: number } | null;

const READ_ONLY_MESSAGE =
  "এই সার্ভারে ফাইল লেখা যায় না (read-only)। হোস্টিংয়ে DATABASE_URL যুক্ত করুন (README দেখুন), অথবা নিজের কম্পিউটারে npm run dev চালিয়ে এডিট করুন।";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function fail(message: string): ActionState {
  return { ok: false, message };
}

function done(message = "সংরক্ষণ হয়েছে"): ActionState {
  return { ok: true, message, savedAt: Date.now() };
}

function fromResult(result: SaveResult): ActionState | null {
  return result.ok ? null : fail(result.message);
}

/** টেক্সট ফিল্ড আগে যাচাই, তারপর ছবি লেখা, যাতে ভুল ফর্মে অনাথ ছবি না জমে */
function precheck<T>(schema: z.ZodType<T>, draft: unknown): string | null {
  const parsed = schema.safeParse(draft);
  return parsed.success ? null : formatIssues(parsed.error);
}

async function guard(): Promise<ActionState | null> {
  await requireAdmin();
  if (!canWrite()) return fail(READ_ONLY_MESSAGE);
  return null;
}

/** "new" URL-এ নতুন আইটেম তৈরির জন্য সংরক্ষিত */
function reservedSlug(slug: string): ActionState | null {
  return slug === "new" ? fail('"new" slug হিসেবে ব্যবহার করা যাবে না') : null;
}

/**
 * ছবির বদল। ছবি মোছা হয় তথ্য সেভ হওয়ার পরে (commit), যাতে সেভ ব্যর্থ হলে পুরনো ছবি হারিয়ে না যায়;
 * আর সেভ ব্যর্থ হলে এইমাত্র তোলা নতুন ছবি ফেরত নেওয়া হয়।
 */
interface ImageChange {
  error?: string;
  /** সেভ সফল হলে মুছতে হবে: সরানো বা বদলে যাওয়া পুরনো ছবি */
  trash: string[];
  /** সেভ ব্যর্থ হলে মুছতে হবে: এইমাত্র তোলা নতুন ছবি */
  added: string[];
}

const UPLOAD_FAILED = "ছবিটি সংরক্ষণ করা গেল না। অন্য কোনো JPG/PNG/WebP ছবি দিয়ে আবার চেষ্টা করুন।";

async function commit(result: SaveResult, ...changes: ImageChange[]): Promise<ActionState | null> {
  const remove = changes.flatMap((c) => (result.ok ? c.trash : c.added));
  for (const src of remove) await deleteImage(src);
  return fromResult(result);
}

/** কভার ছবি: মুছে ফেলা / নতুন আপলোড */
async function handleCover(fd: FormData, kind: UploadKind, slug: string): Promise<ImageChange & { cover?: string }> {
  const current = f.str(fd, "coverSrc");
  const file = f.files(fd, "coverFile")[0];
  if (file) {
    if (!f.isImageFile(file)) return { error: "কভার ছবি হিসেবে শুধু ছবির ফাইল (JPG/PNG/WebP) দিন", trash: [], added: [] };
    let cover: string;
    try {
      cover = await saveCover(kind, slug, file);
    } catch (error) {
      console.error("[admin] কভার ছবি সংরক্ষণ ব্যর্থ:", error);
      return { error: UPLOAD_FAILED, trash: [], added: [] };
    }
    // ডেটাবেসের ছবির নাম প্রতিবার আলাদা, তাই বদলে যাওয়া পুরনোটা আর কাজে লাগে না
    const replaced = current && current !== cover && current.startsWith("/media/") ? [current] : [];
    return { cover, trash: replaced, added: cover.startsWith("/media/") ? [cover] : [] };
  }
  if (!f.bool(fd, "coverRemove")) return { cover: current, trash: [], added: [] };
  // ডেটাবেস-মোডে public/images-এর ছবি সাইটের কোডের অংশ; সরালেও ফোল্ডার থেকে আবার দেখাত
  if (hasDatabase() && current?.startsWith("/images/")) {
    return {
      error: "এই ছবিটি সাইটের নিজস্ব ফোল্ডারের (public/images), তাই এখান থেকে মোছা যায় না। নতুন ছবি আপলোড করে বদলে দিতে পারেন।",
      trash: [],
      added: [],
    };
  }
  return { cover: undefined, trash: current ? [current] : [], added: [] };
}

/** গ্যালারি: বিদ্যমান ছবির ক্যাপশন/মুছে ফেলা + নতুন আপলোড */
async function handleGallery(fd: FormData, kind: UploadKind, slug: string): Promise<ImageChange & { images?: ImageItem[] }> {
  const removed = new Set(f.list(fd, "imgRemove") ?? []);
  const shown = f.rows(fd, "img", ["src", "caption"] as const).filter((r) => r.src);
  const uploads = f.files(fd, "galleryFiles");
  if (uploads.some((file) => !f.isImageFile(file))) return { error: "গ্যালারিতে শুধু ছবির ফাইল দিন", trash: [], added: [] };
  const images: ImageItem[] = shown
    .filter((r) => !removed.has(r.src))
    .map((r) => f.compact({ src: r.src, caption: r.caption || undefined }));
  const added: string[] = [];
  for (const file of uploads) {
    try {
      const src = await addGalleryImage(kind, slug, file);
      added.push(src);
      images.push({ src });
    } catch (error) {
      console.error("[admin] গ্যালারির ছবি সংরক্ষণ ব্যর্থ:", error);
      return { error: `"${file.name}": ${UPLOAD_FAILED}`, trash: [], added };
    }
  }
  const trash = shown.filter((r) => removed.has(r.src)).map((r) => r.src);
  // ডেটাবেস-মোডে ফোল্ডারের ছবি মোছা যায় না; সব সরালে খালি তালিকা রাখি, নইলে সেগুলো আবার দেখাত
  const none = shown.length > 0 && hasDatabase() ? [] : undefined;
  return { images: images.length ? images : none, trash, added };
}

/** compact() খালি তালিকা বাদ দেয়; গ্যালারির খালি তালিকাও (সব ছবি সরানো) রাখতে আলাদা করে বসানো */
function withGallery<T extends Record<string, unknown>>(item: T, images: ImageItem[] | undefined): T {
  return images ? { ...item, images } : item;
}

/* ---------- লগইন ---------- */

export async function loginAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!isAdminConfigured()) return fail("অ্যাডমিন লগইন এখন বন্ধ আছে।");
  const password = String(fd.get("password") ?? "");
  if (!checkPassword(password)) return fail("পাসওয়ার্ড মেলেনি");
  await setSessionCookie();
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/admin/login");
}

/* ---------- গ্রাম ---------- */

export async function saveVillageAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const blocked = await guard();
  if (blocked) return blocked;

  const isNew = f.bool(fd, "isNew");
  const slug = (f.str(fd, "slug") ?? "").toLowerCase();

  const fares = f
    .rows(fd, "fare", ["route", "mode", "fare", "time"] as const)
    .filter((r) => r.route && r.mode && r.fare)
    .map((r) => f.compact({ route: r.route, mode: r.mode, fare: r.fare, time: r.time || undefined }));
  const transport = f.compact({
    fromDhaka: f.lines(fd, "fromDhaka"),
    fromBrahmanbaria: f.lines(fd, "fromBrahmanbaria"),
    fromSadar: f.lines(fd, "fromSadar"),
    monsoon: f.str(fd, "monsoon"),
    fares: fares.length ? fares : undefined,
    notes: f.lines(fd, "transportNotes"),
  });

  const base = {
    slug,
    name: f.req(fd, "name"),
    nameEn: f.req(fd, "nameEn"),
    union: f.req(fd, "union"),
    status: f.req(fd, "status"),
    mouza: f.str(fd, "mouza"),
    ward: f.int(fd, "ward"),
    postcode: f.str(fd, "postcode"),
    population: f.int(fd, "population"),
    households: f.int(fd, "households"),
    tagline: f.str(fd, "tagline"),
    description: f.str(fd, "description"),
    history: f.str(fd, "history"),
    attractions: f.list(fd, "attractions"),
    people: f.list(fd, "people"),
    institutions: f
      .rows(fd, "inst", ["name", "type", "note"] as const)
      .filter((r) => r.name)
      .map((r) => f.compact({ name: r.name, type: r.type, note: r.note || undefined })),
    markets: f
      .rows(fd, "mkt", ["name", "days", "note"] as const)
      .filter((r) => r.name)
      .map((r) => f.compact({ name: r.name, days: r.days || undefined, note: r.note || undefined })),
    transport: Object.keys(transport).length ? transport : undefined,
    lat: f.num(fd, "lat"),
    lng: f.num(fd, "lng"),
    updatedAt: today(),
  };

  const draftError = reservedSlug(slug) ?? precheck(villageSchema, f.compact({ ...base, cover: f.str(fd, "coverSrc") }));
  if (draftError) return typeof draftError === "string" ? fail(draftError) : draftError;

  const cover = await handleCover(fd, "villages", slug);
  if (cover.error) return fail(cover.error);
  const gallery = await handleGallery(fd, "villages", slug);
  if (gallery.error) return commit({ ok: false, message: gallery.error }, cover, gallery);

  const result = await saveVillage(withGallery(f.compact({ ...base, cover: cover.cover }), gallery.images), isNew ? undefined : slug);
  const error = await commit(result, cover, gallery);
  if (error) return error;
  if (isNew) redirect(`/admin/villages/${slug}?created=1`);
  return done();
}

export async function deleteVillageAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const blocked = await guard();
  if (blocked) return blocked;
  const slug = f.req(fd, "slug");
  const result = await deleteVillage(slug);
  if (!result.ok) return fail(result.message);
  redirect("/admin/villages?deleted=1");
}

/* ---------- দর্শনীয় স্থান ---------- */

export async function savePlaceAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const blocked = await guard();
  if (blocked) return blocked;
  const isNew = f.bool(fd, "isNew");
  const slug = (f.str(fd, "slug") ?? "").toLowerCase();
  const base = {
    slug,
    name: f.req(fd, "name"),
    nameEn: f.str(fd, "nameEn"),
    type: f.req(fd, "type"),
    union: f.req(fd, "union"),
    village: f.str(fd, "village"),
    summary: f.req(fd, "summary"),
    details: f.lines(fd, "details"),
    bestTime: f.str(fd, "bestTime"),
    tips: f.lines(fd, "tips"),
    lat: f.num(fd, "lat"),
    lng: f.num(fd, "lng"),
    featured: f.bool(fd, "featured") || undefined,
  };
  const draftError = reservedSlug(slug) ?? precheck(placeSchema, f.compact({ ...base, cover: f.str(fd, "coverSrc") }));
  if (draftError) return typeof draftError === "string" ? fail(draftError) : draftError;
  const cover = await handleCover(fd, "places", slug);
  if (cover.error) return fail(cover.error);
  const gallery = await handleGallery(fd, "places", slug);
  if (gallery.error) return commit({ ok: false, message: gallery.error }, cover, gallery);
  const error = await commit(await saveItem("places", withGallery(f.compact({ ...base, cover: cover.cover }), gallery.images), isNew), cover, gallery);
  if (error) return error;
  if (isNew) redirect(`/admin/places/${slug}?created=1`);
  return done();
}

/* ---------- শিক্ষা প্রতিষ্ঠান ---------- */

export async function saveSchoolAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const blocked = await guard();
  if (blocked) return blocked;
  const isNew = f.bool(fd, "isNew");
  const slug = (f.str(fd, "slug") ?? "").toLowerCase();
  const base = {
    slug,
    name: f.req(fd, "name"),
    nameEn: f.str(fd, "nameEn"),
    type: f.req(fd, "type"),
    level: f.str(fd, "level"),
    management: f.str(fd, "management"),
    gender: f.str(fd, "gender"),
    union: f.req(fd, "union"),
    village: f.str(fd, "village"),
    address: f.str(fd, "address"),
    established: f.int(fd, "established"),
    eiin: f.str(fd, "eiin") ? f.toEnDigits(f.req(fd, "eiin")) : undefined,
    founder: f.str(fd, "founder"),
    head: f.str(fd, "head"),
    students: f.int(fd, "students"),
    teachers: f.int(fd, "teachers"),
    phone: f.str(fd, "phone") ? f.toEnDigits(f.req(fd, "phone")) : undefined,
    email: f.str(fd, "email"),
    website: f.str(fd, "website"),
    summary: f.str(fd, "summary"),
    history: f.str(fd, "history"),
    details: f.lines(fd, "details"),
    sources: f.lines(fd, "sources"),
    lat: f.num(fd, "lat"),
    lng: f.num(fd, "lng"),
    updatedAt: today(),
  };
  const draftError = reservedSlug(slug) ?? precheck(schoolSchema, f.compact({ ...base, cover: f.str(fd, "coverSrc") }));
  if (draftError) return typeof draftError === "string" ? fail(draftError) : draftError;
  const cover = await handleCover(fd, "schools", slug);
  if (cover.error) return fail(cover.error);
  const gallery = await handleGallery(fd, "schools", slug);
  if (gallery.error) return commit({ ok: false, message: gallery.error }, cover, gallery);
  const error = await commit(await saveItem("schools", withGallery(f.compact({ ...base, cover: cover.cover }), gallery.images), isNew), cover, gallery);
  if (error) return error;
  if (isNew) redirect(`/admin/schools/${slug}?created=1`);
  return done();
}

/* ---------- বিশিষ্ট ব্যক্তি ---------- */

export async function savePersonAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const blocked = await guard();
  if (blocked) return blocked;
  const isNew = f.bool(fd, "isNew");
  const slug = (f.str(fd, "slug") ?? "").toLowerCase();
  const base = {
    slug,
    name: f.req(fd, "name"),
    category: f.req(fd, "category"),
    union: f.str(fd, "union"),
    village: f.str(fd, "village"),
    years: f.str(fd, "years"),
    summary: f.req(fd, "summary"),
    details: f.lines(fd, "details"),
  };
  const draftError = reservedSlug(slug) ?? precheck(personSchema, f.compact({ ...base, image: f.str(fd, "coverSrc") }));
  if (draftError) return typeof draftError === "string" ? fail(draftError) : draftError;
  const cover = await handleCover(fd, "people", slug);
  if (cover.error) return fail(cover.error);
  const error = await commit(await saveItem("people", f.compact({ ...base, image: cover.cover }), isNew), cover);
  if (error) return error;
  if (isNew) redirect(`/admin/people/${slug}?created=1`);
  return done();
}

/* ---------- খবর ---------- */

export async function saveNewsAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const blocked = await guard();
  if (blocked) return blocked;
  const isNew = f.bool(fd, "isNew");
  const slug = (f.str(fd, "slug") ?? "").toLowerCase();
  const base = {
    slug,
    title: f.req(fd, "title"),
    date: f.toEnDigits(f.req(fd, "date")),
    category: f.req(fd, "category"),
    excerpt: f.req(fd, "excerpt"),
    body: f.paragraphs(fd, "body"),
  };
  const draftError = reservedSlug(slug) ?? precheck(newsPostSchema, f.compact({ ...base, cover: f.str(fd, "coverSrc") }));
  if (draftError) return typeof draftError === "string" ? fail(draftError) : draftError;
  const cover = await handleCover(fd, "news", slug);
  if (cover.error) return fail(cover.error);
  const error = await commit(await saveItem("news", f.compact({ ...base, cover: cover.cover }), isNew), cover);
  if (error) return error;
  if (isNew) redirect(`/admin/news/${slug}?created=1`);
  return done();
}

/* ---------- উৎসব ---------- */

export async function saveEventAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const blocked = await guard();
  if (blocked) return blocked;
  const isNew = f.bool(fd, "isNew");
  const slug = (f.str(fd, "slug") ?? "").toLowerCase();
  const base = {
    slug,
    title: f.req(fd, "title"),
    badge: f.req(fd, "badge"),
    when: f.req(fd, "when"),
    place: f.req(fd, "place"),
    union: f.str(fd, "union"),
    village: f.str(fd, "village"),
    description: f.req(fd, "description"),
    note: f.str(fd, "note"),
  };
  const draftError = reservedSlug(slug) ?? precheck(eventItemSchema, f.compact({ ...base, cover: f.str(fd, "coverSrc") }));
  if (draftError) return typeof draftError === "string" ? fail(draftError) : draftError;
  const cover = await handleCover(fd, "events", slug);
  if (cover.error) return fail(cover.error);
  const error = await commit(await saveItem("events", f.compact({ ...base, cover: cover.cover }), isNew), cover);
  if (error) return error;
  if (isNew) redirect(`/admin/events/${slug}?created=1`);
  return done();
}

/* ---------- ইউনিয়ন ---------- */

export async function saveUnionAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const blocked = await guard();
  if (blocked) return blocked;
  const base = {
    slug: f.req(fd, "slug"),
    name: f.req(fd, "name"),
    nameEn: f.req(fd, "nameEn"),
    description: f.req(fd, "description"),
    nameOrigin: f.str(fd, "nameOrigin"),
    history: f.str(fd, "history"),
    area: f.num(fd, "area"),
    population: f.int(fd, "population"),
    households: f.int(fd, "households"),
    mouzas: f.int(fd, "mouzas"),
    villageCount: f.int(fd, "villageCount"),
    postcode: f.str(fd, "postcode"),
    chairman: f.str(fd, "chairman"),
    lat: f.num(fd, "lat"),
    lng: f.num(fd, "lng"),
    rivers: f.lines(fd, "rivers"),
    markets: f.lines(fd, "markets"),
    institutions: f.lines(fd, "institutions"),
    attractions: f.lines(fd, "attractions"),
    notablePeople: f.lines(fd, "notablePeople"),
  };
  const draftError = precheck(unionSchema, f.compact({ ...base, cover: f.str(fd, "coverSrc") }));
  if (draftError) return fail(draftError);
  const cover = await handleCover(fd, "unions", base.slug);
  if (cover.error) return fail(cover.error);
  const error = await commit(await saveItem("unions", f.compact({ ...base, cover: cover.cover }), false), cover);
  return error ?? done();
}

/* ---------- জরুরি নম্বর ---------- */

export async function saveEmergencyAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const blocked = await guard();
  if (blocked) return blocked;
  const toContacts = (prefix: string) =>
    f
      .rows(fd, prefix, ["name", "phone", "note"] as const)
      .filter((r) => r.name)
      .map((r) => f.compact({ name: r.name, phone: r.phone ? f.toEnDigits(r.phone) : undefined, note: r.note || undefined }));
  const error = fromResult(await saveEmergency({ national: toContacts("nat"), local: toContacts("loc") }));
  return error ?? done();
}

/* ---------- মুছে ফেলা ---------- */

export async function deleteItemAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const blocked = await guard();
  if (blocked) return blocked;
  const kind = f.req(fd, "kind") as CollectionKind;
  const slug = f.req(fd, "slug");
  if (!["places", "people", "news", "events", "schools"].includes(kind)) return fail("ভুল ধরন");
  const result = await deleteItem(kind, slug);
  if (!result.ok) return fail(result.message);
  redirect(`/admin/${kind}?deleted=1`);
}

/** স্ক্রিপ্ট (npm run db:push) বা সরাসরি ডেটাবেসে বদলালে সাইটে সঙ্গে সঙ্গে দেখানোর জন্য সব পেজ নতুন করে বানানো */
export async function refreshSiteAction(): Promise<void> {
  await requireAdmin();
  updateTag(CONTENT_TAG);
  revalidatePath("/", "layout");
  redirect("/admin?refreshed=1");
}

export async function deleteSubmissionAction(fd: FormData): Promise<void> {
  await requireAdmin();
  await deleteSubmission(f.req(fd, "id"));
  redirect("/admin/submissions");
}

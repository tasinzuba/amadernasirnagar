import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { getSql, hasDatabase } from "@/lib/db";

/**
 * অ্যাডমিন থেকে আপলোড করা ছবি ছোট করে (JPG) সংরক্ষণ।
 * DATABASE_URL থাকলে ডেটাবেসের media টেবিলে; সাইটে /media/<পথ> ঠিকানায় দেখায় (src/app/media/[...path]/route.ts)।
 * না থাকলে public/images/ ফোল্ডারে: গ্রাম/স্থান/ইউনিয়ন/শিক্ষা প্রতিষ্ঠান images/<kind>/<slug>/cover.jpg ও গ্যালারি 1.jpg, 2.jpg …;
 * ব্যক্তি/খবর/উৎসব images/<kind>/<slug>.jpg
 */

export type UploadKind = "villages" | "places" | "unions" | "people" | "news" | "events" | "schools";

const publicDir = path.join(process.cwd(), "public");
const imagesDir = path.join(publicDir, "images");

/** ডেটাবেসে প্রতিটা আপলোডের আলাদা নাম, যাতে ব্রাউজার পুরনো ছবি না দেখায় */
function stamp(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

async function store(rel: string, jpeg: Buffer): Promise<string> {
  if (hasDatabase()) {
    await getSql()`insert into media (path, content_type, data) values (${rel}, ${"image/jpeg"}, ${jpeg})
                   on conflict (path) do update set data = excluded.data, content_type = excluded.content_type, updated_at = now()`;
    return `/media/${rel}`;
  }
  const out = path.join(imagesDir, ...rel.split("/"));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, jpeg);
  return `/images/${rel}`;
}

export async function saveCover(kind: UploadKind, slug: string, file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const db = hasDatabase();
  if (kind === "people") {
    // ব্যক্তির ছবি যেমন আছে তেমনই থাকে: কাটা হয় না, বড়ও করা হয় না; শুধু খুব বড় হলে ছোট করা হয়
    const jpeg = await sharp(buffer)
      .rotate()
      .resize({ width: 800, height: 1000, fit: "inside", withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 90, mozjpeg: true })
      .toBuffer();
    return store(db ? `people/${slug}-${stamp()}.jpg` : `people/${slug}.jpg`, jpeg);
  }
  const jpeg = await sharp(buffer)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  const flat = kind === "news" || kind === "events";
  if (db) return store(flat ? `${kind}/${slug}-${stamp()}.jpg` : `${kind}/${slug}/cover-${stamp()}.jpg`, jpeg);
  return store(flat ? `${kind}/${slug}.jpg` : `${kind}/${slug}/cover.jpg`, jpeg);
}

export async function addGalleryImage(kind: UploadKind, slug: string, file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const jpeg = await sharp(buffer)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  if (hasDatabase()) return store(`${kind}/${slug}/${stamp()}.jpg`, jpeg);
  const dir = path.join(imagesDir, kind, slug);
  const used = fs.existsSync(dir)
    ? fs
        .readdirSync(dir)
        .map((f) => /^(\d+)\.(jpe?g|png|webp)$/i.exec(f))
        .filter((m): m is RegExpExecArray => Boolean(m))
        .map((m) => Number(m[1]))
    : [];
  const next = used.length ? Math.max(...used) + 1 : 1;
  return store(`${kind}/${slug}/${next}.jpg`, jpeg);
}

/**
 * ছবি মোছা: /media/… হলে ডেটাবেস থেকে; /images/… হলে (শুধু ফাইল-মোডে) public/images থেকে।
 * ডেটাবেস-মোডে public/images-এর ছবি মোছা হয় না, কারণ সেগুলো সাইটের কোডের সঙ্গে প্রকাশ হয়।
 */
export async function deleteImage(src: string | undefined): Promise<void> {
  if (!src) return;
  if (src.startsWith("/media/")) {
    if (hasDatabase()) await getSql()`delete from media where path = ${src.slice("/media/".length)}`;
    return;
  }
  if (!src.startsWith("/images/") || hasDatabase()) return;
  const absolute = path.resolve(publicDir, ...src.slice(1).split("/"));
  if (!absolute.startsWith(imagesDir + path.sep)) return;
  if (fs.existsSync(absolute)) fs.unlinkSync(absolute);
}

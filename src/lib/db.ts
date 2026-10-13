import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Neon Postgres ডেটাবেস (শুধু সার্ভারে)।
 * .env.local বা হোস্টিংয়ে DATABASE_URL থাকলে সাইট ডেটাবেস থেকে চলে; না থাকলে content/ ফোল্ডারের ফাইল থেকে।
 * টেবিল: content_docs (গ্রাম, ইউনিয়ন, স্থান…), submissions ("তথ্য দিন" ফর্ম), media (অ্যাডমিন থেকে আপলোড করা ছবি)।
 * টেবিল বানানো আর তথ্য তোলার স্ক্রিপ্ট: scripts/db.mjs
 */

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

let client: NeonQueryFunction<false, false> | null = null;

/** প্রথম ব্যবহারের সময় সংযোগ তৈরি হয়, যাতে DATABASE_URL ছাড়া build ভেঙে না পড়ে */
export function getSql(): NeonQueryFunction<false, false> {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL দেওয়া নেই");
    client = neon(url);
  }
  return client;
}

/** ডেটাবেসে content_docs-এর key: গ্রামপ্রতি "village:<slug>", বাকিগুলো ফাইলের নামে */
export const villageKey = (slug: string) => `village:${slug}`;

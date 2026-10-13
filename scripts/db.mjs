#!/usr/bin/env node
/**
 * Neon Postgres ডেটাবেস: টেবিল বানানো, content/ ফোল্ডারের তথ্য ডেটাবেসে তোলা (push) আর নামানো (pull)।
 *
 *   npm run db:setup          টেবিল বানায় (আগে থেকে থাকলে কিছু করে না)
 *   npm run db:push           content/ ফোল্ডারে বদলানো তথ্য আর submissions/ ফোল্ডারের জমা ডেটাবেসে তোলে
 *   npm run db:push -- village:haripur unions   শুধু এই তথ্যগুলো তোলে
 *   npm run db:push -- --prune  ডেটাবেসে থাকা কিন্তু ফোল্ডারে নেই এমন গ্রাম মুছে দেয়
 *   npm run db:pull           ডেটাবেসের তথ্য content/ ফোল্ডারে নামায় (ব্যাকআপ, বা ফাইলে কিছু বদলানোর আগে)
 *   npm run db:status         ডেটাবেসে কী কী আছে, আর ফোল্ডারের সঙ্গে কোথায় অমিল
 *
 * .env.local-এর DATABASE_URL ব্যবহার করে। তথ্য json কলামে থাকে, তাই ঘরের ক্রম ফাইলের মতোই থাকে।
 *
 * নিরাপত্তা: content/.db-sync.json-এ শেষবার মেলানোর সময়ের প্রতিটা তথ্যের ছাপ (hash) থাকে।
 * push কখনো অ্যাডমিন থেকে করা নতুন বদলের ওপর লেখে না, আর pull কখনো ফোল্ডারের না-তোলা বদল মোছে না;
 * দুই দিকেই বদল থাকলে সেটা "অমিল" হিসেবে জানায়। জেনেবুঝে ওপর দিয়ে লিখতে --force দিন।
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { neon } from "@neondatabase/serverless";

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, "content");
const VILLAGES = path.join(CONTENT, "villages");
const SUBMISSIONS = path.join(ROOT, "submissions");
const SYNC_FILE = path.join(CONTENT, ".db-sync.json");
/** content/ ফোল্ডারের একক ফাইলগুলো (ডেটাবেসে একই নামের key) */
export const COLLECTIONS = ["unions", "places", "people", "news", "events", "emergency", "schools"];

export function loadEnv() {
  for (const f of [".env.local", ".env"]) {
    const p = path.join(ROOT, f);
    if (!process.env.DATABASE_URL && fs.existsSync(p)) {
      try {
        process.loadEnvFile(p);
      } catch {
        /* ফাইল পড়া না গেলে পরের ফাইল */
      }
    }
  }
  return Boolean(process.env.DATABASE_URL);
}

export function getSql() {
  if (!loadEnv()) throw new Error("DATABASE_URL পাওয়া গেল না। .env.local ফাইলে দিন।");
  return neon(process.env.DATABASE_URL);
}

const SCHEMA = [
  `create table if not exists content_docs (
     key text primary key,
     data json not null,
     updated_at timestamptz not null default now()
   )`,
  `create table if not exists submissions (
     id text primary key,
     submitted_at timestamptz not null default now(),
     name text not null,
     contact text not null default '',
     union_slug text not null default '',
     village text not null,
     kind text not null default '',
     details text not null,
     links text not null default ''
   )`,
  `create table if not exists media (
     path text primary key,
     content_type text not null,
     data bytea not null,
     updated_at timestamptz not null default now()
   )`,
];

export async function setup(sql = getSql()) {
  for (const q of SCHEMA) await sql.query(q);
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + "\n", "utf8");
  fs.renameSync(tmp, file);
}

const hash = (data) => crypto.createHash("sha1").update(JSON.stringify(data)).digest("hex");

/** শেষবার মেলানোর সময়ের ছাপ: key → hash */
function readSync() {
  try {
    return JSON.parse(fs.readFileSync(SYNC_FILE, "utf8"));
  } catch {
    return {};
  }
}

function writeSync(sync) {
  writeJson(SYNC_FILE, Object.fromEntries(Object.entries(sync).sort(([a], [b]) => a.localeCompare(b))));
}

function fileForKey(key) {
  return key.startsWith("village:") ? path.join(VILLAGES, `${key.slice("village:".length)}.json`) : path.join(CONTENT, `${key}.json`);
}

/** ফোল্ডারের সব তথ্য [key, data] আকারে (গ্রামের key ফাইলের নাম থেকে, যেমন village:haripur) */
export function readLocalDocs() {
  const docs = [];
  for (const k of COLLECTIONS) {
    const file = path.join(CONTENT, `${k}.json`);
    if (fs.existsSync(file)) docs.push([k, JSON.parse(fs.readFileSync(file, "utf8"))]);
  }
  if (fs.existsSync(VILLAGES)) {
    for (const f of fs.readdirSync(VILLAGES).filter((x) => x.endsWith(".json")).sort()) {
      docs.push([`village:${f.slice(0, -".json".length)}`, JSON.parse(fs.readFileSync(path.join(VILLAGES, f), "utf8"))]);
    }
  }
  return docs;
}

async function readDbDocs(sql) {
  const rows = await sql`select key, data from content_docs`;
  return new Map(rows.map((r) => [r.key, r.data]));
}

const isContentKey = (k) => COLLECTIONS.includes(k) || k.startsWith("village:");

/**
 * ফোল্ডার → ডেটাবেস। keys দিলে শুধু সেগুলো।
 * ডেটাবেসে শেষ মেলানোর পরে বদল হয়ে থাকলে (যেমন অ্যাডমিন থেকে) সেটা ওপর দিয়ে লেখা হয় না, conflicts-এ জানানো হয়।
 */
export async function push({ keys, prune = false, force = false } = {}) {
  const sql = getSql();
  await setup(sql);
  const sync = readSync();
  const remote = await readDbDocs(sql);
  const all = readLocalDocs();
  const docs = keys ? all.filter(([k]) => keys.includes(k)) : all;
  const conflicts = [];
  const writes = [];
  for (const [k, d] of docs) {
    const local = hash(d);
    const db = remote.has(k) ? hash(remote.get(k)) : undefined;
    if (local === db) {
      sync[k] = local;
      continue;
    }
    if (db !== undefined && db !== sync[k] && !force) conflicts.push(k);
    else writes.push([k, d]);
  }
  for (let i = 0; i < writes.length; i += 50) {
    await sql.transaction(
      writes
        .slice(i, i + 50)
        .map(
          ([k, d]) =>
            sql`insert into content_docs (key, data) values (${k}, ${JSON.stringify(d)}::json)
                on conflict (key) do update set data = excluded.data, updated_at = now()`,
        ),
    );
  }
  for (const [k, d] of writes) sync[k] = hash(d);

  // ফোল্ডারে নেই এমন গ্রাম: শেষ মেলানোর পরে ডেটাবেসে না বদলালেই কেবল মোছা (অ্যাডমিনে নতুন বানানো গ্রাম থেকে যায়)
  const pruned = [];
  if (prune) {
    const local = new Set(all.map(([k]) => k));
    for (const [k, d] of remote) {
      if (local.has(k) || !k.startsWith("village:")) continue;
      if (hash(d) === sync[k] || force) pruned.push(k);
      else conflicts.push(k);
    }
    if (pruned.length) await sql`delete from content_docs where key = any(${pruned})`;
    for (const k of pruned) delete sync[k];
  }
  writeSync(sync);

  // "তথ্য দিন" ফর্মের পুরনো জমা (ফোল্ডারে থাকলে)
  let subs = 0;
  if (!keys && fs.existsSync(SUBMISSIONS)) {
    for (const f of fs.readdirSync(SUBMISSIONS).filter((x) => x.endsWith(".json"))) {
      const s = JSON.parse(fs.readFileSync(path.join(SUBMISSIONS, f), "utf8"));
      const id = f.replace(/\.json$/, "");
      await sql`insert into submissions (id, submitted_at, name, contact, union_slug, village, kind, details, links)
                values (${id}, ${s.submittedAt ?? new Date().toISOString()}, ${s.name ?? ""}, ${s.contact ?? ""}, ${s.union ?? ""},
                        ${s.village ?? ""}, ${s.kind ?? ""}, ${s.details ?? ""}, ${s.links ?? ""})
                on conflict (id) do nothing`;
      subs++;
    }
  }
  return { written: writes.map(([k]) => k), pruned, conflicts, submissions: subs };
}

/**
 * ডেটাবেস → ফোল্ডার। ডেটাবেসই আসল, তবে ফোল্ডারে শেষ মেলানোর পরে বদলানো (এখনো না-তোলা) ফাইল ওপর দিয়ে লেখা বা মোছা হয় না।
 */
export async function pull({ force = false } = {}) {
  const sql = getSql();
  const remote = await readDbDocs(sql);
  if (remote.size === 0) throw new Error("ডেটাবেসে কোনো তথ্য নেই। আগে npm run db:push চালান।");
  const sync = readSync();
  const localDocs = new Map(readLocalDocs());
  const conflicts = [];
  const written = [];
  const removed = [];
  for (const [k, d] of remote) {
    if (!isContentKey(k)) continue;
    const db = hash(d);
    const local = localDocs.has(k) ? hash(localDocs.get(k)) : undefined;
    if (local === db) {
      sync[k] = db;
      continue;
    }
    if (local !== undefined && local !== sync[k] && !force) {
      conflicts.push(k);
      continue;
    }
    writeJson(fileForKey(k), d);
    sync[k] = db;
    written.push(k);
  }
  // ডেটাবেসে নেই এমন গ্রামের ফাইল: অ্যাডমিন থেকে মোছা হয়েছে, যদি না ফোল্ডারে এটা নতুন বা বদলানো হয়
  for (const [k, d] of localDocs) {
    if (remote.has(k) || !k.startsWith("village:")) continue;
    if (hash(d) === sync[k] || force) {
      fs.unlinkSync(fileForKey(k));
      delete sync[k];
      removed.push(k);
    } else conflicts.push(k);
  }
  writeSync(sync);
  return { docs: remote.size, written, removed, conflicts };
}

export async function status() {
  const sql = getSql();
  const docs = await sql`select count(*)::int as n, count(*) filter (where key like 'village:%')::int as villages, max(updated_at) as last from content_docs`;
  const subs = await sql`select count(*)::int as n from submissions`;
  const media = await sql`select count(*)::int as n, coalesce(sum(octet_length(data)), 0)::bigint as bytes from media`;
  const remote = await readDbDocs(sql);
  const local = new Map(readLocalDocs());
  const differs = [...local].filter(([k, d]) => remote.has(k) && hash(remote.get(k)) !== hash(d)).map(([k]) => k);
  const onlyLocal = [...local.keys()].filter((k) => !remote.has(k));
  const onlyDb = [...remote.keys()].filter((k) => isContentKey(k) && !local.has(k));
  return {
    docs: docs[0],
    submissions: subs[0].n,
    media: { count: media[0].n, kb: Math.round(Number(media[0].bytes) / 1024) },
    folder: { differs, onlyLocal, onlyDb },
  };
}

/** দুই দিকেই বদল হওয়া তথ্যের তালিকা ছাপানো */
export function report(conflicts) {
  if (!conflicts.length) return;
  console.log(`\nঅমিল ${conflicts.length}টি (দুই দিকেই বদল হয়েছে, তাই ছোঁয়া হয়নি): ${conflicts.join(", ")}`);
  console.log("কোনটা রাখবেন ঠিক করে --force দিয়ে আবার চালান (push --force: ফোল্ডারেরটা থাকবে, pull --force: ডেটাবেসেরটা)।");
  process.exitCode = 1;
}

async function main() {
  const cmd = process.argv[2];
  if (cmd === "setup") {
    await setup();
    console.log("টেবিল তৈরি (বা আগেই ছিল)।");
  } else if (cmd === "push") {
    const keys = process.argv.slice(3).filter((a) => !a.startsWith("--"));
    const r = await push({ keys: keys.length ? keys : undefined, prune: process.argv.includes("--prune"), force: process.argv.includes("--force") });
    const list = r.written.length ? ` (${r.written.join(", ")})` : "";
    const pruned = r.pruned.length ? `; মোছা হলো: ${r.pruned.join(", ")}` : "";
    console.log(`ডেটাবেসে তোলা হলো: ${r.written.length}টি তথ্য-ফাইল${list}, ${r.submissions}টি জমা${pruned}।`);
    report(r.conflicts);
  } else if (cmd === "pull") {
    const r = await pull({ force: process.argv.includes("--force") });
    const removed = r.removed.length ? `, মুছল ${r.removed.length}টি` : "";
    console.log(`ডেটাবেসে ${r.docs}টি তথ্য-ফাইল; content/ ফোল্ডারে বদলাল ${r.written.length}টি${removed}।`);
    report(r.conflicts);
  } else if (cmd === "status") {
    console.log(JSON.stringify(await status(), null, 2));
  } else {
    console.log("ব্যবহার: node scripts/db.mjs setup | push [key ...] [--prune] [--force] | pull [--force] | status");
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error("ত্রুটি:", e.message);
    process.exit(1);
  });
}

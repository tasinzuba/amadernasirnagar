import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { getSql, hasDatabase } from "@/lib/db";

/**
 * "তথ্য দিন" ফর্মে জমা পড়া তথ্য: রাখা, পড়া ও মোছা।
 * DATABASE_URL থাকলে ডেটাবেসের submissions টেবিলে, না থাকলে submissions/ ফোল্ডারে (প্রতিটা জমা একটা JSON ফাইল)।
 */

const submissionsDir = path.join(process.cwd(), "submissions");

export interface Submission {
  id: string;
  name: string;
  contact: string;
  union: string;
  village: string;
  kind: string;
  details: string;
  links: string;
  submittedAt: string;
}

export type NewSubmission = Omit<Submission, "id" | "submittedAt">;

function safeId(id: string): boolean {
  return /^[a-z0-9-]+$/i.test(id);
}

/** নতুন জমা রাখা; না পারলে error ছুড়ে দেয় (ফর্ম তখন ব্যবহারকারীকে জানায়) */
export async function addSubmission(input: NewSubmission): Promise<void> {
  const id = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const submittedAt = new Date().toISOString();
  if (hasDatabase()) {
    await getSql()`insert into submissions (id, submitted_at, name, contact, union_slug, village, kind, details, links)
                   values (${id}, ${submittedAt}, ${input.name}, ${input.contact}, ${input.union}, ${input.village},
                           ${input.kind}, ${input.details}, ${input.links})`;
    return;
  }
  fs.mkdirSync(submissionsDir, { recursive: true });
  fs.writeFileSync(path.join(submissionsDir, `${id}.json`), JSON.stringify({ ...input, submittedAt }, null, 2), "utf8");
}

export async function listSubmissions(): Promise<Submission[]> {
  if (hasDatabase()) {
    const rows = (await getSql()`select id, submitted_at, name, contact, union_slug, village, kind, details, links
                                 from submissions order by submitted_at desc`) as Record<string, unknown>[];
    return rows.map((r) => ({
      id: String(r.id),
      name: String(r.name ?? ""),
      contact: String(r.contact ?? ""),
      union: String(r.union_slug ?? ""),
      village: String(r.village ?? ""),
      kind: String(r.kind ?? ""),
      details: String(r.details ?? ""),
      links: String(r.links ?? ""),
      submittedAt: new Date(r.submitted_at as string).toISOString(),
    }));
  }
  if (!fs.existsSync(submissionsDir)) return [];
  return fs
    .readdirSync(submissionsDir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .reverse()
    .map((f) => {
      try {
        const raw = JSON.parse(fs.readFileSync(path.join(submissionsDir, f), "utf8")) as Partial<Submission>;
        return {
          id: f.replace(/\.json$/, ""),
          name: raw.name ?? "",
          contact: raw.contact ?? "",
          union: raw.union ?? "",
          village: raw.village ?? "",
          kind: raw.kind ?? "",
          details: raw.details ?? "",
          links: raw.links ?? "",
          submittedAt: raw.submittedAt ?? "",
        };
      } catch {
        return null;
      }
    })
    .filter((s): s is Submission => s !== null);
}

export async function deleteSubmission(id: string): Promise<boolean> {
  if (!safeId(id)) return false;
  if (hasDatabase()) {
    const rows = await getSql()`delete from submissions where id = ${id} returning id`;
    return rows.length > 0;
  }
  const file = path.join(submissionsDir, `${id}.json`);
  if (!fs.existsSync(file)) return false;
  fs.unlinkSync(file);
  return true;
}

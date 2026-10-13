/** অ্যাডমিন ফর্মের FormData পড়ার সহায়ক ফাংশন */

const bnDigits = "০১২৩৪৫৬৭৮৯";

/** বাংলা অঙ্ক থাকলে ইংরেজি অঙ্কে রূপান্তর */
export function toEnDigits(s: string): string {
  return s.replace(/[০-৯]/g, (d) => String(bnDigits.indexOf(d)));
}

export function str(fd: FormData, name: string): string | undefined {
  const v = fd.get(name);
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t ? t : undefined;
}

export function req(fd: FormData, name: string): string {
  return str(fd, name) ?? "";
}

export function num(fd: FormData, name: string): number | undefined {
  const s = str(fd, name);
  if (s === undefined) return undefined;
  const n = Number(toEnDigits(s).replace(/,/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

export function int(fd: FormData, name: string): number | undefined {
  const n = num(fd, name);
  return n === undefined ? undefined : Math.round(n);
}

export function bool(fd: FormData, name: string): boolean {
  const v = fd.get(name);
  return v === "on" || v === "true" || v === "1";
}

/** টেক্সটএরিয়ার প্রতি লাইন একটি আইটেম */
export function lines(fd: FormData, name: string): string[] | undefined {
  const v = fd.get(name);
  if (typeof v !== "string") return undefined;
  const arr = v
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  return arr.length ? arr : undefined;
}

/** ফাঁকা লাইন দিয়ে আলাদা অনুচ্ছেদ */
export function paragraphs(fd: FormData, name: string): string[] | undefined {
  const v = fd.get(name);
  if (typeof v !== "string") return undefined;
  const arr = v
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.replace(/\s*\r?\n\s*/g, " ").trim())
    .filter(Boolean);
  return arr.length ? arr : undefined;
}

/** একই নামের একাধিক মান (চেকবক্স গ্রুপ) */
export function list(fd: FormData, name: string): string[] | undefined {
  const arr = fd
    .getAll(name)
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean);
  return arr.length ? arr : undefined;
}

/**
 * সারি-এডিটরের মান: প্রতিটি কলাম `${prefix}.${key}` নামে বারবার আসে, একই ইনডেক্স = একই সারি।
 * সব কলাম খালি এমন সারি বাদ যায়।
 */
export function rows<K extends string>(fd: FormData, prefix: string, keys: readonly K[]): Record<K, string>[] {
  const columns = keys.map((k) => fd.getAll(`${prefix}.${k}`).map((v) => (typeof v === "string" ? v.trim() : "")));
  const count = Math.max(0, ...columns.map((c) => c.length));
  const out: Record<K, string>[] = [];
  for (let i = 0; i < count; i++) {
    const row = {} as Record<K, string>;
    let hasValue = false;
    keys.forEach((k, ki) => {
      const value = columns[ki][i] ?? "";
      row[k] = value;
      if (value) hasValue = true;
    });
    if (hasValue) out.push(row);
  }
  return out;
}

export function files(fd: FormData, name: string): File[] {
  return fd.getAll(name).filter((f): f is File => f instanceof File && f.size > 0);
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

/** ইংরেজি নাম থেকে slug: "Haripur Bazar" → haripur-bazar */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** undefined বা খালি অ্যারে বাদ দিয়ে পরিষ্কার অবজেক্ট (JSON ছোট থাকে) */
export function compact<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v) && v.length === 0) continue;
    out[k] = v;
  }
  return out as T;
}

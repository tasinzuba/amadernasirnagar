"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toBn } from "@/lib/bn";
import type { SchoolType } from "@/lib/types";
import { SchoolCard, type SchoolCardData } from "./cards";

export interface SchoolListItem extends SchoolCardData {
  union: string;
  /** খোঁজার জন্য: বাংলা ও ইংরেজি নাম, গ্রাম, ইউনিয়ন, EIIN */
  search: string;
}

/** ধরনের শিরোনাম (বহুবচন) */
const groupTitle: Record<SchoolType, string> = {
  কলেজ: "কলেজ",
  "স্কুল অ্যান্ড কলেজ": "স্কুল অ্যান্ড কলেজ",
  "উচ্চ বিদ্যালয়": "উচ্চ বিদ্যালয় (মাধ্যমিক)",
  "নিম্ন মাধ্যমিক বিদ্যালয়": "নিম্ন মাধ্যমিক বিদ্যালয়",
  মাদ্রাসা: "মাদ্রাসা",
  "কারিগরি প্রতিষ্ঠান": "কারিগরি প্রতিষ্ঠান",
  "প্রাথমিক বিদ্যালয়": "প্রাথমিক বিদ্যালয়",
  অন্যান্য: "অন্যান্য প্রতিষ্ঠান",
};

/** শিক্ষা প্রতিষ্ঠানের তালিকা: নাম বা গ্রাম দিয়ে খোঁজা, ইউনিয়ন ও ধরন বাছাই; ধরন অনুযায়ী ভাগ করে দেখায় */
export function SchoolDirectory({ items, unions, types }: { items: SchoolListItem[]; unions: { slug: string; name: string }[]; types: SchoolType[] }) {
  const [query, setQuery] = useState("");
  const [union, setUnion] = useState("");
  const [type, setType] = useState<SchoolType | "">("");

  const q = query.trim().toLowerCase();
  const matched = useMemo(
    () => items.filter((i) => (!union || i.union === union) && (!q || i.search.includes(q))),
    [items, union, q],
  );
  const shown = type ? matched.filter((i) => i.type === type) : matched;
  const groups = types.map((t) => ({ type: t, items: shown.filter((i) => i.type === t) })).filter((g) => g.items.length > 0);

  return (
    <div>
      <div className="c-card grid grid-cols-1 gap-4 p-5 sm:p-6 lg:grid-cols-[1fr_260px]">
        <label className="relative block">
          <span className="sr-only">প্রতিষ্ঠান বা গ্রামের নাম</span>
          <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="প্রতিষ্ঠান, গ্রাম বা EIIN লিখে খুঁজুন..."
            className="c-input pl-13"
          />
        </label>
        <label className="block">
          <span className="sr-only">ইউনিয়ন</span>
          <select value={union} onChange={(e) => setUnion(e.target.value)} className="c-input">
            <option value="">সব ইউনিয়ন</option>
            {unions.map((u) => (
              <option key={u.slug} value={u.slug}>
                {u.name} ইউনিয়ন
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-2 lg:col-span-2" role="group" aria-label="ধরন অনুযায়ী">
          <TypeChip active={type === ""} onClick={() => setType("")} label={`সব (${toBn(matched.length)})`} />
          {types.map((t) => {
            const n = matched.filter((i) => i.type === t).length;
            return n > 0 ? <TypeChip key={t} active={type === t} onClick={() => setType(t)} label={`${t} (${toBn(n)})`} /> : null;
          })}
        </div>
      </div>

      <p className="mt-6 text-ink-500" aria-live="polite">
        {shown.length > 0 ? `${toBn(shown.length)}টি প্রতিষ্ঠান দেখানো হচ্ছে` : "এই খোঁজে কোনো প্রতিষ্ঠান পাওয়া যায়নি। অন্য নাম বা বানানে চেষ্টা করুন।"}
      </p>

      <div className="mt-8 space-y-16">
        {groups.map((g) => (
          <section key={g.type} aria-labelledby={`group-${g.type}`}>
            <h2 id={`group-${g.type}`} className="font-display text-[2.1rem] font-bold leading-tight text-brand-900">
              {groupTitle[g.type]} <span className="font-sans text-lg font-normal text-ink-400">({toBn(g.items.length)})</span>
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {g.items.map((s) => (
                <SchoolCard key={s.slug} school={s} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function TypeChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-2 text-[0.95rem] font-semibold transition-colors ${
        active ? "border-accent-500 bg-accent-500 text-white" : "border-line bg-white text-brand-900 hover:border-accent-400 hover:text-accent-600"
      }`}
    >
      {label}
    </button>
  );
}

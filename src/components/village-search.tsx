"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { VillageCard, type VillageCardData } from "./cards";
import { Lamp } from "./status-badge";
import { toBn } from "@/lib/bn";

export interface VillageListItem extends VillageCardData {
  nameEn: string;
  union: string;
}

export function VillageSearch({
  villages,
  unions,
}: {
  villages: VillageListItem[];
  unions: { slug: string; name: string }[];
}) {
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [union, setUnion] = useState(searchParams.get("union") ?? "");
  const [onlyWithInfo, setOnlyWithInfo] = useState(false);

  // URL-এ q ও union রাখা, যাতে লিংক শেয়ার করা যায়
  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (union) params.set("union", union);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [q, union]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return villages.filter((v) => {
      if (union && v.union !== union) return false;
      if (onlyWithInfo && v.status === "stub") return false;
      if (!needle) return true;
      return (
        v.name.includes(needle) ||
        v.nameEn.toLowerCase().includes(needle) ||
        v.unionName.includes(needle)
      );
    });
  }, [villages, q, union, onlyWithInfo]);

  return (
    <div>
      <div className="c-card grid gap-4 p-4 sm:grid-cols-[1fr_220px_auto] sm:items-end sm:p-5">
        <div>
          <label htmlFor="village-q" className="c-label">
            গ্রামের নাম
          </label>
          <input
            id="village-q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="গ্রামের নাম লিখুন..."
            className="c-input"
          />
        </div>
        <div>
          <label htmlFor="village-union" className="c-label">
            ইউনিয়ন
          </label>
          <select
            id="village-union"
            value={union}
            onChange={(e) => setUnion(e.target.value)}
            className="c-input"
          >
            <option value="">সব ইউনিয়ন</option>
            {unions.map((u) => (
              <option key={u.slug} value={u.slug}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <label className="flex h-14 items-center gap-2 text-[0.95rem] font-semibold text-ink-700">
          <input
            type="checkbox"
            checked={onlyWithInfo}
            onChange={(e) => setOnlyWithInfo(e.target.checked)}
            className="h-4 w-4 accent-brand-700"
          />তথ্য যুক্ত হয়েছে যেসব গ্রামে</label>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm text-ink-500">
        <p aria-live="polite">
          {q.trim() ? <>“{q.trim()}” লিখে </> : null}
          {toBn(results.length)}টি গ্রাম পাওয়া গেল
        </p>
        <p className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <Lamp status="partial" />{" "}তথ্য সংরক্ষিত</span>
          <span className="inline-flex items-center gap-1.5">
            <Lamp status="stub" />{" "}তথ্য অপেক্ষমাণ</span>
        </p>
      </div>

      {results.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-line-strong p-8 text-center">
          <p className="font-display text-[1.6rem] font-bold text-brand-900">এই নামে কোনো গ্রাম পাওয়া যায়নি</p>
          <p className="mt-1 text-sm text-ink-600">বানান পরিবর্তন করে আবার খুঁজুন। এরপরও না পেলে গ্রামটির তথ্য আমাদের{" "}<a
              href={`/contribute?village=${encodeURIComponent(q.trim())}`}
              className="text-link"
            >
              আমাদের জানাবেন
            </a>
            ।
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((v) => (
            <VillageCard key={v.slug} village={v} />
          ))}
        </div>
      )}
    </div>
  );
}

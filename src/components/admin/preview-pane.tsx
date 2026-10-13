"use client";

import { useState } from "react";

/** সাইটের আসল পাতা iframe-এ; সেভের পর (savedAt বদলালে) আপনা-আপনি রিলোড হয় */
export function PreviewPane({ href, savedAt }: { href: string; savedAt?: number }) {
  const [reloads, setReloads] = useState(0);
  const key = `${savedAt ?? 0}-${reloads}`;
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-ink-100 bg-white">
      <div className="flex items-center justify-between gap-2 border-b border-ink-100 bg-ink-50 px-3 py-2 text-xs">
        <span className="font-semibold text-ink-700">প্রিভিউ</span>
        <span className="flex items-center gap-2">
          <button type="button" onClick={() => setReloads((n) => n + 1)} className="rounded-xl border border-ink-150 bg-white px-2 py-1 font-semibold text-ink-700 hover:border-brand-500">
            রিফ্রেশ
          </button>
          <a href={href} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-ink-150 bg-white px-2 py-1 font-semibold text-brand-600 hover:border-brand-500">
            নতুন ট্যাবে
          </a>
        </span>
      </div>
      <iframe key={key} src={href} title="প্রিভিউ" className="h-[75vh] w-full flex-1 bg-white" />
    </div>
  );
}

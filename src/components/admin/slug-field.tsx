"use client";

import { useState } from "react";
import { slugify } from "@/lib/admin/form";

/** slug ইনপুট: নতুন আইটেমে ইংরেজি নাম থেকে আপনা-আপনি তৈরি হয়; পুরনো আইটেমে বদলানো যায় না */
export function SlugField({ initial, isNew, sourceInputId = "nameEn" }: { initial?: string; isNew: boolean; sourceInputId?: string }) {
  const [value, setValue] = useState(initial ?? "");
  return (
    <div>
      <label htmlFor="slug" className="c-label">
        slug (URL-এর অংশ) <span className="text-danger-500">*</span>
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="slug"
          name="slug"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          readOnly={!isNew}
          required
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          placeholder="যেমন haripur-bazar"
          className={`c-input font-mono ${isNew ? "" : "bg-ink-50 text-ink-400"}`}
        />
        {isNew && (
          <button
            type="button"
            className="c-btn c-btn--outline shrink-0"
            onClick={() => {
              const source = document.getElementById(sourceInputId) as HTMLInputElement | null;
              if (source) setValue(slugify(source.value));
            }}
          >
            ইংরেজি নাম থেকে
          </button>
        )}
      </div>
      <p className="mt-1 text-xs text-ink-300">{isNew ? "শুধু ইংরেজি ছোট হাতের অক্ষর, সংখ্যা ও হাইফেন। সেভের পর বদলানো যাবে না।" : "তৈরির পর slug বদলানো যায় না।"}</p>
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { submitContribution, type ContributeState } from "@/actions/contribute";

const kinds = [
  "গ্রামের পরিচিতি ও ইতিহাস",
  "ঐতিহাসিক ও দর্শনীয় স্থান",
  "কৃতী ব্যক্তিত্ব",
  "শিক্ষা ও ধর্মীয় প্রতিষ্ঠান",
  "হাট-বাজারের তথ্য",
  "যাতায়াত ও যোগাযোগ",
  "উৎসব ও স্থানীয় আয়োজন",
  "ছবি ও তথ্যসূত্র",
  "তথ্য সংশোধন",
  "অন্যান্য",
];

export function ContributeForm({ unions }: { unions: { slug: string; name: string }[] }) {
  const searchParams = useSearchParams();
  const defaultVillage = searchParams.get("village") ?? "";
  const defaultUnion = searchParams.get("union") ?? "";
  const askedKind = searchParams.get("kind") ?? "";
  const defaultKind = kinds.includes(askedKind) ? askedKind : "";
  const [state, formAction, pending] = useActionState<ContributeState, FormData>(submitContribution, null);

  if (state?.ok) {
    return (
      <div className="rounded-xl border border-brand-200 bg-brand-50 p-6 text-center" role="status">
        <p className="text-lg font-bold text-ink-900">{state.message}</p>
        <p className="mt-2 text-sm text-ink-600">আরও তথ্য দিতে চাইলে ফর্মটি আবার পূরণ করুন।</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid grid-cols-1 gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="c-label">
            আপনার নাম <span className="text-danger-500">*</span>
          </label>
          <input id="name" name="name" required maxLength={120} className="c-input" placeholder="আপনার নাম লিখুন" />
        </div>
        <div>
          <label htmlFor="contact" className="c-label">
            মোবাইল / ইমেইল
          </label>
          <input id="contact" name="contact" maxLength={120} className="c-input" placeholder="যোগাযোগের তথ্য দিন" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="union" className="c-label">
            ইউনিয়ন
          </label>
          <select id="union" name="union" defaultValue={defaultUnion} className="c-input">
            <option value="">ইউনিয়ন বেছে নিন</option>
            {unions.map((u) => (
              <option key={u.slug} value={u.slug}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="village" className="c-label">
            গ্রামের নাম <span className="text-danger-500">*</span>
          </label>
          <input
            id="village"
            name="village"
            required
            maxLength={120}
            defaultValue={defaultVillage}
            className="c-input"
            placeholder="গ্রামের নাম লিখুন"
          />
        </div>
      </div>

      <div>
        <label htmlFor="kind" className="c-label">
          তথ্যের বিষয়
        </label>
        <select id="kind" name="kind" defaultValue={defaultKind} className="c-input">
            <option value="">বিষয় নির্বাচন করুন</option>
          {kinds.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="details" className="c-label">
          বিস্তারিত তথ্য <span className="text-danger-500">*</span>
        </label>
        <textarea
          id="details"
          name="details"
          required
          rows={7}
          maxLength={5000}
          className="c-input"
          placeholder="আপনার জানা তথ্য লিখুন..."
        />
      </div>

      <div>
        <label htmlFor="links" className="c-label">
          ছবি / তথ্যসূত্র
        </label>
        <textarea
          id="links"
          name="links"
          rows={2}
          maxLength={2000}
          className="c-input"
          placeholder="ছবি বা লিংক যুক্ত করুন"
        />
        <p className="mt-1 text-xs text-ink-300">নিজের তোলা বা অনুমতিপ্রাপ্ত ছবি যুক্ত করুন।</p>
      </div>

      {/* honeypot: বট ধরার জন্য, মানুষ দেখতে পাবে না */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state && !state.ok && (
        <p className="rounded-xl bg-danger-50 px-4 py-3 text-sm font-semibold text-danger-700" role="alert">
          {state.message}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className="c-btn c-btn--solid c-btn--lg disabled:cursor-not-allowed disabled:opacity-60">
          {pending ? (
            "জমা দেওয়া হচ্ছে…"
          ) : (
            <>
              তথ্য জমা দিন
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </>
          )}
        </button>
        <p className="text-xs text-ink-300">যাচাই শেষে তথ্যটি আপনার নামসহ প্রকাশ করা হবে।</p>
      </div>
    </form>
  );
}

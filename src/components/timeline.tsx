import { upazila } from "@/data/upazila";

/** উপজেলার ইতিহাসের মাইলফলক (সত্যিকারের ক্রম): ডেস্কটপে আনুভূমিক রেখা, মোবাইলে উল্লম্ব */
export function Timeline({ compact = false, vertical = false }: { compact?: boolean; vertical?: boolean }) {
  const items = upazila.timeline;
  const lg = (cls: string) => (vertical ? "" : cls);
  return (
    <div className="relative">
      <div
        className={`absolute bottom-2 left-[5px] top-2 w-px bg-line-strong ${lg("lg:bottom-auto lg:left-0 lg:right-0 lg:top-[5px] lg:h-px lg:w-auto")}`}
        aria-hidden="true"
      />
      <ol className={`grid grid-cols-1 gap-8 ${lg("lg:grid-cols-6 lg:gap-6")}`}>
        {items.map((item, i) => (
          <li key={item.year} className={`relative pl-8 ${lg("lg:pl-0 lg:pt-8")}`}>
            <span
              className={`absolute left-0 top-[9px] h-[11px] w-[11px] rounded-full ring-4 ring-white ${lg("lg:top-0")} ${
                i === items.length - 1 ? "bg-accent-400" : "bg-brand-700"
              }`}
              aria-hidden="true"
            />
            <p className="font-display text-[2.2rem] font-bold leading-none text-brand-900">{item.year}</p>
            <p className="mt-2 font-semibold text-ink-800">{item.title}</p>
            {!compact && <p className="mt-1 text-[0.95rem] leading-relaxed text-ink-500">{item.text}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}

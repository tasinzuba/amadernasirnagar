import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

/** tone="dark": গাঢ় শিরোনাম-ব্যান্ডের জন্য সাদাটে লেখা, বর্তমান পেজ থিমের উজ্জ্বল রঙে */
export function Breadcrumbs({ items, tone = "light" }: { items: Crumb[]; tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  const link = dark ? "transition-colors hover:text-white" : "transition-colors hover:text-accent-600";
  return (
    <nav aria-label="ব্রেডক্রাম্ব" className={`min-w-0 text-[0.95rem] ${dark ? "text-white/60" : "text-ink-500"}`}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <li>
          <Link href="/" className={link}>
            হোম
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-2">
            <ChevronRight className={`h-4 w-4 ${dark ? "text-white/30" : "text-ink-300"}`} aria-hidden="true" />
            {item.href ? (
              <Link href={item.href} className={link}>
                {item.label}
              </Link>
            ) : (
              <span className={`font-semibold ${dark ? "text-[var(--theme-accent)]" : "text-accent-600"}`}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

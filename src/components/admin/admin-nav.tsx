"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const adminNav = [
  { href: "/admin", label: "ড্যাশবোর্ড" },
  { href: "/admin/villages", label: "গ্রাম" },
  { href: "/admin/unions", label: "ইউনিয়ন" },
  { href: "/admin/places", label: "দর্শনীয় স্থান" },
  { href: "/admin/schools", label: "শিক্ষা প্রতিষ্ঠান" },
  { href: "/admin/people", label: "বিশিষ্ট ব্যক্তি" },
  { href: "/admin/news", label: "খবর ও ঘোষণা" },
  { href: "/admin/events", label: "উৎসব ও মেলা" },
  { href: "/admin/emergency", label: "জরুরি নম্বর" },
  { href: "/admin/submissions", label: "জমা পড়া তথ্য" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="grid grid-cols-1 gap-0.5" aria-label="অ্যাডমিন মেনু">
      {adminNav.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              active ? "bg-white/10 text-white shadow-[inset_3px_0_0_#ff3951]" : "text-brand-200 hover:bg-white/5 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

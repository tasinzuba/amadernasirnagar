"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bus, Calendar, ChevronDown, GraduationCap, Info, Landmark, Map, Phone, type LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { isActivePath, type NavItem } from "./nav-links";

/** সহায়ক লিংকের আইকন ও রং (ড্রপডাউন ও মোবাইল মেনুতে) */
export const navIcons: Record<string, { icon: LucideIcon; tone: string }> = {
  "/schools": { icon: GraduationCap, tone: "bg-iris-50 text-iris-500" },
  "/events": { icon: Calendar, tone: "bg-accent-50 text-accent-500" },
  "/transport": { icon: Bus, tone: "bg-azure-50 text-azure-500" },
  "/upazila": { icon: Landmark, tone: "bg-iris-50 text-iris-500" },
  "/map": { icon: Map, tone: "bg-sky-50 text-sky-500" },
  "/emergency": { icon: Phone, tone: "bg-accent-50 text-accent-500" },
  "/about": { icon: Info, tone: "bg-sunny-50 text-[#c99000]" },
};

/** ডেস্কটপ মেনু: সক্রিয় পাতা কোরাল; "আরও" চাপলে আইকনসহ ড্রপডাউন */
export function NavMenu({ items, more }: { items: readonly NavItem[]; more: readonly NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const moreActive = more.some((m) => isActivePath(m.href, pathname));

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const linkClass = (active: boolean) =>
    `whitespace-nowrap px-3.5 py-2 text-[1.0625rem] transition-colors ${
      active ? "font-semibold text-accent-600" : "text-brand-900 hover:text-accent-600"
    }`;

  return (
    <nav aria-label="প্রধান মেনু" className="flex items-center gap-1">
      {items.map((item) => {
        const active = isActivePath(item.href, pathname);
        return (
          <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={linkClass(active)}>
            {item.label}
          </Link>
        );
      })}

      <div ref={wrap} className="relative">
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={() => setOpen((v) => !v)}
          className={`${linkClass(moreActive)} inline-flex items-center gap-1`}
        >
          আরও
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              role="menu"
              key="more-menu"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
              className="absolute left-1/2 top-full mt-5 w-[23rem] -translate-x-1/2 rounded-[24px] border border-line bg-white p-3 shadow-pop"
            >
              {more.map((m) => {
                const meta = navIcons[m.href];
                const Icon = meta?.icon;
                const active = isActivePath(m.href, pathname);
                return (
                  <Link
                    key={m.href}
                    href={m.href}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-4 rounded-2xl px-3 py-3 transition-colors hover:bg-brand-50 ${active ? "bg-brand-50" : ""}`}
                  >
                    {Icon && (
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${meta.tone}`}>
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                    <span>
                      <span className="block font-semibold text-brand-900">{m.label}</span>
                      {m.description && <span className="block text-sm leading-snug text-ink-500">{m.description}</span>}
                    </span>
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

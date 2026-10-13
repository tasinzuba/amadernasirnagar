"use client";

import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { navIcons } from "./nav-menu";
import { SearchForm } from "./search-form";
import type { NavItem } from "./nav-links";

const noopSubscribe = () => () => {};

/**
 * মোবাইল মেনু: ডান দিক থেকে আসা শিট।
 * হেডারে backdrop-blur থাকায় fixed উপাদান হেডারের ভেতরে আটকে যায়, তাই শিটটি body-তে portal করা হয়।
 */
export function MobileNav({ primary, more }: { primary: readonly NavItem[]; more: readonly NavItem[] }) {
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const sheet = (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            key="overlay"
            aria-label="মেনু বন্ধ করুন"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="fixed inset-0 z-50 bg-brand-900/40 backdrop-blur-sm"
          />
          <motion.div
            id="mobile-menu"
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label="মেনু"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
            className="fixed inset-y-0 right-0 z-50 flex w-[90%] max-w-sm flex-col rounded-l-[32px] bg-white shadow-pop"
          >
            <div className="flex h-20 shrink-0 items-center justify-between px-6">
              <span className="font-display text-2xl font-bold text-brand-900">মেনু</span>
              <button
                type="button"
                onClick={close}
                aria-label="বন্ধ করুন"
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-brand-900 shadow-soft"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <SearchForm id="mobile-search" className="w-full" />

              <nav className="mt-6" aria-label="প্রধান মেনু">
                <ul className="grid gap-1">
                  {primary.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={close}
                        className="flex items-center justify-between rounded-2xl px-3 py-3 font-display text-[1.35rem] font-bold text-brand-900 transition-colors hover:bg-brand-50 hover:text-accent-600"
                      >
                        {item.label}
                        <ArrowRight className="h-5 w-5 text-ink-300" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <ul className="mt-4 grid gap-1 border-t border-line pt-4">
                {more.map((m) => {
                  const meta = navIcons[m.href];
                  const Icon = meta?.icon;
                  return (
                    <li key={m.href}>
                      <Link href={m.href} onClick={close} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-brand-50">
                        {Icon && (
                          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.tone}`}>
                            <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                          </span>
                        )}
                        <span className="font-semibold text-brand-900">{m.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="shrink-0 p-6 pt-0">
              <Link href="/contribute" onClick={close} className="c-btn c-btn--solid w-full">নিজের গ্রামের তথ্য জমা দিন<ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label="মেনু খুলুন"
        onClick={() => setOpen(true)}
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-brand-900 shadow-soft"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>
      {mounted && createPortal(sheet, document.body)}
    </div>
  );
}

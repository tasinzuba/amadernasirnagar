"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState, type ReactNode } from "react";

/** রেফারেন্সের সাদা গোল তীর-বোতাম */
function ArrowButton({ dir, onClick, label }: { dir: "prev" | "next"; onClick: () => void; label: string }) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-brand-900 shadow-soft transition-colors hover:text-accent-600 sm:h-[4.75rem] sm:w-[4.75rem]"
    >
      <Icon className="h-7 w-7" strokeWidth={2.2} aria-hidden="true" />
    </button>
  );
}

/**
 * আড়াআড়ি স্ক্রল করা কার্ডের সারি; শিরোনামের ডানে আগের/পরের তীর।
 * header সার্ভার থেকে আসা JSX; সারির প্রতিটি কার্ডে snap-start ও প্রস্থ দিতে হয়।
 */
export function ScrollRow({ header, children, label }: { header: ReactNode; children: ReactNode; label: string }) {
  const row = useRef<HTMLDivElement>(null);
  const go = (dir: 1 | -1) => {
    const el = row.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const step = first ? first.offsetWidth + 32 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
        {header}
        <div className="flex gap-4">
          <ArrowButton dir="prev" onClick={() => go(-1)} label="আগের কার্ড" />
          <ArrowButton dir="next" onClick={() => go(1)} label="পরের কার্ড" />
        </div>
      </div>
      <div
        ref={row}
        role="region"
        aria-label={label}
        tabIndex={0}
        className="-mx-5 mt-12 flex snap-x snap-mandatory gap-8 overflow-x-auto scroll-px-5 px-5 pb-12 pt-2 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </div>
  );
}

/** একবারে একটি স্লাইড; দুই পাশে তীর (মোবাইলে নিচে), নিচে বিন্দু */
export function Slides({ slides, label }: { slides: ReactNode[]; label: string }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const n = slides.length;
  const go = (d: 1 | -1) => {
    setDir(d);
    setIndex((v) => (v + d + n) % n);
  };
  const jump = (i: number) => {
    setDir(i > index ? 1 : -1);
    setIndex(i);
  };

  return (
    <div className="relative" role="region" aria-roledescription="carousel" aria-label={label}>
      <div className="lg:px-28">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={{ opacity: 0, x: dir * 48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -48 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            aria-live="polite"
          >
            {slides[index]}
          </motion.div>
        </AnimatePresence>
      </div>

      {n > 1 && (
        <>
          <div className="absolute left-0 top-1/2 hidden -translate-y-1/2 lg:block">
            <ArrowButton dir="prev" onClick={() => go(-1)} label="আগেরটি" />
          </div>
          <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 lg:block">
            <ArrowButton dir="next" onClick={() => go(1)} label="পরেরটি" />
          </div>
          <div className="mt-8 flex items-center justify-center gap-5">
            <div className="lg:hidden">
              <ArrowButton dir="prev" onClick={() => go(-1)} label="আগেরটি" />
            </div>
            <div className="flex gap-2.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => jump(i)}
                  aria-label={`${i + 1} নম্বর স্লাইড`}
                  aria-current={i === index ? "true" : undefined}
                  className={`h-2.5 rounded-full transition-all ${i === index ? "w-8 bg-accent-500" : "w-2.5 bg-brand-200 hover:bg-brand-300"}`}
                />
              ))}
            </div>
            <div className="lg:hidden">
              <ArrowButton dir="next" onClick={() => go(1)} label="পরেরটি" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

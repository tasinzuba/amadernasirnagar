"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState, type ReactNode } from "react";

/** তীর-বোতামের মাপ: lg = শিরোনামের পাশে বড়, sm = ফোনে কার্ডের কিনারায় ছোট, fluid = ফোনে ছোট আর বড় পর্দায় বড় */
const arrowSize = {
  lg: { button: "h-14 w-14 sm:h-[4.75rem] sm:w-[4.75rem]", icon: "h-7 w-7" },
  sm: { button: "h-11 w-11 ring-1 ring-line", icon: "h-6 w-6" },
  fluid: { button: "h-11 w-11 ring-1 ring-line lg:h-[4.75rem] lg:w-[4.75rem] lg:ring-0", icon: "h-6 w-6 lg:h-7 lg:w-7" },
};

/** রেফারেন্সের সাদা গোল তীর-বোতাম */
function ArrowButton({
  dir,
  onClick,
  label,
  size = "lg",
  disabled,
}: {
  dir: "prev" | "next";
  onClick: () => void;
  label: string;
  size?: keyof typeof arrowSize;
  disabled?: boolean;
}) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      className={`flex items-center justify-center rounded-full bg-white text-brand-900 shadow-soft transition-[color,opacity] hover:text-accent-600 disabled:cursor-default disabled:opacity-40 disabled:hover:text-brand-900 ${arrowSize[size].button}`}
    >
      <Icon className={arrowSize[size].icon} strokeWidth={2.2} aria-hidden="true" />
    </button>
  );
}

/**
 * আড়াআড়ি স্ক্রল করা কার্ডের সারি; বড় পর্দায় শিরোনামের ডানে আগের/পরের তীর,
 * ফোনে তীর দুটো কার্ডের দুই কিনারায়।
 * header সার্ভার থেকে আসা JSX; সারির প্রতিটি কার্ডে snap-start ও প্রস্থ দিতে হয় (ফোনে পুরো চওড়া)।
 */
export function ScrollRow({ header, children, label }: { header: ReactNode; children: ReactNode; label: string }) {
  const row = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const go = (dir: 1 | -1) => {
    const el = row.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const step = first ? first.offsetWidth + 32 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };
  const onScroll = () => {
    const el = row.current;
    if (!el) return;
    const start = el.scrollLeft <= 4;
    const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    if (start !== edge.start || end !== edge.end) setEdge({ start, end });
  };
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
        {header}
        <div className="hidden gap-4 sm:flex">
          <ArrowButton dir="prev" onClick={() => go(-1)} label="আগের কার্ড" disabled={edge.start} />
          <ArrowButton dir="next" onClick={() => go(1)} label="পরের কার্ড" disabled={edge.end} />
        </div>
      </div>
      <div className="relative mt-10 sm:mt-12">
        <div
          ref={row}
          role="region"
          aria-label={label}
          tabIndex={0}
          onScroll={onScroll}
          className="-mx-5 flex snap-x snap-mandatory gap-8 overflow-x-auto scroll-px-5 px-5 pb-12 pt-2 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 [&::-webkit-scrollbar]:hidden"
        >
          {children}
        </div>
        {/* ফোনে: কার্ডের মাঝ বরাবর দুই কিনারায় তীর (নিচের pb-12 বাদ দিয়ে মাঝখান) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-12 top-2 flex items-center justify-between sm:hidden">
          <div className="pointer-events-auto -ml-3">
            <ArrowButton dir="prev" onClick={() => go(-1)} label="আগের কার্ড" size="sm" disabled={edge.start} />
          </div>
          <div className="pointer-events-auto -mr-3">
            <ArrowButton dir="next" onClick={() => go(1)} label="পরের কার্ড" size="sm" disabled={edge.end} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * একবারে একটি স্লাইড; দুই পাশে তীর (ফোনে ছোট, কার্ডের কিনারায়), নিচে বিন্দু।
 * চলতি স্লাইডটাই শুধু জায়গা নেয়, বাকিগুলো তার ওপর লুকানো থাকে; তাই যার যতটুকু উচ্চতা, ফাঁকা জায়গা থাকে না।
 * arrowY: ফোন ও ট্যাবে তীরের উচ্চতা (top-* ক্লাস, চাইলে 100cqw = স্লাইডের চওড়া দিয়ে হিসাব);
 * না দিলে স্লাইডের মাঝ বরাবর। বড় পর্দায় সবসময় মাঝ বরাবর।
 */
export function Slides({ slides, label, arrowY = "top-1/2" }: { slides: ReactNode[]; label: string; arrowY?: string }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const n = slides.length;
  const go = (d: 1 | -1) => {
    setDir(d);
    setIndex((v) => (v + d + n) % n);
  };
  const jump = (i: number) => {
    if (i === index) return;
    setDir(i > index ? 1 : -1);
    setIndex(i);
  };

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label}>
      <div className="@container relative">
        <div className="lg:px-28">
          <div className="relative" aria-live="polite">
            {slides.map((slide, i) => {
              const active = i === index;
              return (
                <motion.div
                  key={i}
                  className={active ? "relative z-10" : "pointer-events-none absolute inset-x-0 top-0"}
                  initial={false}
                  animate={
                    active
                      ? { opacity: [0, 1], x: [dir * 48, 0], visibility: "visible" }
                      : { opacity: 0, x: dir * -48, transitionEnd: { visibility: "hidden" } }
                  }
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  aria-hidden={!active}
                  inert={!active}
                >
                  {slide}
                </motion.div>
              );
            })}
          </div>
        </div>

        {n > 1 && (
          <>
            <div className={`absolute -left-3 z-20 -translate-y-1/2 lg:left-0 lg:top-1/2 ${arrowY}`}>
              <ArrowButton dir="prev" onClick={() => go(-1)} label="আগেরটি" size="fluid" />
            </div>
            <div className={`absolute -right-3 z-20 -translate-y-1/2 lg:right-0 lg:top-1/2 ${arrowY}`}>
              <ArrowButton dir="next" onClick={() => go(1)} label="পরেরটি" size="fluid" />
            </div>
          </>
        )}
      </div>

      {n > 1 && (
        <div className="mt-8 flex justify-center">
          {slides.map((_, i) => (
            // ছোট বিন্দু, কিন্তু চাপার জায়গা বড় (ফোনে আঙুলে সহজে লাগে)
            <button
              key={i}
              type="button"
              onClick={() => jump(i)}
              aria-label={`${i + 1} নম্বর স্লাইড`}
              aria-current={i === index ? "true" : undefined}
              className="group flex h-10 items-center px-1.5"
            >
              <span
                className={`block h-2.5 rounded-full transition-all ${i === index ? "w-8 bg-accent-500" : "w-2.5 bg-brand-200 group-hover:bg-brand-300"}`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

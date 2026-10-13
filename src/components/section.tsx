import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowRight, Check, type LucideIcon } from "lucide-react";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";
import { PhotoCredit } from "./photo-credit";
import { pageThemes, type PageTheme } from "./page-theme";
import { site } from "@/data/site";
import type { ImageCredit } from "@/lib/images";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-site px-5 sm:px-6 ${className}`}>{children}</div>;
}

/**
 * ভেতরের পেজের শিরোনাম-ব্যান্ড: গাঢ় রঙের পটভূমিতে বড় ঘরের হালকা গ্রিড, বাঁয়ে ও ডানে-ওপরে বড় বৃত্ত,
 * ওপরে ব্রেডক্রাম্ব ও সরু রেখা, উজ্জ্বল উপশিরোনাম, বড় সাদা শিরোনাম, ডানে ফ্রেমে ঘেরা ছবি বা মূল সংখ্যা।
 * নকশা সব পেজে এক, রং পেজ অনুযায়ী (page-theme.ts)।
 */
export function PageHeader({
  title,
  intro,
  crumbs,
  theme = "default",
  eyebrow,
  aside,
  children,
}: {
  title: string;
  intro?: string;
  crumbs?: Crumb[];
  theme?: PageTheme;
  eyebrow?: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  const t = pageThemes[theme];
  const vars = {
    "--theme-bg": t.bg,
    "--theme-bg2": t.bg2,
    "--theme-accent": t.accent,
    "--theme-ring": t.ring,
  } as CSSProperties;
  // লম্বা শিরোনাম (খবর, জায়গার পুরো নাম) ছোট হরফে, যাতে চার-পাঁচ লাইনে না ভাঙে
  const titleSize =
    title.length > 45
      ? "text-[2rem] leading-[1.3] sm:text-[2.8rem] lg:text-[3.1rem]"
      : title.length > 30
        ? "text-[2.3rem] leading-[1.22] sm:text-[3.2rem] lg:text-[3.6rem]"
        : "text-[2.6rem] leading-[1.15] sm:text-[4rem] lg:text-[4.6rem] lg:leading-[1.12]";
  const disc = "bg-[color-mix(in_srgb,var(--theme-accent)_5%,transparent)]";
  return (
    <header className="relative isolate overflow-hidden text-white" style={vars}>
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(160deg,var(--theme-bg)_0%,var(--theme-bg)_40%,var(--theme-bg2)_100%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:88px_88px]"
        aria-hidden="true"
      />
      {/* বড় বৃত্ত দুটি: ভেতরটা সামান্য হালকা, কিনারায় মোটা রিং */}
      <div
        className={`pointer-events-none absolute -left-72 top-[56%] -z-10 hidden h-[600px] w-[600px] -translate-y-1/2 rounded-full border-[68px] border-[var(--theme-ring)] sm:block ${disc}`}
        aria-hidden="true"
      />
      <div
        className={`pointer-events-none absolute -right-40 -top-56 -z-10 h-[360px] w-[360px] rounded-full border-[40px] border-[var(--theme-ring)] sm:-right-44 sm:-top-64 sm:h-[520px] sm:w-[520px] sm:border-[60px] ${disc}`}
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-linear-to-t from-black/25 to-transparent" aria-hidden="true" />

      <Container>
        <div className="flex items-center justify-between gap-4 border-b border-white/15 py-5">
          {crumbs ? <Breadcrumbs items={crumbs} tone="dark" /> : <span />}
          <span className="hidden shrink-0 items-center gap-2 text-sm font-bold text-white/75 sm:inline-flex">
            {site.name}
            <span className="h-2 w-2 rounded-full bg-[var(--theme-accent)]" aria-hidden="true" />
          </span>
        </div>
        <div className={`grid grid-cols-1 items-center gap-12 py-14 sm:py-20 ${aside ? "lg:grid-cols-[1.4fr_1fr] xl:gap-20" : ""}`}>
          <div className="min-w-0">
            {eyebrow && <p className="text-[1.05rem] font-bold text-[var(--theme-accent)]">{eyebrow}</p>}
            <h1 className={`mt-4 max-w-4xl font-extrabold text-white ${titleSize}`}>{title}</h1>
            {intro && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75 sm:text-xl">{intro}</p>}
            {children}
          </div>
          {aside && <div className="hidden lg:block">{aside}</div>}
        </div>
      </Container>
    </header>
  );
}

/**
 * শিরোনাম-ব্যান্ডের ডানের ফ্রেম: উজ্জ্বল রঙের সরু কিনারা, ওপরে-বাঁয়ে ছোট ট্যাগ।
 * ছবি থাকলে ছবি; না থাকলে বৃত্তের মাঝে আইকন, নিচে পেজের মূল সংখ্যা।
 */
export function HeaderFrame({
  tag,
  image,
  imageAlt = "",
  icon: Icon,
  value,
  label,
  credit,
}: {
  tag?: string;
  image?: string;
  imageAlt?: string;
  icon?: LucideIcon;
  value?: ReactNode;
  label?: ReactNode;
  /** ছবি অন্য কারও তোলা হলে লেখক আর লাইসেন্স, ফ্রেমের নিচে দেখায় */
  credit?: ImageCredit;
}) {
  const tint = (pct: number) => `color-mix(in srgb, var(--theme-accent) ${pct}%, transparent)`;
  return (
    <div className="relative ml-auto w-full max-w-[420px]">
      <div className="relative aspect-[9/10] overflow-hidden rounded-[8px] border-2 border-[var(--theme-accent)] bg-[color-mix(in_srgb,var(--theme-accent)_6%,transparent)] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]">
        {image ? (
          <Image src={image} alt={imageAlt} fill sizes="420px" className="object-cover" />
        ) : (
          <>
            <div
              className="absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.11)_1px,transparent_1px)] [background-size:20px_20px]"
              aria-hidden="true"
            />
            <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
              <div className="h-[19rem] w-[19rem] rounded-full border" style={{ borderColor: tint(22) }} />
              <div className="absolute inset-[3.25rem] rounded-full border" style={{ borderColor: tint(32) }} />
              <div
                className="absolute inset-[6.5rem] flex items-center justify-center rounded-full border-2"
                style={{ borderColor: tint(70), backgroundColor: tint(14) }}
              >
                {Icon && <Icon className="h-11 w-11 text-[var(--theme-accent)]" strokeWidth={1.6} />}
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/30 to-transparent px-8 pb-7 pt-16">
              {value && <p className="text-[3.2rem] font-extrabold leading-none text-white">{value}</p>}
              {label && <p className="mt-3 text-lg leading-snug text-white/75">{label}</p>}
            </div>
          </>
        )}
        {tag && (
          <span className="absolute left-4 top-4 rounded-[4px] bg-[var(--theme-accent)] px-2.5 py-1 text-sm font-bold text-[#0b0b1f]">{tag}</span>
        )}
      </div>
      {image && <PhotoCredit credit={credit} tone="dark" className="mt-3 text-right" />}
    </div>
  );
}

/** "সব দেখুন →" ধাঁচের লিংক (রেফারেন্সের "Learn More →") */
export function MoreLink({ href, label, className = "" }: { href: string; label: string; className?: string }) {
  return (
    <Link href={href} className={`group inline-flex items-center gap-2 font-bold text-brand-900 transition-colors hover:text-accent-600 ${className}`}>
      {label}
      <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-1" aria-hidden="true" />
    </Link>
  );
}

/** হোমপেজের সেকশন: কোরাল উপশিরোনাম, বড় শিরোনাম, ভূমিকা, ডানে বা নিচে বোতাম; tone="tint" দিলে ল্যাভেন্ডার পটভূমি */
export function Section({
  id,
  eyebrow,
  title,
  intro,
  action,
  tone = "white",
  align = "left",
  flushTop = false,
  children,
  className = "",
}: {
  id?: string;
  flushTop?: boolean;
  eyebrow?: string;
  title?: string;
  intro?: ReactNode;
  action?: ReactNode;
  tone?: "white" | "tint";
  align?: "left" | "center";
  children: ReactNode;
  className?: string;
}) {
  const center = align === "center";
  return (
    <section id={id} className={`relative scroll-mt-24 overflow-x-clip ${flushTop ? "pt-16 sm:pt-20" : "pt-24 sm:pt-32"} pb-24 sm:pb-32 ${tone === "tint" ? "bg-brand-50" : "bg-white"} ${className}`}>
      <Container>
        {title && (
          <div className={`mb-12 sm:mb-16 ${center ? "mx-auto max-w-3xl text-center" : "flex flex-wrap items-end justify-between gap-x-12 gap-y-6"}`}>
            <div className={center ? "" : "max-w-2xl"}>
              {eyebrow && <p className={center ? "text-[1.125rem] font-bold text-accent-600" : "section-eyebrow"}>{eyebrow}</p>}
              <h2 className="mt-3 text-[2.2rem] font-bold leading-[1.3] text-brand-900 sm:text-[2.6rem]">{title}</h2>
              {intro && <div className="mt-4 text-lg leading-relaxed text-ink-500">{intro}</div>}
            </div>
            {action && <div className={center ? "mt-8 flex justify-center" : "shrink-0"}>{action}</div>}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}

/** তথ্যের একটি ব্লক (বিস্তারিত পেজে) */
export function Block({
  id,
  title,
  children,
  className = "",
}: {
  id?: string;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`c-card scroll-mt-28 p-7 sm:p-10 ${className}`}>
      {title && <h2 className="mb-5 text-[1.6rem] font-bold leading-tight text-brand-900">{title}</h2>}
      {children}
    </section>
  );
}

/** ছোট তথ্য-টাইল (লেবেল + মান); শিরোনাম-ব্যান্ডের গাঢ় পটভূমির জন্য স্বচ্ছ */
export function Fact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-[16px] border border-white/15 bg-white/[0.06] p-5 backdrop-blur-sm">
      <dt className="text-[0.95rem] text-white/60">{label}</dt>
      <dd className="mt-1 text-[1.3rem] font-bold leading-tight text-white">{value}</dd>
    </div>
  );
}

/** কোরাল (বা বেগুনি) গোল টিকচিহ্নসহ তালিকা */
export function Checklist({ items, tone = "accent" }: { items: ReactNode[]; tone?: "accent" | "iris" }) {
  return (
    <ul className="space-y-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3.5 text-[1.0625rem] font-medium leading-relaxed text-brand-900">
          <span
            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white ${
              tone === "iris" ? "bg-iris-500 shadow-[0_6px_14px_rgba(106,53,255,0.3)]" : "bg-accent-500 shadow-[0_6px_14px_rgba(255,57,81,0.3)]"
            }`}
            aria-hidden="true"
          >
            <Check className="h-4 w-4" strokeWidth={3} />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export type Tone = "accent" | "azure" | "iris" | "sunny" | "sky";

const tileTones: Record<Tone, { outer: string; inner: string }> = {
  accent: { outer: "bg-accent-50", inner: "bg-accent-500 shadow-[0_8px_20px_rgba(255,57,81,0.3)]" },
  azure: { outer: "bg-azure-50", inner: "bg-azure-500 shadow-[0_8px_20px_rgba(61,127,255,0.3)]" },
  iris: { outer: "bg-iris-50", inner: "bg-iris-500 shadow-[0_8px_20px_rgba(106,53,255,0.3)]" },
  sunny: { outer: "bg-sunny-50", inner: "bg-sunny-500 shadow-[0_8px_20px_rgba(255,198,50,0.35)]" },
  sky: { outer: "bg-sky-50", inner: "bg-sky-500 shadow-[0_8px_20px_rgba(0,160,255,0.3)]" },
};

/** রেফারেন্সের আইকন-টাইল: হালকা রঙের বড় গোল-কোণা বর্গের ভেতরে গাঢ় রঙের ছোট বর্গে সাদা আইকন */
export function IconTile({ icon: Icon, tone = "accent", size = "lg" }: { icon: LucideIcon; tone?: Tone; size?: "lg" | "md" }) {
  const t = tileTones[tone];
  const lg = size === "lg";
  return (
    <span className={`flex shrink-0 items-center justify-center ${t.outer} ${lg ? "h-24 w-24 rounded-[30px]" : "h-16 w-16 rounded-[20px]"}`} aria-hidden="true">
      <span className={`flex items-center justify-center text-white ${t.inner} ${lg ? "h-14 w-14 rounded-[18px]" : "h-10 w-10 rounded-xl"}`}>
        <Icon className={lg ? "h-7 w-7" : "h-5 w-5"} />
      </span>
    </span>
  );
}

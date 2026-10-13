import Image from "next/image";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Backpack,
  BookOpenText,
  Building2,
  CalendarDays,
  Flower2,
  GraduationCap,
  Landmark,
  MapPin,
  Newspaper,
  School,
  Tent,
  Waves,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { formatDateBn, formatDecimalBn, toBn } from "@/lib/bn";
import type { EventItem, NewsPost, PersonWithPhoto, Place, PlaceType, SchoolType, UnionInfo, VillageStatus } from "@/lib/types";
import { IconTile, type Tone } from "./section";
import { Lamp } from "./status-badge";

/* রেফারেন্সের কার্ড: সাদা, বড় গোল কোণা, হালকা কিনারা ও ছায়া; হোভারে সামান্য ওপরে ওঠে */
const cardBase =
  "rounded-[32px] border border-line bg-white shadow-card transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lift";

const toneCycle: Tone[] = ["accent", "azure", "iris", "sky", "sunny"];

function hash(s: string): number {
  let h = 0;
  for (const ch of s) h = (h * 31 + (ch.codePointAt(0) ?? 0)) >>> 0;
  return h;
}

/** slug থেকে স্থায়ী একটি রং বেছে নেয়, যাতে পাশাপাশি কার্ড আলাদা দেখায় */
export function toneFor(seed: string): Tone {
  return toneCycle[hash(seed) % toneCycle.length];
}

/** ছবির জায়গায় হালকা রঙের প্যানেল (আইকনসহ) */
export const panelBg: Record<Tone, string> = {
  accent: "bg-linear-to-br from-accent-50 via-white to-accent-50",
  azure: "bg-linear-to-br from-azure-50 via-white to-azure-50",
  iris: "bg-linear-to-br from-iris-50 via-white to-iris-50",
  sky: "bg-linear-to-br from-sky-50 via-white to-sky-50",
  sunny: "bg-linear-to-br from-sunny-50 via-white to-sunny-50",
};

/* ---------- গ্রাম ---------- */

export interface VillageCardData {
  slug: string;
  name: string;
  status: VillageStatus;
  tagline?: string;
  cover?: string;
  unionName: string;
}

/** গ্রামের কার্ড (গ্রামের তালিকা পাতায়) */
export function VillageCard({ village, className = "" }: { village: VillageCardData; className?: string }) {
  return (
    <Link href={`/villages/${village.slug}`} className={`group flex h-full flex-col p-6 ${cardBase} !rounded-[24px] ${className}`}>
      {village.cover && (
        <div className="relative -mx-2 -mt-2 mb-5 aspect-[16/10] overflow-hidden rounded-[18px] bg-brand-50">
          <Image src={village.cover} alt="" fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[1.45rem] font-bold leading-tight text-brand-900 transition-colors group-hover:text-accent-600">{village.name}</h3>
        <Lamp status={village.status} className="mt-3" />
      </div>
      <p className="mt-1 text-[0.95rem] font-semibold text-accent-600">{village.unionName} ইউনিয়ন</p>
      {village.tagline && <p className="mt-3 line-clamp-2 leading-relaxed text-ink-500">{village.tagline}</p>}
    </Link>
  );
}

/** গ্রামের ছোট পিল (ইউনিয়ন ও গ্রামের পাতায়) */
export function VillageChip({ slug, name, status }: { slug: string; name: string; status: VillageStatus }) {
  return (
    <Link
      href={`/villages/${slug}`}
      className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-[0.98rem] text-brand-900 shadow-input transition-colors hover:border-accent-300 hover:text-accent-600"
    >
      <Lamp status={status} />
      {name}
    </Link>
  );
}

/* ---------- ইউনিয়ন ---------- */

export function UnionCard({
  union,
  villageCount,
  placeCount,
}: {
  union: UnionInfo;
  villageCount: number;
  placeCount: number;
}) {
  const facts = [
    `${toBn(villageCount)}টি গ্রাম`,
    union.area ? `${formatDecimalBn(union.area)} বর্গকিমি` : null,
    placeCount ? `দেখার মতো ${toBn(placeCount)}টি জায়গা` : null,
  ].filter((f): f is string => f !== null);
  return (
    <Link href={`/unions/${union.slug}`} className={`group flex h-full flex-col p-8 ${cardBase}`}>
      <div className="flex items-center gap-5">
        <IconTile icon={Landmark} tone={toneFor(union.slug)} size="md" />
        <div>
          <h3 className="text-[1.55rem] font-bold leading-tight text-brand-900 transition-colors group-hover:text-accent-600">{union.name}</h3>
          <p className="text-[0.95rem] text-ink-500">{union.nameEn}</p>
        </div>
      </div>
      <div className="mt-5 flex-1">
        <p className="line-clamp-3 leading-relaxed text-ink-500">{union.description}</p>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {facts.map((f) => (
          <span key={f} className="rounded-full bg-brand-50 px-3.5 py-1 text-[0.9rem] font-semibold text-brand-900">
            {f}
          </span>
        ))}
      </div>
      <span className="mt-6 inline-flex items-center gap-2 font-bold text-brand-900 transition-colors group-hover:text-accent-600">
        বিস্তারিত দেখুন
        <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </span>
    </Link>
  );
}

/* ---------- দর্শনীয় স্থান ---------- */

export const placeTypeStyle: Record<PlaceType, { icon: LucideIcon; tone: Tone; pill: string }> = {
  ঐতিহাসিক: { icon: Landmark, tone: "iris", pill: "bg-iris-500 text-white" },
  প্রাকৃতিক: { icon: Waves, tone: "azure", pill: "bg-[#2f6fed] text-white" },
  ধর্মীয়: { icon: Flower2, tone: "accent", pill: "bg-accent-600 text-white" },
  বিনোদন: { icon: Tent, tone: "sunny", pill: "bg-sunny-500 text-brand-900" },
};

/** স্থানের ধরনের রঙিন পিল (রেফারেন্সের ব্লগ-ক্যাটাগরি পিলের মতো); label দিলে রং-আইকন ধরন অনুযায়ী, লেখা label */
export function PlaceTypeBadge({ type, label }: { type: PlaceType; label?: string }) {
  const s = placeTypeStyle[type];
  const Icon = s.icon;
  return (
    <span className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[0.9rem] font-bold ${s.pill}`}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label ?? type}
    </span>
  );
}

export function PlaceCard({ place, locationLabel, className = "" }: { place: Place; locationLabel?: string; className?: string }) {
  const s = placeTypeStyle[place.type];
  return (
    <article className={`group relative flex h-full flex-col p-6 pb-9 ${cardBase} ${className}`}>
      <div className="relative">
        <div className={`relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-[24px] ${panelBg[s.tone]}`}>
          {place.cover ? (
            <Image src={place.cover} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
          ) : (
            <IconTile icon={s.icon} tone={s.tone} />
          )}
        </div>
        <div className="absolute -bottom-4 left-6">
          <PlaceTypeBadge type={place.type} />
        </div>
      </div>
      <h3 className="mt-9 text-[1.45rem] font-bold leading-snug text-brand-900">
        <Link href={`/places/${place.slug}`} className="transition-colors after:absolute after:inset-0 after:content-[''] group-hover:text-accent-600">
          {place.name}
        </Link>
      </h3>
      {locationLabel && (
        <p className="mt-1.5 inline-flex items-center gap-1.5 text-[0.95rem] text-ink-500">
          <MapPin className="h-4 w-4 shrink-0 text-accent-500" aria-hidden="true" />
          {locationLabel}
        </p>
      )}
      <p className="mt-3 line-clamp-3 leading-relaxed text-ink-500">{place.summary}</p>
    </article>
  );
}

/** সারি-আকৃতির ছোট স্থান (গ্রাম, ইউনিয়ন ও স্থানের পাতার ব্লকে) */
export function PlaceRow({ place, locationLabel }: { place: Place; locationLabel?: string }) {
  const s = placeTypeStyle[place.type];
  return (
    <Link href={`/places/${place.slug}`} className="group -mx-3 flex items-start gap-4 rounded-[20px] p-3 transition-colors hover:bg-brand-50">
      {place.cover ? (
        <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-[16px] bg-brand-50">
          <Image src={place.cover} alt="" fill sizes="80px" className="object-cover" />
        </div>
      ) : (
        <IconTile icon={s.icon} tone={s.tone} size="md" />
      )}
      <div className="min-w-0">
        <p className="text-sm font-bold text-accent-600">{place.type}</p>
        <h3 className="text-[1.2rem] font-bold leading-snug text-brand-900 transition-colors group-hover:text-accent-600">{place.name}</h3>
        {locationLabel && <p className="text-sm text-ink-500">{locationLabel}</p>}
        <p className="mt-1 line-clamp-2 text-[0.98rem] leading-relaxed text-ink-500">{place.summary}</p>
      </div>
    </Link>
  );
}

/* ---------- শিক্ষা প্রতিষ্ঠান ---------- */

export const schoolTypeStyle: Record<SchoolType, { icon: LucideIcon; tone: Tone; pill: string }> = {
  কলেজ: { icon: GraduationCap, tone: "iris", pill: "bg-iris-500 text-white" },
  "স্কুল অ্যান্ড কলেজ": { icon: GraduationCap, tone: "azure", pill: "bg-[#2f6fed] text-white" },
  "উচ্চ বিদ্যালয়": { icon: School, tone: "sky", pill: "bg-sky-500 text-white" },
  "নিম্ন মাধ্যমিক বিদ্যালয়": { icon: School, tone: "azure", pill: "bg-azure-500 text-white" },
  মাদ্রাসা: { icon: BookOpenText, tone: "sunny", pill: "bg-sunny-500 text-brand-900" },
  "কারিগরি প্রতিষ্ঠান": { icon: Wrench, tone: "iris", pill: "bg-iris-500 text-white" },
  "প্রাথমিক বিদ্যালয়": { icon: Backpack, tone: "accent", pill: "bg-accent-600 text-white" },
  অন্যান্য: { icon: Building2, tone: "sky", pill: "bg-brand-900 text-white" },
};

/** প্রতিষ্ঠানের ধরন; "অন্যান্য" ধরনে স্তরটাই (যেমন কিন্ডারগার্টেন) */
export function schoolKind(s: { type: SchoolType; level?: string }): string {
  return s.type === "অন্যান্য" && s.level ? s.level : s.type;
}

/** ধরন ও স্তর একসঙ্গে, যেমন "মাদ্রাসা · দাখিল" */
export function schoolTypeLabel(s: { type: SchoolType; level?: string }): string {
  const kind = schoolKind(s);
  return s.level && kind !== s.level ? `${kind} · ${s.level}` : kind;
}

/** তালিকা ও কার্ডে দেখানোর মতো শিক্ষা প্রতিষ্ঠানের তথ্য */
export interface SchoolCardData {
  slug: string;
  name: string;
  type: SchoolType;
  level?: string;
  established?: number;
  cover?: string;
  /** যেমন "হরিপুর, হরিপুর ইউনিয়ন" */
  location: string;
}

export function SchoolTypeBadge({ type, label }: { type: SchoolType; label?: string }) {
  const s = schoolTypeStyle[type];
  const Icon = s.icon;
  return (
    <span className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[0.85rem] font-bold ${s.pill}`}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label ?? type}
    </span>
  );
}

/** শিক্ষা প্রতিষ্ঠানের কার্ড: ছবি (না থাকলে ধরনের আইকন), ধরন, নাম, অবস্থান ও প্রতিষ্ঠাকাল */
export function SchoolCard({ school, className = "" }: { school: SchoolCardData; className?: string }) {
  const s = schoolTypeStyle[school.type];
  return (
    <article className={`group relative flex h-full flex-col p-4 ${cardBase} !rounded-[24px] ${className}`}>
      <div className={`relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-[18px] ${panelBg[s.tone]}`}>
        {school.cover ? (
          <Image src={school.cover} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
        ) : (
          <IconTile icon={s.icon} tone={s.tone} size="md" />
        )}
      </div>
      <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
        <p className="text-[0.9rem] font-bold text-accent-600">{schoolTypeLabel(school)}</p>
        <h3 className="mt-1 text-[1.2rem] font-bold leading-snug text-brand-900">
          <Link href={`/schools/${school.slug}`} className="transition-colors after:absolute after:inset-0 after:content-[''] group-hover:text-accent-600">
            {school.name}
          </Link>
        </h3>
        <p className="mt-1.5 inline-flex items-start gap-1.5 text-[0.92rem] text-ink-500">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" aria-hidden="true" />
          {school.location}
        </p>
        <p className="mt-auto pt-3 font-display text-[1.05rem] font-semibold text-brand-900">
          {school.established ? `প্রতিষ্ঠা: ${toBn(school.established)}` : <span className="font-sans text-[0.92rem] font-normal text-ink-400">প্রতিষ্ঠাকাল যুক্ত হবে</span>}
        </p>
      </div>
    </article>
  );
}

/** সারি-আকৃতির ছোট শিক্ষা প্রতিষ্ঠান (গ্রাম, ইউনিয়ন ও প্রতিষ্ঠানের পেজের ব্লকে) */
export function SchoolRow({ school, locationLabel }: { school: Omit<SchoolCardData, "location">; locationLabel?: string }) {
  const s = schoolTypeStyle[school.type];
  return (
    <Link href={`/schools/${school.slug}`} className="group -mx-3 flex items-start gap-4 rounded-[20px] p-3 transition-colors hover:bg-brand-50">
      {school.cover ? (
        <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-[16px] bg-brand-50">
          <Image src={school.cover} alt="" fill sizes="80px" className="object-cover" />
        </div>
      ) : (
        <IconTile icon={s.icon} tone={s.tone} size="md" />
      )}
      <div className="min-w-0">
        <p className="text-sm font-bold text-accent-600">{schoolTypeLabel(school)}</p>
        <h3 className="text-[1.15rem] font-bold leading-snug text-brand-900 transition-colors group-hover:text-accent-600">{school.name}</h3>
        {locationLabel && <p className="text-sm text-ink-500">{locationLabel}</p>}
        {school.established && <p className="font-display text-[0.95rem] font-semibold text-brand-900">প্রতিষ্ঠা: {toBn(school.established)}</p>}
      </div>
    </Link>
  );
}

/* ---------- খবর ও উৎসব (রেফারেন্সের ব্লগ কার্ড) ---------- */

function PostCard({
  href,
  title,
  meta,
  text,
  cover,
  pill,
  pillClass,
  icon: Icon,
  tone,
  fullText = false,
  className = "",
}: {
  href: string;
  title: string;
  meta: ReactNode;
  text: string;
  cover?: string;
  pill: string;
  pillClass: string;
  icon: LucideIcon;
  tone: Tone;
  /** true হলে পুরো লেখা দেখায়, না হলে তিন লাইনের পর কাটে */
  fullText?: boolean;
  className?: string;
}) {
  return (
    <article className={`group relative flex h-full flex-col p-6 pb-10 ${cardBase} ${className}`}>
      <div className="relative">
        <div className={`relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-[24px] ${panelBg[tone]}`}>
          {cover ? (
            <Image src={cover} alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
          ) : (
            <IconTile icon={Icon} tone={tone} />
          )}
        </div>
        <span className={`absolute -bottom-5 left-6 inline-flex h-11 items-center gap-2 rounded-full px-4 text-[0.95rem] font-bold ${pillClass}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
          {pill}
        </span>
      </div>
      <p className="mt-10 text-[0.95rem] text-ink-500">{meta}</p>
      <h3 className="mt-1 text-[1.45rem] font-bold leading-snug text-brand-900">
        <Link href={href} className="transition-colors after:absolute after:inset-0 after:content-[''] group-hover:text-accent-600">
          {title}
        </Link>
      </h3>
      <p className={`mt-3 leading-relaxed text-ink-500 ${fullText ? "" : "line-clamp-3"}`}>{text}</p>
    </article>
  );
}

export function NewsCard({ post, fullText, className = "" }: { post: NewsPost; fullText?: boolean; className?: string }) {
  return (
    <PostCard
      href={`/news/${post.slug}`}
      title={post.title}
      meta={<time dateTime={post.date}>{formatDateBn(post.date)}</time>}
      text={post.excerpt}
      cover={post.cover}
      pill={post.category}
      pillClass="bg-accent-600 text-white shadow-[0_8px_18px_rgba(255,57,81,0.3)]"
      icon={Newspaper}
      tone="accent"
      fullText={fullText}
      className={className}
    />
  );
}

/** pill না দিলে উৎসবের মাস ("আষাঢ় মাস") দেখায় */
export function EventCard({
  event,
  pill,
  fullText,
  className = "",
}: {
  event: EventItem;
  pill?: string;
  fullText?: boolean;
  className?: string;
}) {
  return (
    <PostCard
      href={`/events#${event.slug}`}
      title={event.title}
      meta={event.when}
      text={event.description}
      cover={event.cover}
      pill={pill ?? `${event.badge} মাস`}
      pillClass="bg-iris-500 text-white shadow-[0_8px_18px_rgba(106,53,255,0.3)]"
      icon={CalendarDays}
      tone="iris"
      fullText={fullText}
      className={className}
    />
  );
}

/* ---------- ব্যক্তি ---------- */

const avatarBg: Record<Tone, string> = {
  accent: "bg-accent-500",
  azure: "bg-azure-500",
  iris: "bg-iris-500",
  sky: "bg-sky-500",
  sunny: "bg-sunny-500",
};

const PORTRAIT_BOX = {
  thumb: "h-24 w-20 text-2xl",
  large: "h-[17.5rem] w-56 text-[6rem] sm:h-[22rem] sm:w-[17.5rem]",
} as const;
/** ছবির সর্বোচ্চ মাপ: তালিকায় ৮০px চওড়া, বড় ছবিতে ৩৬০px উঁচু; ছোট ছবি যেমন আছে তেমনই থাকে */
const PORTRAIT_MAX = { thumb: 80, large: 360 } as const;

/**
 * ব্যক্তির ছবি যেমন আছে তেমনই দেখায়: পোর্ট্রেট, গোল করে কাটা হয় না, আসল মাপের চেয়ে বড় করা হয় না
 * (বড় ছবি শুধু জায়গা অনুযায়ী ছোট হয়)। ছবি না থাকলে একই পোর্ট্রেট আকারে নামের প্রথম অক্ষর।
 */
export function PersonPhoto({ person, size }: { person: PersonWithPhoto; size: "thumb" | "large" }) {
  const dims = person.imageSize;
  if (person.image && dims) {
    // দেখানোর মাপ আগেই হিসাব করা (কখনো আসল মাপের বেশি নয়), যাতে ছবি লোড হওয়ার আগেই জায়গা ঠিক থাকে
    const scale = size === "thumb" ? Math.min(1, PORTRAIT_MAX.thumb / dims.width) : Math.min(1, PORTRAIT_MAX.large / dims.height);
    const width = Math.round(dims.width * scale);
    const height = Math.round(dims.height * scale);
    return (
      <Image
        src={person.image}
        alt=""
        width={width}
        height={height}
        className={size === "thumb" ? "h-auto max-w-full shrink-0 self-start rounded-lg" : "mx-auto h-auto max-w-full rounded-lg"}
      />
    );
  }
  if (person.image) {
    // মাপ জানা না গেলে পুরো ছবিটা বাক্সের ভেতরে, না কেটে
    return (
      <div className={`relative shrink-0 self-start ${PORTRAIT_BOX[size]} ${size === "large" ? "mx-auto" : ""}`}>
        <Image src={person.image} alt="" fill sizes={size === "thumb" ? "80px" : "288px"} className="object-contain" />
      </div>
    );
  }
  return (
    <div
      className={`flex shrink-0 items-center justify-center self-start rounded-lg font-bold text-white ${PORTRAIT_BOX[size]} ${size === "large" ? "mx-auto" : ""} ${avatarBg[toneFor(person.slug)]}`}
      aria-hidden="true"
    >
      {person.name.charAt(0)}
    </div>
  );
}

export function PersonCard({
  person,
  locationLabel,
  locationHref,
  showDetails = false,
  boxed = false,
}: {
  person: PersonWithPhoto;
  locationLabel?: string;
  locationHref?: string;
  showDetails?: boolean;
  boxed?: boolean;
}) {
  return (
    <article className={`flex gap-5 ${boxed ? "rounded-[32px] border border-line bg-white p-7 shadow-card sm:p-8" : ""}`}>
      <PersonPhoto person={person} size="thumb" />
      <div className="min-w-0">
        <p className="text-[0.95rem] font-bold text-accent-600">{person.category}</p>
        <h3 className="mt-0.5 text-[1.4rem] font-bold leading-snug text-brand-900">{person.name}</h3>
        {(person.years || locationLabel) && (
          <p className="mt-1 text-[0.95rem] text-ink-500">
            {person.years}
            {person.years && locationLabel && ", "}
            {locationLabel &&
              (locationHref ? (
                <Link href={locationHref} className="transition-colors hover:text-accent-600 hover:underline">
                  {locationLabel}
                </Link>
              ) : (
                locationLabel
              ))}
          </p>
        )}
        <p className="mt-3 leading-relaxed text-ink-500">{person.summary}</p>
        {showDetails && person.details && person.details.length > 0 && (
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[0.98rem] leading-relaxed text-ink-500 marker:text-accent-500">
            {person.details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

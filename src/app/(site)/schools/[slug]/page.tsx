import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SchoolRow, schoolKind, schoolTypeLabel, schoolTypeStyle } from "@/components/cards";
import { CoverImage } from "@/components/cover-image";
import { Gallery } from "@/components/gallery";
import { JsonLd } from "@/components/json-ld";
import { MapView } from "@/components/map/map-view";
import { GalleryCredits, PhotoCredit } from "@/components/photo-credit";
import { Block, Container, Fact, HeaderFrame, PageHeader } from "@/components/section";
import { site } from "@/data/site";
import { formatBn, toBn } from "@/lib/bn";
import { data } from "@/lib/data";
import { creditFor, galleryCredits, withSchoolImages } from "@/lib/images";
import type { SchoolType } from "@/lib/types";

type Params = Promise<{ slug: string }>;

export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const db = await data();
  const slugs = db.getSchools().map((s) => ({ slug: s.slug }));
  // Cache Components-এ অন্তত একটা লাগে; তালিকা খালি থাকলে এটা ৪০৪ পেজ হয়
  return slugs.length > 0 ? slugs : [{ slug: "_" }];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const db = await data();
  const { slug } = await params;
  const school = db.getSchool(slug);
  if (!school) return { title: "প্রতিষ্ঠানটির তথ্য পাওয়া যায়নি" };
  const description =
    school.summary ??
    `${school.name}: ${school.type}, ${db.unionName(school.union)} ইউনিয়ন, নাসিরনগর।${school.established ? ` প্রতিষ্ঠা ${toBn(school.established)}।` : ""}`;
  return { title: school.name, description, openGraph: { title: school.name, description } };
}

/** schema.org-এর ধরন */
const schemaType: Record<SchoolType, string> = {
  কলেজ: "CollegeOrUniversity",
  "স্কুল অ্যান্ড কলেজ": "HighSchool",
  "উচ্চ বিদ্যালয়": "HighSchool",
  "নিম্ন মাধ্যমিক বিদ্যালয়": "MiddleSchool",
  মাদ্রাসা: "EducationalOrganization",
  "কারিগরি প্রতিষ্ঠান": "EducationalOrganization",
  "প্রাথমিক বিদ্যালয়": "ElementarySchool",
  অন্যান্য: "EducationalOrganization",
};

/** তথ্যসূত্রের চেনা নাম (ডোমেইন দেখে) */
const sourceNames: [RegExp, string][] = [
  [/banbeis\.gov\.bd$/, "ব্যানবেইস"],
  [/^nasirnagar\.brahmanbaria\.gov\.bd$/, "উপজেলা পোর্টাল"],
  [/up\.brahmanbaria\.gov\.bd$/, "ইউনিয়ন পোর্টাল"],
  [/^brahmanbaria\.gov\.bd$/, "জেলা পোর্টাল"],
  [/wikipedia\.org$/, "উইকিপিডিয়া"],
  [/banglapedia\.org$/, "বাংলাপিডিয়া"],
  [/^dpeo\.brahmanbaria\.gov\.bd$/, "জেলা প্রাথমিক শিক্ষা অফিস"],
  [/ebmeb\.gov\.bd$/, "মাদ্রাসা শিক্ষা বোর্ড"],
  [/web\.archive\.org$/, "ওয়েব আর্কাইভ (পুরনো সরকারি পোর্টাল)"],
  [/itvbd\.com$/, "আইটিভি"],
  [/\.edu\.bd$/, "প্রতিষ্ঠানের ওয়েবসাইট"],
];

/** একই উৎসের একাধিক লিংক থাকলে প্রথমটা (যেমন ওয়েব আর্কাইভের কয়েকটা কপি) */
function uniqueSources(sources: string[]): { label: string; href?: string }[] {
  const seen = new Set<string>();
  const out: { label: string; href?: string }[] = [];
  for (const src of sources) {
    const isLink = /^https?:\/\//.test(src);
    const label = isLink ? sourceLabel(src) : src;
    if (seen.has(label)) continue;
    seen.add(label);
    out.push({ label, href: isLink ? src : undefined });
  }
  return out;
}

function sourceLabel(source: string): string {
  const host = linkLabel(source);
  return sourceNames.find(([re]) => re.test(host))?.[1] ?? host;
}

/** লিংক হলে ডোমেইনটুকু দেখানো */
function linkLabel(source: string): string {
  try {
    return new URL(source).hostname.replace(/^www\./, "");
  } catch {
    return source;
  }
}

export default async function SchoolPage({ params }: { params: Params }) {
  const db = await data();
  const { slug } = await params;
  const found = db.getSchool(slug);
  if (!found) notFound();
  const school = withSchoolImages(found);
  const union = db.getUnion(school.union);
  if (!union) notFound();
  const village = school.village ? db.getVillage(school.village) : undefined;
  const coords = db.schoolCoords(school);
  const style = schoolTypeStyle[school.type];
  const place = `${village ? `${village.name}, ` : ""}${union.name} ইউনিয়ন`;
  const address = [school.address, village ? `${village.name} গ্রাম` : undefined, `${union.name} ইউনিয়ন`, "নাসিরনগর, ব্রাহ্মণবাড়িয়া"]
    .filter(Boolean)
    .join(", ");
  const nearbyAll = village ? db.schoolsOfVillage(village.slug) : [];
  const sameVillage = nearbyAll.filter((s) => s.slug !== school.slug);
  const sameUnion = db
    .schoolsOfUnion(union.slug)
    .filter((s) => s.slug !== school.slug && !sameVillage.some((v) => v.slug === s.slug))
    .slice(0, 6);
  const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${school.name}, নাসিরনগর, ব্রাহ্মণবাড়িয়া`)}`;
  const contributeHref = `/contribute?village=${encodeURIComponent(village?.name ?? "")}&union=${union.slug}&kind=${encodeURIComponent("শিক্ষা ও ধর্মীয় প্রতিষ্ঠান")}`;
  const typeLabel = schoolTypeLabel(school);

  type FactRow = { label: string; value: ReactNode };
  const factRows: (FactRow | false | "" | undefined)[] = [
    { label: "ধরন", value: typeLabel },
    school.management && { label: "ব্যবস্থাপনা", value: school.management },
    school.gender && { label: "শিক্ষার্থীর ধরন", value: school.gender },
    { label: "প্রতিষ্ঠাকাল", value: school.established ? `${toBn(school.established)} সাল` : "তথ্য যুক্ত হবে" },
    school.eiin && { label: "EIIN", value: school.eiin },
    school.founder && { label: "প্রতিষ্ঠাতা", value: school.founder },
    school.head && { label: "প্রতিষ্ঠান প্রধান", value: school.head },
    school.students !== undefined && { label: "শিক্ষার্থী সংখ্যা", value: `${formatBn(school.students)} জন` },
    school.teachers !== undefined && { label: "শিক্ষক সংখ্যা", value: `${toBn(school.teachers)} জন` },
    { label: "ঠিকানা", value: address },
    school.phone && {
      label: "ফোন",
      value: (
        <a href={`tel:${school.phone.replace(/[^\d+]/g, "")}`} className="text-link">
          {school.phone}
        </a>
      ),
    },
    school.email && {
      label: "ইমেইল",
      value: (
        <a href={`mailto:${school.email}`} className="text-link break-all">
          {school.email}
        </a>
      ),
    },
    school.website && {
      label: "ওয়েবসাইট",
      value: (
        <a href={school.website} target="_blank" rel="noopener noreferrer" className="text-link break-all">
          {linkLabel(school.website)}
        </a>
      ),
    },
  ];
  const facts = factRows.filter((f): f is FactRow => Boolean(f));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": schemaType[school.type],
          name: school.name,
          ...(school.nameEn ? { alternateName: school.nameEn } : {}),
          description: school.summary ?? `${typeLabel}, ${place}, নাসিরনগর`,
          url: `${site.url.replace(/\/$/, "")}/schools/${school.slug}`,
          ...(school.established ? { foundingDate: String(school.established) } : {}),
          ...(school.cover ? { image: `${site.url.replace(/\/$/, "")}${school.cover}` } : {}),
          geo: { "@type": "GeoCoordinates", latitude: coords.lat, longitude: coords.lng },
          address: { "@type": "PostalAddress", addressLocality: place, addressRegion: "ব্রাহ্মণবাড়িয়া", addressCountry: "BD" },
        }}
      />
      <PageHeader
        title={school.name}
        theme="schools"
        eyebrow={typeLabel}
        crumbs={[{ label: "শিক্ষা প্রতিষ্ঠান", href: "/schools" }, { label: school.name }]}
        aside={
          school.cover ? (
            <HeaderFrame tag={schoolKind(school)} image={school.cover} imageAlt={school.name} credit={creditFor(school.cover)} />
          ) : (
            <HeaderFrame
              tag={schoolKind(school)}
              icon={style.icon}
              value={school.established ? toBn(school.established) : village ? village.name : union.name}
              label={school.established ? "সালে প্রতিষ্ঠিত" : village ? `${union.name} ইউনিয়ন, নাসিরনগর` : "ইউনিয়ন, নাসিরনগর"}
            />
          )
        }
      >
        {school.nameEn && <p className="mt-3 text-white/55">{school.nameEn}</p>}
        <p className="mt-4 text-lg text-white/75">
          {village && (
            <>
              <Link href={`/villages/${village.slug}`} className="text-link-light">
                {village.name} গ্রাম
              </Link>
              {", "}
            </>
          )}
          <Link href={`/unions/${union.slug}`} className="text-link-light">
            {union.name} ইউনিয়ন
          </Link>
          , নাসিরনগর
        </p>
        {school.summary && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl">{school.summary}</p>}
        <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Fact label="প্রতিষ্ঠাকাল" value={school.established ? `${toBn(school.established)} সাল` : "তথ্য যুক্ত হবে"} />
          <Fact label="ধরন" value={schoolKind(school)} />
          <Fact label={school.eiin ? "EIIN" : "ইউনিয়ন"} value={school.eiin ?? union.name} />
        </dl>
      </PageHeader>

      <Container className="py-8 sm:py-10">
        {school.cover && (
          <div className="mb-8 lg:hidden">
            <CoverImage
              src={school.cover}
              alt={school.name}
              seed={school.slug}
              className="relative aspect-[21/9] rounded-xl sm:aspect-[3/1]"
              sizes="100vw"
              priority
            />
            <PhotoCredit credit={creditFor(school.cover)} className="mt-2" />
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <Block id="intro" title="পরিচিতি">
              {school.history || (school.details && school.details.length > 0) ? (
                <>
                  {school.history && <p className="text-ink-700">{school.history}</p>}
                  {school.details && school.details.length > 0 && (
                    <ul className={`list-disc space-y-2 pl-5 text-ink-700 ${school.history ? "mt-4" : ""}`}>
                      {school.details.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-accent-200 bg-accent-50 p-4">
                  <p className="font-bold text-ink-900">এই প্রতিষ্ঠানের বিস্তারিত পরিচিতি এখনো যুক্ত হয়নি।</p>
                  <p className="mt-1 text-sm text-ink-600">প্রতিষ্ঠানের ইতিহাস, অর্জন, ছবি বা সংশোধনযোগ্য কোনো তথ্য জানা থাকলে আমাদের পাঠান।</p>
                  <Link href={contributeHref} className="c-btn c-btn--accent mt-3">
                    তথ্য দিন
                  </Link>
                </div>
              )}
            </Block>

            <Block id="facts" title="এক নজরে">
              <dl className="divide-y divide-ink-100">
                {facts.map((f) => (
                  <div key={f.label} className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[180px_1fr] sm:gap-4">
                    <dt className="font-semibold text-ink-500">{f.label}</dt>
                    <dd className="text-ink-900">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </Block>

            {school.images && school.images.length > 0 && (
              <Block id="gallery" title="ছবি">
                <Gallery images={school.images} altBase={school.name} credits={galleryCredits(school.images)} />
                <GalleryCredits credits={school.images.map((img) => creditFor(img.src))} />
              </Block>
            )}

            {sameVillage.length > 0 && village && (
              <Block title={`${village.name} গ্রামের আরও শিক্ষা প্রতিষ্ঠান`}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {sameVillage.map((s) => (
                    <SchoolRow key={s.slug} school={withSchoolImages(s)} />
                  ))}
                </div>
              </Block>
            )}

            {sameUnion.length > 0 && (
              <Block title={`${union.name} ইউনিয়নের আরও শিক্ষা প্রতিষ্ঠান`}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {sameUnion.map((s) => (
                    <SchoolRow key={s.slug} school={withSchoolImages(s)} locationLabel={s.village ? db.getVillage(s.village)?.name : undefined} />
                  ))}
                </div>
                <Link href={`/unions/${union.slug}#schools`} className="text-link mt-4 inline-block">
                  ইউনিয়নের সব শিক্ষা প্রতিষ্ঠান
                </Link>
              </Block>
            )}

            {school.sources && school.sources.length > 0 && (
              <p className="text-sm text-ink-400">
                তথ্যসূত্র:{" "}
                {uniqueSources(school.sources).map((s, i) => (
                  <span key={s.label}>
                    {i > 0 && ", "}
                    {s.href ? (
                      <a href={s.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink-600">
                        {s.label}
                      </a>
                    ) : (
                      s.label
                    )}
                  </span>
                ))}
              </p>
            )}
          </div>

          <aside className="space-y-6">
            <Block title="অবস্থান">
              <MapView
                center={[coords.lat, coords.lng]}
                zoom={13}
                markers={[{ lat: coords.lat, lng: coords.lng, label: school.name, sub: place, kind: "focus" }]}
                className="h-[280px] w-full"
              />
              {coords.approx && (
                <p className="mt-3 text-sm text-ink-400">প্রতিষ্ঠানটির সুনির্দিষ্ট অবস্থান এখনো যুক্ত হয়নি। আপাতত গ্রাম বা ইউনিয়নের আনুমানিক অবস্থান দেখানো হচ্ছে।</p>
              )}
              <a href={searchUrl} target="_blank" rel="noopener noreferrer" className="c-btn c-btn--solid mt-4">
                Google Maps-এ দেখুন
              </a>
            </Block>

            <Block title={village ? `${village.name} গ্রাম` : `${union.name} ইউনিয়ন`}>
              <p className="line-clamp-4 text-sm text-ink-600">{village?.description ?? village?.tagline ?? union.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {village && (
                  <Link href={`/villages/${village.slug}`} className="c-btn c-btn--outline">
                    গ্রামের পেজ
                  </Link>
                )}
                <Link href={`/unions/${union.slug}`} className="c-btn c-btn--outline">
                  ইউনিয়নের পেজ
                </Link>
              </div>
            </Block>

            <Block className="border-brand-200 bg-brand-50">
              <h2 className="font-display text-[1.6rem] font-bold leading-tight text-brand-900">এই প্রতিষ্ঠানের তথ্য বা ছবি আছে?</h2>
              <p className="mt-1 text-sm text-ink-600">প্রতিষ্ঠানের ছবি, প্রতিষ্ঠাকাল, ইতিহাস বা ভুল তথ্যের সংশোধন পাঠান। যাচাই করে পেজে যুক্ত করা হবে।</p>
              <Link href={contributeHref} className="c-btn c-btn--solid mt-4">
                তথ্য জমা দিন
              </Link>
            </Block>
          </aside>
        </div>
      </Container>
    </>
  );
}

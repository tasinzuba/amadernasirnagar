import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PersonCard, PlaceRow, SchoolRow, VillageChip } from "@/components/cards";
import { CoverImage } from "@/components/cover-image";
import { Gallery } from "@/components/gallery";
import { JsonLd } from "@/components/json-ld";
import { MapView } from "@/components/map/map-view";
import { MapPin } from "lucide-react";
import { Block, Container, Fact, HeaderFrame, PageHeader } from "@/components/section";
import { StatusBadge } from "@/components/status-badge";
import { site } from "@/data/site";
import { transportGuide } from "@/data/transport";
import { toBn } from "@/lib/bn";
import { bearing, directionBn, distanceKm } from "@/lib/geo";
import { creditFor, galleryCredits, withPersonPhoto, withPlaceImages, withSchoolImages, withVillageImages } from "@/lib/images";
import { GalleryCredits, PhotoCredit } from "@/components/photo-credit";
import { data } from "@/lib/data";
import type { Institution } from "@/lib/types";

type Params = Promise<{ slug: string }>;

/** সব গ্রাম build-এর সময় তৈরি হয়; অজানা slug হলে সঠিক ৪০৪ দেয় */
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const db = await data();
  return db.getVillages().map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const db = await data();
  const { slug } = await params;
  const village = db.getVillage(slug);
  if (!village) return { title: "গ্রামের তথ্য পাওয়া যায়নি" };
  const union = db.getUnion(village.union);
  const title = `${village.name} গ্রাম, ${union?.name ?? ""} ইউনিয়ন`;
  const description =
    village.description ??
    `${village.name} গ্রাম, ${union?.name ?? ""} ইউনিয়ন, নাসিরনগর। গ্রামের পরিচিতি, ইতিহাস, গুরুত্বপূর্ণ স্থান ও স্থানীয় তথ্য জানুন।`;
  return { title, description, openGraph: { title, description } };
}

function RouteSteps({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div>
      <h3 className="font-semibold text-brand-900">{title}</h3>
      <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-ink-600">
        {steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
    </div>
  );
}

const educationTypes = new Set<string>(["কলেজ", "উচ্চ বিদ্যালয়", "প্রাথমিক বিদ্যালয়", "মাদ্রাসা"]);

function groupInstitutions(list: Institution[]): [string, Institution[]][] {
  const groups = new Map<string, Institution[]>();
  for (const item of list) {
    const arr = groups.get(item.type) ?? [];
    arr.push(item);
    groups.set(item.type, arr);
  }
  return [...groups.entries()];
}

export default async function VillagePage({ params }: { params: Params }) {
  const db = await data();
  const { slug } = await params;
  const found = db.getVillage(slug);
  if (!found) notFound();
  const village = withVillageImages(found);
  const union = db.getUnion(village.union);
  if (!union) notFound();

  const places = db.placesOfVillage(village.slug).map(withPlaceImages);
  const people = await Promise.all(db.peopleOfVillage(village.slug).map(withPersonPhoto));
  const events = db.eventsOfVillage(village.slug);
  const schools = db.schoolsOfVillage(village.slug).map(withSchoolImages);
  const coords = db.villageCoords(village);
  const nearby = db.nearbyVillages(village, 12);
  const isSadar = village.slug === "nasirnagar";
  const km = Math.round(distanceKm(site.upazila.sadar, coords));
  const dir = directionBn(bearing(site.upazila.sadar, coords));
  const distanceLabel = isSadar ? "উপজেলা সদর" : `প্রায় ${toBn(km)} কিমি ${dir}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;
  const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${village.name}, নাসিরনগর, ব্রাহ্মণবাড়িয়া`,
  )}`;
  const contributeHref = `/contribute?village=${encodeURIComponent(village.name)}&union=${union.slug}`;
  const t = village.transport;
  // স্কুল-কলেজ-মাদ্রাসা আলাদা তালিকায় (শিক্ষা প্রতিষ্ঠান); এখানে মসজিদ, মন্দির, স্বাস্থ্যকেন্দ্রের মতো বাকিগুলো
  const institutions = groupInstitutions((village.institutions ?? []).filter((i) => !educationTypes.has(i.type)));

  const fromSadarDefault = isSadar
    ? ["এটি উপজেলা সদর। এখান থেকে বিভিন্ন ইউনিয়নে সড়কপথে এবং বর্ষায় প্রয়োজন অনুযায়ী নৌপথে চলাচল করা যায়।"]
    : [
        `নাসিরনগর সদর থেকে ${village.name} গ্রাম ${distanceLabel}। ${union.name} ইউনিয়নের স্থানীয় যানবাহন ও পথ সম্পর্কে রওনা দেওয়ার আগে খোঁজ নিন।`,
        "যাত্রার আগে স্থানীয় যানবাহনের সময়সূচি ও ভাড়া নিশ্চিত করে নিন।",
      ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Place",
          name: `${village.name} গ্রাম`,
          description: village.description ?? `${village.name} গ্রাম, ${union.name} ইউনিয়ন, নাসিরনগর উপজেলা`,
          url: `${site.url.replace(/\/$/, "")}/villages/${village.slug}`,
          geo: { "@type": "GeoCoordinates", latitude: coords.lat, longitude: coords.lng },
          containedInPlace: { "@type": "AdministrativeArea", name: `${union.name} ইউনিয়ন, নাসিরনগর উপজেলা, ব্রাহ্মণবাড়িয়া` },
          address: { "@type": "PostalAddress", addressLocality: union.name, addressRegion: "ব্রাহ্মণবাড়িয়া", postalCode: village.postcode ?? union.postcode, addressCountry: "BD" },
        }}
      />
      <PageHeader
        title={village.name}
        theme="villages"
        eyebrow={`${union.name} ইউনিয়ন`}
        crumbs={[
          { label: "গ্রাম", href: "/villages" },
          { label: `${union.name} ইউনিয়ন`, href: `/unions/${union.slug}` },
          { label: village.name },
        ]}
        aside={
          village.cover ? (
            <HeaderFrame tag={`${union.name} ইউনিয়ন`} image={village.cover} imageAlt={`${village.name} গ্রাম`} credit={creditFor(village.cover)} />
          ) : (
            <HeaderFrame
              tag={`${union.name} ইউনিয়ন`}
              icon={MapPin}
              value={isSadar ? "সদর" : `${toBn(km)} কিমি`}
              label={isSadar ? "এটাই উপজেলা সদর" : `উপজেলা সদর থেকে, ${dir}`}
            />
          )
        }
      >
        <p className="mt-4 text-lg text-white/70">
          {village.nameEn},{" "}
          <Link href={`/unions/${union.slug}`} className="text-link-light">
            {union.name} ইউনিয়ন
          </Link>
          , {site.upazila.name} উপজেলা
        </p>
        {village.tagline && <p className="mt-3 max-w-2xl text-xl leading-relaxed text-white/90">{village.tagline}</p>}
        <div className="mt-5">
          <StatusBadge status={village.status} tone="dark" />
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="c-btn c-btn--theme">
            গুগল ম্যাপে পথ দেখুন
          </a>
          <Link href={contributeHref} className="c-btn c-btn--light">
            তথ্য দিন
          </Link>
        </div>
        <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Fact label="ইউনিয়ন" value={union.name} />
          <Fact label="সদর থেকে দূরত্ব" value={distanceLabel} />
          <Fact label="পোস্টকোড" value={toBn(village.postcode ?? union.postcode ?? "তথ্য যোগ হবে")} />
          <Fact label="মৌজা" value={village.mouza ?? "তথ্য যোগ হবে"} />
        </dl>
        {coords.approx && !isSadar && (
          <p className="mt-3 text-sm text-white/55">দূরত্বটি ইউনিয়নের আনুমানিক অবস্থান ধরে হিসাব করা। গ্রামের সঠিক অবস্থান জানা থাকলে আমাদের জানাতে পারেন।</p>
        )}
      </PageHeader>

      <Container className="py-8 sm:py-10">
        {village.cover && (
          <div className="mb-8 lg:hidden">
            <CoverImage
              src={village.cover}
              alt={`${village.name} গ্রাম`}
              seed={village.slug}
              className="relative aspect-[21/9] rounded-xl sm:aspect-[3/1]"
              sizes="100vw"
              priority
            />
            <PhotoCredit credit={creditFor(village.cover)} className="mt-2" />
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <Block id="intro" title="পরিচয়">
              {village.description ? (
                <p className="text-ink-700">{village.description}</p>
              ) : (
                <div className="rounded-xl border border-dashed border-accent-200 bg-accent-50 p-4">
                  <p className="font-bold text-ink-900">এই গ্রামের বিস্তারিত তথ্য এখনো যুক্ত হয়নি।</p>
                  <p className="mt-1 text-sm text-ink-600">{village.name} গ্রাম {union.name} ইউনিয়নের অন্তর্ভুক্ত। গ্রামের ইতিহাস, স্থাপনা, শিক্ষাপ্রতিষ্ঠান, গুরুত্বপূর্ণ ব্যক্তি ও ছবি সম্পর্কে নির্ভরযোগ্য তথ্য থাকলে আমাদের পাঠান।</p>
                  <Link href={contributeHref} className="c-btn c-btn--accent mt-3">
                    তথ্য দিন
                  </Link>
                </div>
              )}
            </Block>

            {village.history && (
              <Block id="history" title="ইতিহাস">
                <p className="text-ink-700">{village.history}</p>
              </Block>
            )}

            {places.length > 0 && (
              <Block id="places" title="দর্শনীয় স্থান">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {places.map((p) => (
                    <PlaceRow key={p.slug} place={p} />
                  ))}
                </div>
              </Block>
            )}

            {people.length > 0 && (
              <Block id="people" title="বিশিষ্ট ব্যক্তি">
                <div className="grid grid-cols-1 gap-8">
                  {people.map((p) => (
                    <PersonCard key={p.slug} person={p} showDetails />
                  ))}
                </div>
              </Block>
            )}

            <Block id="schools" title="শিক্ষা প্রতিষ্ঠান">
              {schools.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {schools.map((s) => (
                    <SchoolRow key={s.slug} school={s} />
                  ))}
                </div>
              ) : (
                <p className="text-ink-600">
                  এই গ্রামের স্কুল, কলেজ বা মাদ্রাসার তথ্য এখনো যুক্ত হয়নি।{" "}
                  <Link href={contributeHref} className="text-link">
                    তথ্য দিন
                  </Link>
                </p>
              )}
              <Link href="/schools" className="text-link mt-4 inline-block">
                নাসিরনগরের সব শিক্ষা প্রতিষ্ঠান
              </Link>
            </Block>

            {institutions.length > 0 && (
              <Block id="institutions" title="অন্যান্য প্রতিষ্ঠান">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {institutions.map(([type, list]) => (
                    <div key={type}>
                      <h3 className="eyebrow">{type}</h3>
                      <ul className="mt-1 space-y-1 text-ink-700">
                        {list.map((i) => (
                          <li key={i.name}>
                            {i.name}
                            {i.note && <span className="text-sm text-ink-300"> ({i.note})</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Block>
            )}

            {village.markets && village.markets.length > 0 && (
              <Block id="markets" title="হাট-বাজার">
                <ul className="divide-y divide-ink-100">
                  {village.markets.map((m) => (
                    <li key={m.name} className="flex flex-wrap items-baseline justify-between gap-2 py-2">
                      <span className="font-semibold text-ink-700">{m.name}</span>
                      <span className="text-sm text-ink-300">{m.days ?? m.note ?? "হাটবারের তথ্য যুক্ত হবে"}</span>
                    </li>
                  ))}
                </ul>
              </Block>
            )}

            {events.length > 0 && (
              <Block id="events" title="উৎসব ও মেলা">
                <ul className="divide-y divide-ink-100">
                  {events.map((e) => (
                    <li key={e.slug} className="flex gap-4 py-3">
                      <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-accent-50 font-display text-[1.2rem] font-bold text-accent-800">
                        {e.badge}
                      </span>
                      <div>
                        <Link href={`/events#${e.slug}`} className="font-bold text-ink-900 hover:text-brand-600">
                          {e.title}
                        </Link>
                        <p className="text-sm text-ink-600">{e.when}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Block>
            )}

            <Block id="transport" title="যাতায়াত">
              <div className="space-y-5">
                <RouteSteps title="ঢাকা থেকে" steps={t?.fromDhaka ?? transportGuide.routes[0].steps} />
                <RouteSteps
                  title="ব্রাহ্মণবাড়িয়া শহর থেকে"
                  steps={t?.fromBrahmanbaria ?? transportGuide.routes[2].steps}
                />
                <RouteSteps title="নাসিরনগর সদর থেকে" steps={t?.fromSadar ?? fromSadarDefault} />
                {t?.monsoon && (
                  <div className="rounded-xl bg-brand-50 p-4 text-sm text-brand-900">
                    <span className="font-bold">বর্ষাকালে:</span> {t.monsoon}
                  </div>
                )}
                {t?.fares && t.fares.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-ink-50 text-ink-600">
                        <tr>
                          <th className="px-3 py-2 font-semibold">পথ</th>
                          <th className="px-3 py-2 font-semibold">বাহন</th>
                          <th className="px-3 py-2 font-semibold">ভাড়া</th>
                          <th className="px-3 py-2 font-semibold">সময়</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink-100">
                        {t.fares.map((f) => (
                          <tr key={`${f.route}-${f.mode}`}>
                            <td className="px-3 py-2">{f.route}</td>
                            <td className="px-3 py-2">{f.mode}</td>
                            <td className="px-3 py-2">{f.fare}</td>
                            <td className="px-3 py-2">{f.time ?? "–"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {t?.notes && t.notes.length > 0 && (
                  <ul className="list-disc space-y-1 pl-5 text-sm text-ink-600">
                    {t.notes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                )}
                <p className="text-sm text-ink-600">সড়ক, রেল ও নৌপথের বিস্তারিত তথ্য দেখুন{" "}<Link href="/transport" className="text-link">
                    যাতায়াত গাইডে
                  </Link>
                </p>
              </div>
            </Block>

            {village.images && village.images.length > 0 && (
              <Block id="gallery" title="ছবি">
                <Gallery images={village.images} altBase={`${village.name} গ্রামের`} credits={galleryCredits(village.images)} />
                <GalleryCredits credits={village.images.map((img) => creditFor(img.src))} />
              </Block>
            )}
          </div>

          <aside className="space-y-6">
            <Block title="মানচিত্র">
              <MapView
                center={[coords.lat, coords.lng]}
                zoom={13}
                markers={[
                  {
                    lat: coords.lat,
                    lng: coords.lng,
                    label: village.name,
                    sub: `${union.name} ইউনিয়ন`,
                    kind: "focus",
                  },
                ]}
                className="h-[280px] w-full"
              />
              {coords.approx && (
                <p className="mt-3 text-sm text-ink-400">গ্রামের সুনির্দিষ্ট অবস্থান এখনো যুক্ত হয়নি। আপাতত ইউনিয়নের আনুমানিক অবস্থান দেখানো হচ্ছে।</p>
              )}
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                <a
                  href={searchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  Google Maps-এ খুঁজুন
                </a>
                <Link href="/map" className="text-link">
                  উপজেলার মানচিত্র
                </Link>
              </div>
            </Block>

            <Block title={`${union.name} ইউনিয়ন`}>
              <p className="line-clamp-4 text-sm text-ink-600">{union.description}</p>
              <Link href={`/unions/${union.slug}`} className="c-btn c-btn--outline mt-4">
                ইউনিয়নের পেজ
              </Link>
            </Block>

            {nearby.length > 0 && (
              <Block title="এই ইউনিয়নের আরও গ্রাম">
                <div className="flex flex-wrap gap-2">
                  {nearby.map((v) => (
                    <VillageChip key={v.slug} slug={v.slug} name={v.name} status={v.status} />
                  ))}
                </div>
              </Block>
            )}

            <Block className="border-brand-200 bg-brand-50">
              <h2 className="font-display text-[1.6rem] font-bold leading-tight text-brand-900">এই গ্রামের তথ্য জানেন?</h2>
              <p className="mt-1 text-sm text-ink-600">গ্রামের ইতিহাস, গুরুত্বপূর্ণ স্থান, ব্যক্তি, ছবি বা কোনো ভুল তথ্য সম্পর্কে জানাতে পারেন। যাচাই করে প্রাসঙ্গিক তথ্য যুক্ত করা হবে।</p>
              <Link href={contributeHref} className="c-btn c-btn--solid mt-4">তথ্য জমা দিন</Link>
            </Block>
          </aside>
        </div>
      </Container>
    </>
  );
}

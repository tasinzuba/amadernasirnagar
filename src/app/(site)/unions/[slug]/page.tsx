import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PersonCard, PlaceRow, SchoolRow, VillageChip } from "@/components/cards";
import { MapView } from "@/components/map/map-view";
import { Landmark } from "lucide-react";
import { Block, Container, Fact, HeaderFrame, PageHeader } from "@/components/section";
import { site } from "@/data/site";
import { formatBn, formatDecimalBn, toBn } from "@/lib/bn";
import { bearing, directionBn, distanceKm } from "@/lib/geo";
import { data } from "@/lib/data";
import { withPersonPhoto, withPlaceImages, withSchoolImages } from "@/lib/images";

type Params = Promise<{ slug: string }>;

export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const db = await data();
  return db.getUnions().map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const db = await data();
  const { slug } = await params;
  const union = db.getUnion(slug);
  if (!union) return { title: "ইউনিয়নের তথ্য পাওয়া যায়নি" };
  const title = `${union.name} ইউনিয়ন`;
  return { title, description: union.description, openGraph: { title, description: union.description } };
}

export default async function UnionPage({ params }: { params: Params }) {
  const db = await data();
  const { slug } = await params;
  const union = db.getUnion(slug);
  if (!union) notFound();

  const villages = db.villagesOfUnion(slug);
  const places = db.placesOfUnion(slug).map(withPlaceImages);
  const people = await Promise.all(db.peopleOfUnion(slug).map(withPersonPhoto));
  const schools = db.schoolsOfUnion(slug).map(withSchoolImages);
  const isSadar = slug === "nasirnagar";
  const km = Math.round(distanceKm(site.upazila.sadar, union));
  const dir = directionBn(bearing(site.upazila.sadar, union));
  const distanceLabel = isSadar ? "উপজেলা সদর" : `প্রায় ${toBn(km)} কিমি ${dir}`;

  // উইকিপিডিয়ার নামের তালিকায় যাঁদের আলাদা প্রোফাইল নেই
  const extraNames = (union.notablePeople ?? []).filter((n) => {
    const words = n.split(" (")[0].split(" ");
    return !people.some((p) => words.every((w) => p.name.includes(w)));
  });

  return (
    <>
      <PageHeader
        title={`${union.name} ইউনিয়ন`}
        intro={union.description}
        crumbs={[{ label: "ইউনিয়ন", href: "/unions" }, { label: union.name }]}
        theme="unions"
        eyebrow="নাসিরনগরের ইউনিয়ন"
        aside={<HeaderFrame tag={union.nameEn} icon={Landmark} value={`${toBn(villages.length)}টি`} label="গ্রাম এই ইউনিয়নে" />}
      >
        <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Fact label="আয়তন" value={union.area ? `${formatDecimalBn(union.area)} বর্গ কিমি` : "–"} />
          <Fact label="জনসংখ্যা (২০১১)" value={union.population ? formatBn(union.population) : "–"} />
          <Fact label="মৌজা / গ্রাম" value={`${union.mouzas ? toBn(union.mouzas) : "–"} / ${toBn(villages.length)}`} />
          <Fact label="সদর থেকে" value={distanceLabel} />
        </dl>
        {union.chairman && (
          <p className="mt-5 text-[0.95rem] text-white/75">
            <span className="font-bold text-white">চেয়ারম্যান:</span> {union.chairman}{" "}
            <span className="text-white/50">(উপজেলা পোর্টালের তথ্য; পরিবর্তন হলে জানাতে পারেন)</span>
          </p>
        )}
      </PageHeader>

      <Container className="py-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <Block id="villages" title={`গ্রামগুলো (${toBn(villages.length)})`}>
              <p className="mb-3 text-sm text-ink-600">যেসব গ্রামের তথ্য যুক্ত হয়েছে সেগুলো চিহ্নিত করা আছে। গ্রামের নামে ক্লিক করে বিস্তারিত পরিচিতি দেখুন।</p>
              <div className="flex flex-wrap gap-2">
                {villages.map((v) => (
                  <VillageChip key={v.slug} slug={v.slug} name={v.name} status={v.status} />
                ))}
              </div>
            </Block>

            {(union.nameOrigin || union.history) && (
              <Block id="history" title="ইতিহাস ও নামকরণ">
                {union.nameOrigin && <p className="text-ink-700">{union.nameOrigin}</p>}
                {union.history && <p className="mt-2 text-ink-700">{union.history}</p>}
              </Block>
            )}

            {places.length > 0 && (
              <Block id="places" title="দর্শনীয় স্থান">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {places.map((p) => (
                    <PlaceRow key={p.slug} place={p} locationLabel={p.village ? db.getVillage(p.village)?.name : undefined} />
                  ))}
                </div>
              </Block>
            )}

            {(people.length > 0 || extraNames.length > 0) && (
              <Block id="people" title="কৃতী ব্যক্তিত্ব">
                <div className="grid grid-cols-1 gap-8">
                  {people.map((p) => (
                    <PersonCard
                      key={p.slug}
                      person={p}
                      locationLabel={p.village ? db.getVillage(p.village)?.name : undefined}
                      locationHref={p.village ? `/villages/${p.village}` : undefined}
                    />
                  ))}
                </div>
                {extraNames.length > 0 && (
                  <div className={people.length > 0 ? "mt-4" : ""}>
                    <h3 className="eyebrow">আরও উল্লেখযোগ্য ব্যক্তিদের তথ্য পরে যুক্ত হবে</h3>
                    <ul className="mt-1 list-disc pl-5 text-ink-700">
                      {extraNames.map((n) => (
                        <li key={n}>{n}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Block>
            )}

            <Block id="schools" title={schools.length > 0 ? `শিক্ষা প্রতিষ্ঠান (${toBn(schools.length)})` : "শিক্ষা প্রতিষ্ঠান"}>
              {schools.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {schools.map((s) => (
                    <SchoolRow key={s.slug} school={s} locationLabel={s.village ? db.getVillage(s.village)?.name : s.address} />
                  ))}
                </div>
              ) : union.institutions && union.institutions.length > 0 ? (
                <ul className="list-disc pl-5 text-ink-700">
                  {union.institutions.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink-300">তথ্য যুক্ত হবে</p>
              )}
              <Link href="/schools" className="text-link mt-4 inline-block">
                নাসিরনগরের সব শিক্ষা প্রতিষ্ঠান
              </Link>
            </Block>

            <Block id="markets" title="হাট-বাজার">
              {union.markets && union.markets.length > 0 ? (
                <ul className="list-disc pl-5 text-ink-700">
                  {union.markets.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink-300">তথ্য যুক্ত হবে</p>
              )}
            </Block>

            {union.rivers && union.rivers.length > 0 && (
              <Block id="rivers" title="নদী ও খাল">
                <div className="flex flex-wrap gap-2">
                  {union.rivers.map((r) => (
                    <span key={r} className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-800">
                      {r}
                    </span>
                  ))}
                </div>
              </Block>
            )}
          </div>

          <aside className="space-y-6">
            <Block title="মানচিত্র">
              <MapView
                center={[union.lat, union.lng]}
                zoom={12}
                markers={[{ lat: union.lat, lng: union.lng, label: `${union.name} ইউনিয়ন`, kind: "focus" }]}
                className="h-[280px] w-full"
              />
              <p className="mt-3 text-sm text-ink-400">মানচিত্রে ইউনিয়নের আনুমানিক অবস্থান দেখানো হয়েছে।</p>
            </Block>

            <Block title="যাতায়াত">
              <p className="text-sm text-ink-600">নাসিরনগর সদর থেকে {union.name} ইউনিয়নের অবস্থান {distanceLabel}। স্থানীয় যানবাহন ও বর্তমান যাতায়াতব্যবস্থা সম্পর্কে আগে খোঁজ নিন।</p>
              <Link href="/transport" className="c-btn c-btn--outline mt-4">
                পুরো যাতায়াত গাইড
              </Link>
            </Block>

            <Block className="border-brand-200 bg-brand-50">
              <h2 className="font-display text-[1.6rem] font-bold leading-tight text-brand-900">এই ইউনিয়নের তথ্য জানেন?</h2>
              <p className="mt-1 text-sm text-ink-600">ইউনিয়নের প্রতিষ্ঠান, বাজার, গুরুত্বপূর্ণ ব্যক্তি বা সংশোধনযোগ্য কোনো তথ্য জানলে আমাদের পাঠান। যাচাই করে পেজে যুক্ত করা হবে।</p>
              <Link href={`/contribute?union=${union.slug}`} className="c-btn c-btn--solid mt-4">
                তথ্য পাঠান
              </Link>
            </Block>
          </aside>
        </div>
      </Container>
    </>
  );
}

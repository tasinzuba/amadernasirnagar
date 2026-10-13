import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlaceRow, placeTypeStyle } from "@/components/cards";
import { CoverImage } from "@/components/cover-image";
import { Gallery } from "@/components/gallery";
import { JsonLd } from "@/components/json-ld";
import { MapView } from "@/components/map/map-view";
import { Block, Container, HeaderFrame, PageHeader } from "@/components/section";
import { site } from "@/data/site";
import { data } from "@/lib/data";
import { creditFor, galleryCredits, withPlaceImages } from "@/lib/images";
import { GalleryCredits, PhotoCredit } from "@/components/photo-credit";

type Params = Promise<{ slug: string }>;

export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const db = await data();
  return db.getPlaces().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const db = await data();
  const { slug } = await params;
  const place = db.getPlace(slug);
  if (!place) return { title: "স্থানটির তথ্য পাওয়া যায়নি" };
  return { title: place.name, description: place.summary, openGraph: { title: place.name, description: place.summary } };
}

export default async function PlacePage({ params }: { params: Params }) {
  const db = await data();
  const { slug } = await params;
  const found = db.getPlace(slug);
  if (!found) notFound();
  const place = withPlaceImages(found);
  const union = db.getUnion(place.union);
  if (!union) notFound();
  const village = place.village ? db.getVillage(place.village) : undefined;
  const coords = db.placeCoords(place);
  const others = db.placesOfUnion(place.union)
    .filter((p) => p.slug !== place.slug)
    .slice(0, 4)
    .map(withPlaceImages);
  const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${place.name}, নাসিরনগর, ব্রাহ্মণবাড়িয়া`,
  )}`;
  const contributeHref = `/contribute?village=${encodeURIComponent(village?.name ?? "")}&union=${union.slug}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TouristAttraction",
          name: place.name,
          description: place.summary,
          url: `${site.url.replace(/\/$/, "")}/places/${place.slug}`,
          geo: { "@type": "GeoCoordinates", latitude: coords.lat, longitude: coords.lng },
          address: { "@type": "PostalAddress", addressLocality: `${village ? `${village.name}, ` : ""}${union.name} ইউনিয়ন`, addressRegion: "ব্রাহ্মণবাড়িয়া", addressCountry: "BD" },
          touristType: place.type,
        }}
      />
      <PageHeader
        title={place.name}
        theme="places"
        eyebrow={`${place.type} জায়গা`}
        crumbs={[{ label: "দর্শনীয় স্থান", href: "/places" }, { label: place.name }]}
        aside={
          place.cover ? (
            <HeaderFrame tag={place.type} image={place.cover} imageAlt={place.name} credit={creditFor(place.cover)} />
          ) : (
            <HeaderFrame
              tag={place.type}
              icon={placeTypeStyle[place.type].icon}
              value={village ? village.name : union.name}
              label={village ? `${union.name} ইউনিয়ন, নাসিরনগর` : "ইউনিয়ন, নাসিরনগর"}
            />
          )
        }
      >
        {place.nameEn && <p className="mt-3 text-white/55">{place.nameEn}</p>}
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
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl">{place.summary}</p>
      </PageHeader>

      <Container className="py-8 sm:py-10">
        {place.cover && (
          <div className="mb-8 lg:hidden">
            <CoverImage
              src={place.cover}
              alt={place.name}
              seed={place.slug}
              className="relative aspect-[21/9] rounded-xl sm:aspect-[3/1]"
              sizes="100vw"
              priority
            />
            <PhotoCredit credit={creditFor(place.cover)} className="mt-2" />
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            {place.details && place.details.length > 0 && (
              <Block title="স্থানটির পরিচিতি">
                <ul className="list-disc space-y-2 pl-5 text-ink-700">
                  {place.details.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </Block>
            )}

            {(place.bestTime || (place.tips && place.tips.length > 0)) && (
              <Block title="ভ্রমণের আগে জেনে নিন">
                {place.bestTime && (
                  <p className="text-ink-700">
                    <span className="font-bold">কখন যাবেন:</span> {place.bestTime}
                  </p>
                )}
                {place.tips && place.tips.length > 0 && (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-700">
                    {place.tips.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                )}
              </Block>
            )}

            {place.images && place.images.length > 0 && (
              <Block title="ছবি">
                <Gallery images={place.images} altBase={place.name} credits={galleryCredits(place.images)} />
                <GalleryCredits credits={place.images.map((img) => creditFor(img.src))} />
              </Block>
            )}

            {others.length > 0 && (
              <Block title={`${union.name} ইউনিয়নে আরও যা দেখবেন`}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {others.map((p) => (
                    <PlaceRow key={p.slug} place={p} />
                  ))}
                </div>
              </Block>
            )}
          </div>

          <aside className="space-y-6">
            <Block title="অবস্থান">
              <MapView
                center={[coords.lat, coords.lng]}
                zoom={13}
                markers={[{ lat: coords.lat, lng: coords.lng, label: place.name, kind: "place" }]}
                className="h-[280px] w-full"
              />
              {coords.approx && (
                <p className="mt-3 text-sm text-ink-400">এই স্থানটির সুনির্দিষ্ট অবস্থান এখনো যুক্ত হয়নি। আপাতত গ্রাম বা ইউনিয়নের আনুমানিক অবস্থান দেখানো হচ্ছে।</p>
              )}
              <a href={searchUrl} target="_blank" rel="noopener noreferrer" className="c-btn c-btn--solid mt-4">
                Google Maps-এ দেখুন
              </a>
            </Block>

            <Block title="কীভাবে যাবেন">
              <p className="text-sm text-ink-600">নাসিরনগর সদর থেকে স্থানীয় যানবাহনে{" "}{village ? `${village.name} গ্রাম` : `${union.name} ইউনিয়ন`}{" "}হয়ে পৌঁছানোর পথ সম্পর্কে খোঁজ নিতে পারেন।</p>
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                {village && (
                  <Link href={`/villages/${village.slug}#transport`} className="text-link">
                    গ্রামে যাওয়ার পথ
                  </Link>
                )}
                <Link href="/transport" className="text-link">
                  পুরো যাতায়াত গাইড
                </Link>
              </div>
            </Block>

            <Block className="border-brand-200 bg-brand-50">
              <h2 className="font-display text-[1.6rem] font-bold leading-tight text-brand-900">স্থানটি সম্পর্কে তথ্য জানেন?</h2>
              <p className="mt-1 text-sm text-ink-600">এই স্থানের ইতিহাস, আপনার তোলা ছবি, অবস্থান বা দর্শনার্থীদের জন্য প্রয়োজনীয় তথ্য থাকলে আমাদের পাঠান।</p>
              <Link href={contributeHref} className="c-btn c-btn--solid mt-4">তথ্য জমা দিন</Link>
            </Block>
          </aside>
        </div>
      </Container>
    </>
  );
}

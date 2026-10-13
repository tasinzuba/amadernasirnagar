import type { Metadata } from "next";
import Link from "next/link";
import { MapView } from "@/components/map/map-view";
import { Map as MapIcon } from "lucide-react";
import { Container, HeaderFrame, PageHeader } from "@/components/section";
import type { MapMarker } from "@/components/map/leaflet-map";
import { site } from "@/data/site";
import { toBn } from "@/lib/bn";
import { data } from "@/lib/data";

export const metadata: Metadata = {
  title: "মানচিত্র",
  description: "নাসিরনগরের ১৩টি ইউনিয়ন, গ্রাম ও দর্শনীয় স্থানের ভৌগোলিক অবস্থান দেখুন।",
};

export default async function MapPage() {
  const db = await data();
  const unions = db.getUnions();
  const markers: MapMarker[] = [
    ...unions.map<MapMarker>((u) => ({
      lat: u.lat,
      lng: u.lng,
      label: `${u.name} ইউনিয়ন`,
      sub: `${toBn(db.villagesOfUnion(u.slug).length)}টি গ্রাম`,
      href: `/unions/${u.slug}`,
      kind: "union",
    })),
    ...db.getVillages()
      .filter((v) => v.lat !== undefined && v.lng !== undefined && v.slug !== "nasirnagar")
      .map<MapMarker>((v) => ({
        lat: v.lat as number,
        lng: v.lng as number,
        label: v.name,
        sub: "গ্রাম",
        href: `/villages/${v.slug}`,
        kind: "village",
      })),
    ...db.getPlaces()
      .filter((p) => p.lat !== undefined && p.lng !== undefined)
      .map<MapMarker>((p) => ({
        lat: p.lat as number,
        lng: p.lng as number,
        label: p.name,
        sub: p.type,
        href: `/places/${p.slug}`,
        kind: "place",
      })),
  ];

  return (
    <>
      <PageHeader
        title="নাসিরনগরের মানচিত্র"
        intro="মানচিত্রে ইউনিয়নের চিহ্ন নির্বাচন করে সংশ্লিষ্ট পেজে যেতে পারেন। গ্রামের নির্ভুল অবস্থান পাওয়া গেলে পর্যায়ক্রমে তা যুক্ত করা হবে।"
        crumbs={[{ label: "মানচিত্র" }]}
        theme="map"
        eyebrow="কোথায় কী"
        aside={<HeaderFrame tag="মানচিত্র" icon={MapIcon} value={toBn(unions.length)} label="মানচিত্রে ইউনিয়নের অবস্থান দেখুন" />}
      />
      <Container className="py-10">
        <MapView
          center={[site.upazila.lat, site.upazila.lng]}
          zoom={11}
          markers={markers}
          className="h-[60vh] min-h-[420px] w-full"
          scrollWheelZoom
        />
        <div className="mt-4 flex flex-wrap gap-5 text-sm text-ink-600">
          <span className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full border-2 border-white bg-accent-500 ring-1 ring-accent-500" /> ইউনিয়ন কেন্দ্র
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border-2 border-white bg-azure-500 ring-1 ring-azure-500" /> গ্রাম
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border-2 border-white bg-iris-500 ring-1 ring-iris-500" /> দর্শনীয় স্থান
          </span>
        </div>

        <h2 className="mt-12 font-display text-[2.4rem] font-bold leading-tight text-brand-900">ইউনিয়ন অনুযায়ী দেখুন</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {unions.map((u) => (
            <Link
              key={u.slug}
              href={`/unions/${u.slug}`}
              className="c-card flex items-center justify-between px-4 py-3 transition-colors hover:border-brand-500"
            >
              <span className="font-bold text-ink-900">{u.name}</span>
              <span className="text-sm text-ink-300">{toBn(db.villagesOfUnion(u.slug).length)} গ্রাম</span>
            </Link>
          ))}
        </div>
      </Container>
    </>
  );
}

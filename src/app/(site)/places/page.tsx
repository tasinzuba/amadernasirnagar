import type { Metadata } from "next";
import { PlaceCard } from "@/components/cards";
import { Camera } from "lucide-react";
import { Container, HeaderFrame, PageHeader } from "@/components/section";
import { toBn } from "@/lib/bn";
import { data, type Data } from "@/lib/data";
import { withPlaceImages } from "@/lib/images";
import type { PlaceType } from "@/lib/types";

export const metadata: Metadata = {
  title: "দর্শনীয় স্থান",
  description:
    "নাসিরনগরের ঐতিহাসিক স্থাপনা, ধর্মীয় স্থান, হাওর, নদী ও প্রাকৃতিক দর্শনীয় স্থানের পরিচিতি।",
};

const order: { type: PlaceType; id: string; intro: string }[] = [
  { type: "ঐতিহাসিক", id: "historic", intro: "পুরোনো জমিদারবাড়ি, মসজিদ ও ইতিহাসসমৃদ্ধ স্থাপনা।" },
  { type: "প্রাকৃতিক", id: "nature", intro: "হাওর, নদী, দীঘি ও প্রকৃতির মনোরম পরিবেশ।" },
  { type: "ধর্মীয়", id: "religious", intro: "মন্দির, মাজার ও ধর্মীয় ঐতিহ্যের গুরুত্বপূর্ণ স্থান।" },
  { type: "বিনোদন", id: "recreation", intro: "খেলার মাঠ, পার্ক ও স্থানীয় আয়োজনের স্থান।" },
];

function locationOf(db: Data, unionSlug: string, villageSlug?: string): string {
  const village = villageSlug ? db.getVillage(villageSlug) : undefined;
  return `${village ? `${village.name}, ` : ""}${db.unionName(unionSlug)} ইউনিয়ন`;
}

export default async function PlacesPage() {
  const db = await data();
  const allPlaces = db.getPlaces();
  const groups = order
    .map((g) => ({ ...g, places: allPlaces.filter((p) => p.type === g.type).map(withPlaceImages) }))
    .filter((g) => g.places.length > 0);

  return (
    <>
      <PageHeader
        title="নাসিরনগরের দর্শনীয় স্থান"
        intro={`নাসিরনগরের ${toBn(allPlaces.length)}টি দর্শনীয় স্থান এখানে বিভাগ অনুযায়ী সাজানো রয়েছে। প্রতিটি স্থানের ইতিহাস, অবস্থান ও বিশেষত্ব জানুন। কোনো তথ্য বা ছবি অনুপস্থিত থাকলে পাঠাতে পারেন।`}
        crumbs={[{ label: "দর্শনীয় স্থান" }]}
        theme="places"
        eyebrow="বেড়াতে এলে"
        aside={<HeaderFrame tag="দর্শনীয় স্থান" icon={Camera} value={toBn(allPlaces.length)} label="দেখার মতো জায়গা, চার ভাগে" />}
      >
        <nav className="mt-5 flex flex-wrap gap-2" aria-label="ধরন অনুযায়ী">
          {groups.map((g) => (
            <a key={g.id} href={`#${g.id}`} className="c-btn c-btn--light c-btn--sm">
              {g.type} ({toBn(g.places.length)})
            </a>
          ))}
        </nav>
      </PageHeader>

      <Container className="space-y-20 py-14">
        {groups.map((g) => (
          <section key={g.id} id={g.id} className="scroll-mt-20">
            <h2 className="font-display text-[2.4rem] font-bold leading-tight text-brand-900">{g.type} স্থান</h2>
            <p className="mt-1 text-ink-600">{g.intro}</p>
            <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {g.places.map((p) => (
                <PlaceCard key={p.slug} place={p} locationLabel={locationOf(db, p.union, p.village)} />
              ))}
            </div>
          </section>
        ))}
      </Container>
    </>
  );
}

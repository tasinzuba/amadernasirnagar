import type { Metadata } from "next";
import Link from "next/link";
import { PersonCard } from "@/components/cards";
import { Users } from "lucide-react";
import { Container, HeaderFrame, PageHeader } from "@/components/section";
import { toBn } from "@/lib/bn";
import { data } from "@/lib/data";
import { withPersonPhoto } from "@/lib/images";
import type { PersonCategory } from "@/lib/types";

export const metadata: Metadata = {
  title: "বিশিষ্ট ব্যক্তি",
  description: "নাসিরনগরের ইতিহাসে অবদান রাখা রাজনীতিবিদ, মুক্তিযোদ্ধা, শিক্ষাবিদ, সমাজসেবক ও অন্যান্য কৃতী ব্যক্তিত্বের পরিচিতি।",
};

const order: PersonCategory[] = [
  "রাজনীতিবিদ",
  "মুক্তিযোদ্ধা",
  "শিক্ষাবিদ",
  "ধর্মীয় ব্যক্তিত্ব",
  "সরকারি কর্মকর্তা",
  "সাহিত্য ও সংস্কৃতি",
  "সমাজসেবক",
  "অন্যান্য",
];

export default async function PeoplePage() {
  const db = await data();
  const allPeople = await Promise.all(db.getPeople().map(withPersonPhoto));
  const groups = order
    .map((category) => ({ category, people: allPeople.filter((p) => p.category === category) }))
    .filter((g) => g.people.length > 0);

  return (
    <>
      <PageHeader
        title="নাসিরনগরের কৃতী ব্যক্তিত্ব"
        intro={`নাসিরনগরের ${toBn(allPeople.length)} জন কৃতী ব্যক্তিত্বের পরিচিতি এখানে সংরক্ষিত আছে। আপনার এলাকার কোনো গুরুত্বপূর্ণ ব্যক্তির তথ্য জানা থাকলে পাঠান। জীবিত ব্যক্তির তথ্য প্রকাশের আগে তাঁর অনুমতি নেওয়া হয়।`}
        crumbs={[{ label: "বিশিষ্ট ব্যক্তি" }]}
        theme="people"
        eyebrow="আমাদের মানুষ"
        aside={<HeaderFrame tag="গুণী মানুষ" icon={Users} value={`${toBn(allPeople.length)} জন`} label="কৃতী ব্যক্তিত্বের পরিচিতি" />}
      />

      <Container className="space-y-20 py-14">
        {groups.map((g) => (
          <section key={g.category}>
            <h2 className="font-display text-[2.4rem] font-bold leading-tight text-brand-900">
              {g.category} <span className="font-sans text-lg font-normal text-ink-400">({toBn(g.people.length)})</span>
            </h2>
            <div className="mt-10 columns-1 gap-x-8 lg:columns-2 [&>*]:mb-8 [&>*]:break-inside-avoid">
              {g.people.map((p) => {
                const village = p.village ? db.getVillage(p.village) : undefined;
                const label = village
                  ? `${village.name}, ${db.unionName(village.union)} ইউনিয়ন`
                  : p.union
                    ? `${db.unionName(p.union)} ইউনিয়ন`
                    : "নাসিরনগর";
                const href = village ? `/villages/${village.slug}` : p.union ? `/unions/${p.union}` : undefined;
                return <PersonCard key={p.slug} person={p} locationLabel={label} locationHref={href} showDetails boxed />;
              })}
            </div>
          </section>
        ))}

        <div className="rounded-xl border border-dashed border-line-strong p-8 text-center">
          <p className="font-bold text-ink-900">কোনো গুরুত্বপূর্ণ ব্যক্তির তথ্য বাদ পড়েছে?</p>
          <p className="mt-1 text-sm text-ink-600">তাঁর নাম, পরিচয়, অবদান ও তথ্যসূত্র আমাদের জানাতে পারেন।{" "}<Link href="/contribute" className="text-link">
              তথ্য দিন
            </Link>
          </p>
        </div>
      </Container>
    </>
  );
}

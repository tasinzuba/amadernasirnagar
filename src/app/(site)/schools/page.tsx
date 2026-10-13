import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Container, Fact, HeaderFrame, PageHeader } from "@/components/section";
import { SchoolDirectory, type SchoolListItem } from "@/components/school-directory";
import { toBn } from "@/lib/bn";
import { data } from "@/lib/data";
import { withSchoolImages } from "@/lib/images";
import { schoolTypeSchema } from "@/lib/schemas";

export const metadata: Metadata = {
  title: "শিক্ষা প্রতিষ্ঠান",
  description: "নাসিরনগর উপজেলার কলেজ, মাধ্যমিক ও প্রাথমিক বিদ্যালয় এবং মাদ্রাসার তালিকা: নাম, ছবি, প্রতিষ্ঠাকাল ও অবস্থানসহ।",
};

export default async function SchoolsPage() {
  const db = await data();
  const schools = db.getSchools().map(withSchoolImages);
  const unions = db.getUnions().map((u) => ({ slug: u.slug, name: u.name }));

  const items: SchoolListItem[] = schools.map((s) => {
    const village = s.village ? db.getVillage(s.village) : undefined;
    const unionName = db.unionName(s.union);
    return {
      slug: s.slug,
      name: s.name,
      type: s.type,
      level: s.level,
      established: s.established,
      cover: s.cover,
      union: s.union,
      location: `${village ? `${village.name}, ` : s.address ? `${s.address}, ` : ""}${unionName} ইউনিয়ন`,
      search: [s.name, s.nameEn, village?.name, village?.nameEn, unionName, s.address, s.eiin].filter(Boolean).join(" ").toLowerCase(),
    };
  });

  const count = (types: string[]) => schools.filter((s) => types.includes(s.type)).length;
  const facts = [
    { label: "কলেজ", value: count(["কলেজ", "স্কুল অ্যান্ড কলেজ"]) },
    { label: "মাধ্যমিক বিদ্যালয়", value: count(["উচ্চ বিদ্যালয়", "নিম্ন মাধ্যমিক বিদ্যালয়"]) },
    { label: "মাদ্রাসা", value: count(["মাদ্রাসা"]) },
    { label: "প্রাথমিক বিদ্যালয়", value: count(["প্রাথমিক বিদ্যালয়"]) },
  ];

  return (
    <>
      <PageHeader
        title="নাসিরনগরের শিক্ষা প্রতিষ্ঠান"
        intro={`উপজেলার ${toBn(schools.length)}টি স্কুল, কলেজ ও মাদ্রাসার পরিচিতি এক জায়গায়: নাম, ছবি, প্রতিষ্ঠাকাল আর অবস্থান। নিজের প্রতিষ্ঠানের ছবি বা তথ্য যোগ করতে চাইলে আমাদের পাঠান।`}
        crumbs={[{ label: "শিক্ষা প্রতিষ্ঠান" }]}
        theme="schools"
        eyebrow="শিক্ষা"
        aside={<HeaderFrame tag="শিক্ষা প্রতিষ্ঠান" icon={GraduationCap} value={`${toBn(schools.length)}টি`} label="স্কুল, কলেজ ও মাদ্রাসা" />}
      >
        <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {facts.map((f) => (
            <Fact key={f.label} label={f.label} value={`${toBn(f.value)}টি`} />
          ))}
        </dl>
        <div className="mt-8">
          <Link href={`/contribute?kind=${encodeURIComponent("শিক্ষা ও ধর্মীয় প্রতিষ্ঠান")}`} className="c-btn c-btn--theme">
            প্রতিষ্ঠানের তথ্য বা ছবি পাঠান
          </Link>
        </div>
      </PageHeader>

      <Container className="py-14">
        {schools.length > 0 ? (
          <SchoolDirectory items={items} unions={unions} types={[...schoolTypeSchema.options]} />
        ) : (
          <p className="c-card p-8 text-center text-ink-600">শিক্ষা প্রতিষ্ঠানের তথ্য যুক্ত হচ্ছে। শিগগিরই এখানে দেখা যাবে।</p>
        )}
      </Container>
    </>
  );
}

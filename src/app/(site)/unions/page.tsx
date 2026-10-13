import type { Metadata } from "next";
import { UnionCard } from "@/components/cards";
import { Landmark } from "lucide-react";
import { Container, HeaderFrame, PageHeader } from "@/components/section";
import { toBn } from "@/lib/bn";
import { data } from "@/lib/data";

export const metadata: Metadata = {
  title: "১৩টি ইউনিয়ন",
  description: "নাসিরনগরের ১৩টি ইউনিয়নের ইতিহাস, আয়তন, জনসংখ্যা, গ্রাম, শিক্ষাপ্রতিষ্ঠান, বাজার ও দর্শনীয় স্থানের পরিচিতি।",
};

export default async function UnionsPage() {
  const db = await data();
  return (
    <>
      <PageHeader
        title="নাসিরনগরের ১৩টি ইউনিয়ন"
        intro="নাসিরনগরের ১৩টি ইউনিয়নের গ্রাম, অবস্থান, ইতিহাস, জনসংখ্যা ও গুরুত্বপূর্ণ স্থানের তথ্য এক জায়গায় দেখুন। পরিসংখ্যানের প্রকাশকাল সংশ্লিষ্ট পেজে উল্লেখ আছে।"
        crumbs={[{ label: "ইউনিয়ন" }]}
        theme="unions"
        eyebrow="নাসিরনগর উপজেলা"
        aside={<HeaderFrame tag="ইউনিয়ন" icon={Landmark} value={toBn(db.getUnions().length)} label="ইউনিয়ন মিলে নাসিরনগর উপজেলা" />}
      />
      <Container className="py-14">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {db.getUnions().map((u) => (
            <UnionCard
              key={u.slug}
              union={u}
              villageCount={db.villagesOfUnion(u.slug).length}
              placeCount={db.placesOfUnion(u.slug).length}
            />
          ))}
        </div>
      </Container>
    </>
  );
}

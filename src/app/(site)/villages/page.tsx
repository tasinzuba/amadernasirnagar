import type { Metadata } from "next";
import { Suspense } from "react";
import { Home } from "lucide-react";
import { Container, HeaderFrame, PageHeader } from "@/components/section";
import { VillageSearch, type VillageListItem } from "@/components/village-search";
import { toBn } from "@/lib/bn";
import { data } from "@/lib/data";
import { coverFor } from "@/lib/images";

export const metadata: Metadata = {
  title: "সব গ্রাম",
  description: "নাসিরনগরের ১৩টি ইউনিয়নের গ্রামের পরিচিতি ও তালিকা। নাম বা ইউনিয়ন অনুযায়ী আপনার গ্রামের তথ্য খুঁজুন।",
};

export default async function VillagesPage() {
  const db = await data();
  const stats = db.getStats();
  const items: VillageListItem[] = db.getVillages().map((v) => ({
    slug: v.slug,
    name: v.name,
    nameEn: v.nameEn,
    union: v.union,
    unionName: db.unionName(v.union),
    status: v.status,
    tagline: v.tagline,
    cover: coverFor("villages", v.slug, v.cover),
  }));
  const unions = db.getUnions().map((u) => ({ slug: u.slug, name: u.name }));

  return (
    <>
      <PageHeader
        title="নাসিরনগরের সব গ্রাম"
        intro={`নাসিরনগরের ১৩টি ইউনিয়নের ${toBn(stats.villages)}টি গ্রামের পেজ এখানে রয়েছে। নাম লিখে অথবা ইউনিয়ন নির্বাচন করে নিজের গ্রাম খুঁজুন। কোনো তথ্য অনুপস্থিত থাকলে জানাতে পারেন।`}
        crumbs={[{ label: "গ্রাম" }]}
        theme="villages"
        eyebrow="১৩টি ইউনিয়নের গ্রাম"
        aside={<HeaderFrame tag="গ্রাম" icon={Home} value={toBn(stats.villages)} label="গ্রামের পেজ, ১৩টি ইউনিয়ন মিলিয়ে" />}
      />
      <Container className="py-10">
        <Suspense fallback={<p className="text-ink-600">তালিকা লোড হচ্ছে…</p>}>
          <VillageSearch villages={items} unions={unions} />
        </Suspense>
      </Container>
    </>
  );
}

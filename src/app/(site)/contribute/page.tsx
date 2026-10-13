import type { Metadata } from "next";
import { Suspense } from "react";
import { ContributeForm } from "@/components/contribute-form";
import { PenLine } from "lucide-react";
import { Block, Container, HeaderFrame, PageHeader } from "@/components/section";
import { toBn } from "@/lib/bn";
import { data } from "@/lib/data";

export const metadata: Metadata = {
  title: "তথ্য দিন",
  description: "নাসিরনগরের গ্রামের ইতিহাস, ঐতিহ্য, গুরুত্বপূর্ণ স্থাপনা, কৃতী ব্যক্তিত্ব ও সংস্কৃতির তথ্য জমা দিন।",
};

const wanted = [
  "গ্রামের নামকরণ ও ইতিহাস",
  "ঐতিহাসিক স্থাপনা, মসজিদ, মন্দির, হাওর ও দর্শনীয় স্থান",
  "কৃতী ব্যক্তিত্ব, মুক্তিযোদ্ধা, শিক্ষক, চিকিৎসক ও সমাজসেবক",
  "শিক্ষাপ্রতিষ্ঠান, উপাসনালয়, স্বাস্থ্যকেন্দ্র ও সংগঠনের পরিচিতি",
  "হাট-বাজার, স্থানীয় যোগাযোগ ও নৌঘাটের তথ্য",
  "উৎসব, মেলা ও সাংস্কৃতিক আয়োজন",
  "যাতায়াতপথ ও আনুমানিক ভাড়ার তথ্য",
  "নিজের তোলা বা অনুমতিপ্রাপ্ত ছবি",
];

export default async function ContributePage() {
  const db = await data();
  const unions = db.getUnions().map((u) => ({ slug: u.slug, name: u.name }));
  const stats = db.getStats();

  return (
    <>
      <PageHeader
        title="আপনার গ্রামের গুরুত্বপূর্ণ তথ্য জমা দিন"
        intro="গ্রামের ইতিহাস, ঐতিহ্য, স্থানীয় প্রতিষ্ঠান, পরিচিত ব্যক্তি বা গুরুত্বপূর্ণ কোনো তথ্য জানলে ফর্মে লিখে পাঠান। যাচাইয়ের পর প্রাসঙ্গিক তথ্য ওয়েবসাইটে প্রকাশ করা হবে।"
        crumbs={[{ label: "তথ্য দিন" }]}
        theme="contribute"
        eyebrow="আপনার তথ্য, আমাদের ঐতিহ্য"
        aside={
          <HeaderFrame
            tag="তথ্য দিন"
            icon={PenLine}
            value={`${toBn(stats.villages - stats.villagesWithInfo)}টি`}
            label="গ্রামের বিস্তারিত তথ্য এখনো যুক্ত হয়নি"
          />
        }
      />
      <Container className="py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <Block>
            <Suspense fallback={<p className="text-ink-600">ফর্ম লোড হচ্ছে…</p>}>
              <ContributeForm unions={unions} />
            </Suspense>
          </Block>

          <aside className="space-y-6">
            <Block title="যেসব বিষয়ে তথ্য দিতে পারেন">
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-700">
                {wanted.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </Block>
            <Block title="তথ্য দেওয়ার আগে জেনে নিন" className="border-accent-200 bg-accent-50">
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-700">
                <li>জীবিত কোনো ব্যক্তির ব্যক্তিগত তথ্য বা ছবি পাঠানোর আগে তাঁর অনুমতি নিন।</li>
                <li>অন্যের তোলা ছবি হলে ছবির উৎস ও ব্যবহার-অনুমতি উল্লেখ করুন।</li>
                <li>মৌখিকভাবে জানা তথ্যের ক্ষেত্রে সেটি উল্লেখ করুন। সম্ভব হলে বই, নথি বা নির্ভরযোগ্য সূত্র যোগ করুন।</li>
                <li>রাজনৈতিক প্রচার বা বিজ্ঞাপনধর্মী লেখা গ্রহণ করা হয় না।</li>
              </ul>
            </Block>
          </aside>
        </div>
      </Container>
    </>
  );
}

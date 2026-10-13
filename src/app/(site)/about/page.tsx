import type { Metadata } from "next";
import Link from "next/link";
import { Info } from "lucide-react";
import { Block, Container, HeaderFrame, PageHeader } from "@/components/section";
import { site } from "@/data/site";
import { toBn } from "@/lib/bn";
import { data, type Data } from "@/lib/data";
import { imageCredits } from "@/lib/images";

export const metadata: Metadata = {
  title: "ওয়েবসাইট সম্পর্কে",
  description: "নাসিরনগরের ইতিহাস, ঐতিহ্য ও গ্রামভিত্তিক তথ্য সংরক্ষণে আমাদের নাসিরনগর প্ল্যাটফর্মের উদ্দেশ্য ও উদ্যোগ।",
};

/** ছবির পথ থেকে কোন পেজের কোন ছবি, তার নাম */
function photoLabel(db: Data, src: string): string {
  const m = src.match(/^\/images\/(places|villages|people|events|news|schools)\/([^/.]+)(?:\/(cover|\d+))?/);
  if (!m) return src;
  const [, kind, slug, part] = m;
  const which = part === "cover" ? "মূল ছবি" : part ? `গ্যালারির ${toBn(part)} নম্বর ছবি` : "";
  const name =
    kind === "places"
      ? (db.getPlace(slug)?.name ?? slug)
      : kind === "villages"
        ? `${db.getVillage(slug)?.name ?? slug} গ্রাম`
        : kind === "people"
          ? (db.getPerson(slug)?.name ?? slug)
          : kind === "events"
            ? (db.getEvent(slug)?.title ?? slug)
            : kind === "schools"
              ? (db.getSchool(slug)?.name ?? slug)
              : (db.getNews(slug)?.title ?? slug);
  return which ? `${name}, ${which}` : name;
}

export default async function AboutPage() {
  const db = await data();
  const stats = db.getStats();
  return (
    <>
      <PageHeader
        title={`${site.name} সম্পর্কে`}
        intro="নাসিরনগরের প্রতিটি গ্রামের ইতিহাস, ঐতিহ্য ও গুরুত্বপূর্ণ তথ্য এক জায়গায় সংরক্ষণের সম্মিলিত উদ্যোগ।"
        crumbs={[{ label: "সম্পর্কে" }]}
        theme="about"
        eyebrow="আমাদের উদ্যোগ"
        aside={
          <HeaderFrame
            tag="সম্পর্কে"
            icon={Info}
            value={`${toBn(stats.villagesWithInfo)}/${toBn(stats.villages)}`}
            label="তথ্যসমৃদ্ধ গ্রামের পেজ"
          />
        }
      />
      <Container className="py-10">
        <div className="max-w-3xl space-y-6">
          <Block title="কেন এই উদ্যোগ">
            <p className="text-ink-700">নাসিরনগরের প্রতিটি গ্রামের নিজস্ব ইতিহাস, ঐতিহ্য, পরিচিত মানুষ ও গুরুত্বপূর্ণ স্থান রয়েছে। কিন্তু এসব তথ্যের অনেক কিছু এখনো এক জায়গায় সংরক্ষিত নয়। নতুন প্রজন্ম, প্রবাসী নাসিরনগরবাসী কিংবা আগ্রহী পাঠক যেন সহজে গ্রামের পরিচিতি জানতে পারেন, সেই উদ্দেশ্যেই আমাদের নাসিরনগর।</p>
          </Block>

          <Block title="এখন পর্যন্ত যা যুক্ত হয়েছে">
            <ul className="list-disc space-y-1 pl-5 text-ink-700">
              <li>{toBn(stats.unions)}টি ইউনিয়নের পরিচিতি, গ্রাম, প্রতিষ্ঠান, বাজার ও নদ-নদীর তথ্য</li>
              <li>{toBn(stats.villages)}টি গ্রামের পেজ; এর মধ্যে {toBn(stats.villagesWithInfo)}টির বিস্তারিত তথ্য যুক্ত হয়েছে</li>
              <li>{toBn(stats.places)}টি দর্শনীয় ও ঐতিহাসিক স্থানের পরিচিতি</li>
              <li>{toBn(stats.people)} জন কৃতী ব্যক্তিত্বের তথ্য</li>
              <li>{toBn(stats.events)}টি উৎসব ও আয়োজনের পরিচিতি এবং স্থানীয় ঘোষণা</li>
              <li>যাতায়াতের তথ্য, জরুরি যোগাযোগ ও মানচিত্র</li>
            </ul>
          </Block>

          <Block title="তথ্যের উৎস ও যাচাই">
            <p className="text-ink-700">প্রাথমিক তথ্য সংগ্রহ করা হয়েছে{" "}<a href="https://nasirnagar.brahmanbaria.gov.bd/" target="_blank" rel="noopener noreferrer" className="text-link">
                নাসিরনগর উপজেলা পোর্টাল
              </a>
              , বাংলা ও ইংরেজি উইকিপিডিয়া আর বাংলাদেশ পরিসংখ্যান ব্যুরোর আদমশুমারি (২০১১ ও ২০২২) থেকে। উপজেলার ইতিহাস আর
              ভূগোলের কথা আছে{" "}
              <Link href="/upazila" className="text-link">
                উপজেলা পরিচিতি
              </Link>{" "}পেজে। কিছু স্থানীয় তথ্যের যাচাই এখনো চলমান। কোনো ভুল বা অসম্পূর্ণ তথ্য চোখে পড়লে{" "}<Link href="/contribute" className="text-link">
                জানাবেন
              </Link>। মানচিত্রের কিছু চিহ্ন গ্রাম বা স্থানের সঠিক অবস্থানের পরিবর্তে ইউনিয়নের আনুমানিক কেন্দ্র নির্দেশ করে।</p>
          </Block>

          <Block title="আপনি কীভাবে অংশ নিতে পারেন">
            <ol className="list-decimal space-y-1.5 pl-5 text-ink-700">
              <li>
                <Link href="/villages" className="text-link">
                  গ্রামের তালিকা
                </Link>{" "}থেকে আপনার গ্রামের পরিচিতি দেখুন।</li>
              <li>প্রয়োজনীয় ইতিহাস, তথ্যসূত্র ও ছবি ফর্মের মাধ্যমে পাঠান।</li>
              <li>যাচাই করে উপযুক্ত তথ্য ওয়েবসাইটে প্রকাশ করা হবে; সম্মতি থাকলে অবদানকারীর নাম উল্লেখ করা হবে।</li>
            </ol>
          </Block>

          <Block id="photo-credits" title="ছবির কৃতজ্ঞতা">
            <p className="text-ink-700">
              এই সাইটের অনেক ছবি উইকিমিডিয়া কমন্স থেকে নেওয়া, যেখানে আলোকচিত্রীরা মুক্ত লাইসেন্সে ছবি প্রকাশ করেন। লাইসেন্সের শর্ত মেনে
              প্রতিটা ছবির লেখক, লাইসেন্স আর উৎস নিচে দেওয়া হলো। সাইটে ছোট বা কেটে দেখানো ছবিগুলোও একই লাইসেন্সে থাকছে।
            </p>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-ink-600">
              {Object.entries(imageCredits()).map(([src, c]) => (
                <li key={src}>
                  <span className="font-semibold text-ink-900">{photoLabel(db, src)}:</span> {c.author},{" "}
                  {c.licenseUrl ? (
                    <a href={c.licenseUrl} target="_blank" rel="noopener noreferrer license" className="text-link">
                      {c.license}
                    </a>
                  ) : (
                    c.license
                  )}
                  ,{" "}
                  <a href={c.source} target="_blank" rel="noopener noreferrer" className="text-link">
                    {c.title}
                  </a>
                  {c.note && ` (${c.note})`}
                </li>
              ))}
            </ul>
          </Block>

          <Block title="যোগাযোগ">
            <p className="text-ink-700">যোগাযোগের ইমেইল ও সামাজিক যোগাযোগমাধ্যমের লিংক যাচাই করে এখানে যুক্ত করা হবে।</p>
          </Block>
        </div>
      </Container>
    </>
  );
}

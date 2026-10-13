import type { Metadata } from "next";
import { NewsCard } from "@/components/cards";
import { Newspaper } from "lucide-react";
import { Container, HeaderFrame, PageHeader } from "@/components/section";
import { toBn } from "@/lib/bn";
import { data } from "@/lib/data";
import { withNewsCover } from "@/lib/images";

export const metadata: Metadata = {
  title: "খবর ও ঘোষণা",
  description: "নাসিরনগরের স্থানীয় খবর, গুরুত্বপূর্ণ ঘোষণা, উৎসব ও ওয়েবসাইটের হালনাগাদ তথ্য।",
};

export default async function NewsPage() {
  const db = await data();
  const allNews = db.getNewsList();
  const categories = [...new Set(allNews.map((n) => n.category))];

  return (
    <>
      <PageHeader
        title="খবর ও ঘোষণা"
        intro={`নাসিরনগরের স্থানীয় খবর, ঘোষণা ও উল্লেখযোগ্য আয়োজন এখানে প্রকাশ করা হয়। বর্তমানে ${toBn(allNews.length)}টি খবর রয়েছে। নতুন তথ্য জানাতে চাইলে আমাদের পাঠান।`}
        crumbs={[{ label: "খবর" }]}
        theme="news"
        eyebrow="এলাকার খবর"
        aside={<HeaderFrame tag="খবর" icon={Newspaper} value={toBn(allNews.length)} label="খবর আর ঘোষণা" />}
      >
        <p className="mt-5 flex flex-wrap items-center gap-2 text-sm text-ink-600">
          <span className="font-semibold">বিভাগ:</span>
          {categories.map((c) => (
            <span key={c} className="c-chip">
              {c}
            </span>
          ))}
        </p>
      </PageHeader>
      <Container className="py-14">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {allNews.map(withNewsCover).map((post) => (
            <NewsCard key={post.slug} post={post} />
          ))}
        </div>
      </Container>
    </>
  );
}

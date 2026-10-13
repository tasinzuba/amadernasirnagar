import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CoverImage } from "@/components/cover-image";
import { Newspaper } from "lucide-react";
import { Block, Container, HeaderFrame, PageHeader } from "@/components/section";
import { formatDateBn } from "@/lib/bn";
import { data } from "@/lib/data";
import { creditFor, withNewsCover } from "@/lib/images";
import { PhotoCredit } from "@/components/photo-credit";

type Params = Promise<{ slug: string }>;

export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const db = await data();
  return db.getNewsList().map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const db = await data();
  const { slug } = await params;
  const post = db.getNews(slug);
  if (!post) return { title: "খবরটি পাওয়া যায়নি" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: "article", publishedTime: post.date },
  };
}

export default async function NewsPostPage({ params }: { params: Params }) {
  const db = await data();
  const { slug } = await params;
  const found = db.getNews(slug);
  if (!found) notFound();
  const post = withNewsCover(found);
  const others = db.getNewsList()
    .filter((n) => n.slug !== post.slug)
    .slice(0, 5);

  // ফ্রেমে বড় করে দিন-মাস, নিচে সাল
  const date = formatDateBn(post.date);
  const cut = date.lastIndexOf(" ");
  const dayMonth = cut > 0 ? date.slice(0, cut) : date;
  const year = cut > 0 ? date.slice(cut + 1) : "";
  return (
    <>
      <PageHeader
        title={post.title}
        intro={post.excerpt}
        theme="news"
        eyebrow={
          <>
            <time dateTime={post.date}>{formatDateBn(post.date)}</time>, {post.category}
          </>
        }
        crumbs={[{ label: "খবর", href: "/news" }, { label: post.title }]}
        aside={
          post.cover ? (
            <HeaderFrame tag={post.category} image={post.cover} imageAlt={post.title} credit={creditFor(post.cover)} />
          ) : (
            <HeaderFrame tag={post.category} icon={Newspaper} value={dayMonth} label={year ? `${year} সালে প্রকাশিত` : undefined} />
          )
        }
      />

      <Container className="py-8 sm:py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <article>
            {post.cover && (
              <div className="mb-8 lg:hidden">
                <CoverImage
                  src={post.cover}
                  alt={post.title}
                  seed={post.slug}
                  className="relative aspect-[21/9] rounded-xl"
                  sizes="100vw"
                  priority
                />
                <PhotoCredit credit={creditFor(post.cover)} className="mt-2" />
              </div>
            )}
            <div className="max-w-[68ch] space-y-5 text-[1.0625rem] leading-[1.9] text-ink-700">
              {post.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>

          <aside className="space-y-6">
            {others.length > 0 && (
              <Block title="আরও খবর">
                <ul className="divide-y divide-ink-100">
                  {others.map((n) => (
                    <li key={n.slug} className="py-3">
                      <Link href={`/news/${n.slug}`} className="font-semibold text-ink-900 hover:text-brand-600">
                        {n.title}
                      </Link>
                      <p className="text-xs text-ink-300">
                        <time dateTime={n.date}>{formatDateBn(n.date)}</time>, {n.category}
                      </p>
                    </li>
                  ))}
                </ul>
              </Block>
            )}
            <Block className="border-brand-200 bg-brand-50">
              <h2 className="font-display text-[1.6rem] font-bold leading-tight text-brand-900">খবর পাঠান</h2>
              <p className="mt-1 text-sm text-ink-600">স্থানীয় কোনো গুরুত্বপূর্ণ ঘোষণা, আয়োজন বা তথ্য জানাতে পারেন।</p>
              <Link href="/contribute" className="c-btn c-btn--solid mt-4">
                তথ্য দিন
              </Link>
            </Block>
          </aside>
        </div>
      </Container>
    </>
  );
}

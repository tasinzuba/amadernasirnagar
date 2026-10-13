import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-shell";
import { NewsForm } from "@/components/admin/item-forms";
import { data } from "@/lib/data";
import { withNewsCover } from "@/lib/images";

export default async function AdminNewsEditPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const db = await data();
  const { slug } = await params;
  const sp = await searchParams;
  const isNew = slug === "new";
  // ফোল্ডার থেকে খুঁজে পাওয়া ছবিসহ, যাতে সাইটে যা দেখায় ফর্মেও তা-ই দেখা যায়
  const post = isNew ? null : withNewsCover(db.getNews(slug) ?? notFound());
  return (
    <>
      <AdminHeader title={post ? post.title : "নতুন খবর"} intro={post ? `/news/${post.slug}` : undefined}>
        <Link href="/admin/news" className="c-btn c-btn--outline">
          ← তালিকা
        </Link>
      </AdminHeader>
      {sp.created === "1" && <p className="mb-4 rounded-xl bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-800">তৈরি হয়েছে।</p>}
      <NewsForm post={post} isNew={isNew} />
    </>
  );
}

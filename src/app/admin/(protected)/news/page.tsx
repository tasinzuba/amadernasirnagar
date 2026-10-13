import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-shell";
import { formatDateBn, toBn } from "@/lib/bn";
import { data } from "@/lib/data";

export default async function AdminNewsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const db = await data();
  const sp = await searchParams;
  const news = db.getNewsList();
  return (
    <>
      <AdminHeader title="খবর ও ঘোষণা" intro={`${toBn(news.length)}টি খবর; নতুনটি তারিখ অনুযায়ী আগে দেখায়।`}>
        <Link href="/admin/news/new" className="c-btn c-btn--solid">
          + নতুন খবর
        </Link>
      </AdminHeader>
      {sp.deleted === "1" && <p className="mb-4 rounded-xl bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-800">মুছে ফেলা হয়েছে।</p>}
      <div className="c-card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink-50 text-xs text-ink-600">
            <tr>
              <th className="px-4 py-2 font-semibold">শিরোনাম</th>
              <th className="px-3 py-2 font-semibold">তারিখ</th>
              <th className="px-3 py-2 font-semibold">বিভাগ</th>
              <th className="px-3 py-2 text-right font-semibold">কাজ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {news.map((n) => (
              <tr key={n.slug} className="hover:bg-ink-50/60">
                <td className="px-4 py-2">
                  <Link href={`/admin/news/${n.slug}`} className="font-semibold text-ink-900 hover:text-brand-600">
                    {n.title}
                  </Link>
                </td>
                <td className="px-3 py-2 text-ink-600">{formatDateBn(n.date)}</td>
                <td className="px-3 py-2 text-ink-600">{n.category}</td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <Link href={`/admin/news/${n.slug}`} className="font-semibold text-brand-600 hover:underline">
                    এডিট
                  </Link>
                  <span className="mx-2 text-ink-200">|</span>
                  <a href={`/news/${n.slug}`} target="_blank" rel="noopener noreferrer" className="text-ink-600 hover:underline">
                    দেখুন ↗
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

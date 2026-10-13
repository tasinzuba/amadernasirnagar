import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-shell";
import { StatusBadge } from "@/components/status-badge";
import { refreshSiteAction } from "@/lib/admin/actions";
import { listSubmissions } from "@/lib/admin/submissions";
import { toBn } from "@/lib/bn";
import { data } from "@/lib/data";
import { hasDatabase } from "@/lib/db";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminDashboard({ searchParams }: { searchParams: SearchParams }) {
  const db = await data();
  const sp = await searchParams;
  const stats = db.getStats();
  const unions = db.getUnions();
  const villages = db.getVillages();
  const submissions = await listSubmissions();
  const percent = stats.villages ? Math.round((stats.villagesWithInfo / stats.villages) * 100) : 0;
  const stubCount = stats.villages - stats.villagesWithInfo;

  const perUnion = unions.map((u) => {
    const list = villages.filter((v) => v.union === u.slug);
    return {
      union: u,
      total: list.length,
      complete: list.filter((v) => v.status === "complete").length,
      partial: list.filter((v) => v.status === "partial").length,
      stub: list.filter((v) => v.status === "stub").length,
    };
  });
  const nextUp = villages.filter((v) => v.status === "stub").slice(0, 12);

  const tiles = [
    { label: "মোট গ্রাম", value: stats.villages, href: "/admin/villages" },
    { label: "পূর্ণাঙ্গ", value: stats.villagesComplete, href: "/admin/villages?status=complete" },
    { label: "আংশিক", value: stats.villagesWithInfo - stats.villagesComplete, href: "/admin/villages?status=partial" },
    { label: "তথ্য নেই", value: stubCount, href: "/admin/villages?status=stub" },
    { label: "দর্শনীয় স্থান", value: stats.places, href: "/admin/places" },
    { label: "বিশিষ্ট ব্যক্তি", value: stats.people, href: "/admin/people" },
    { label: "শিক্ষা প্রতিষ্ঠান", value: stats.schools, href: "/admin/schools" },
    { label: "খবর", value: stats.news, href: "/admin/news" },
    { label: "জমা পড়া তথ্য", value: submissions.length, href: "/admin/submissions" },
  ];

  return (
    <>
      <AdminHeader title="ড্যাশবোর্ড" intro="গ্রামগুলো একটা একটা করে পূর্ণ করুন; সেভ করলেই সাইটে দেখা যাবে।">
        {hasDatabase() && (
          <form action={refreshSiteAction}>
            <button
              type="submit"
              className="c-btn c-btn--outline"
              title="স্ক্রিপ্ট দিয়ে বা সরাসরি ডেটাবেসে কিছু বদলালে সাইটে সঙ্গে সঙ্গে দেখাতে চাপুন। অ্যাডমিন থেকে সেভ করলে এটা লাগে না।"
            >
              সাইট রিফ্রেশ
            </button>
          </form>
        )}
        <Link href="/admin/villages/new" className="c-btn c-btn--solid">
          + নতুন গ্রাম
        </Link>
      </AdminHeader>
      {sp.refreshed === "1" && (
        <p className="mb-4 rounded-xl bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-800">
          সাইটের সব পেজ ডেটাবেসের সর্বশেষ তথ্য দিয়ে নতুন করে তৈরি হবে।
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="c-card p-4 transition-colors hover:border-brand-500">
            <p className="text-2xl font-bold text-ink-900">{toBn(t.value)}</p>
            <p className="text-sm text-ink-600">{t.label}</p>
          </Link>
        ))}
      </div>

      <div className="c-card mt-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-bold text-ink-900">অগ্রগতি: {toBn(stats.villagesWithInfo)} / {toBn(stats.villages)} গ্রামের তথ্য আছে</p>
          <p className="text-sm font-semibold text-brand-600">{toBn(percent)}%</p>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-ink-100">
          <div className="h-full rounded-full bg-brand-500" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="c-card overflow-hidden">
          <h2 className="border-b border-ink-100 px-5 py-3 font-bold text-ink-900">ইউনিয়ন অনুযায়ী</h2>
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-50 text-xs text-ink-600">
              <tr>
                <th className="px-5 py-2 font-semibold">ইউনিয়ন</th>
                <th className="px-3 py-2 font-semibold">গ্রাম</th>
                <th className="px-3 py-2 font-semibold">পূর্ণাঙ্গ</th>
                <th className="px-3 py-2 font-semibold">আংশিক</th>
                <th className="px-3 py-2 font-semibold">বাকি</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {perUnion.map((row) => (
                <tr key={row.union.slug}>
                  <td className="px-5 py-2">
                    <Link href={`/admin/villages?union=${row.union.slug}`} className="font-semibold text-brand-600 hover:underline">
                      {row.union.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{toBn(row.total)}</td>
                  <td className="px-3 py-2">{toBn(row.complete)}</td>
                  <td className="px-3 py-2">{toBn(row.partial)}</td>
                  <td className="px-3 py-2">{toBn(row.stub)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="c-card p-5">
          <h2 className="font-bold text-ink-900">পরবর্তী কাজ</h2>
          <p className="mb-3 text-xs text-ink-300">যেসব গ্রামের এখনো কোনো তথ্য নেই</p>
          <ul className="divide-y divide-ink-100">
            {nextUp.map((v) => (
              <li key={v.slug} className="flex items-center justify-between gap-2 py-2 text-sm">
                <Link href={`/admin/villages/${v.slug}`} className="font-semibold text-ink-900 hover:text-brand-600">
                  {v.name}
                </Link>
                <StatusBadge status={v.status} />
              </li>
            ))}
            {nextUp.length === 0 && <li className="py-2 text-sm text-ink-600">সব গ্রামের তথ্য আছে!</li>}
          </ul>
        </section>
      </div>
    </>
  );
}

import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-shell";
import { toBn } from "@/lib/bn";
import { data } from "@/lib/data";

export default async function AdminPeoplePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const db = await data();
  const sp = await searchParams;
  const people = db.getPeople();
  return (
    <>
      <AdminHeader title="বিশিষ্ট ব্যক্তি" intro={`${toBn(people.length)} জন। জীবিত ব্যক্তির তথ্য যোগ করার আগে অনুমতি নিন।`}>
        <Link href="/admin/people/new" className="c-btn c-btn--solid">
          + নতুন ব্যক্তি
        </Link>
      </AdminHeader>
      {sp.deleted === "1" && <p className="mb-4 rounded-xl bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-800">মুছে ফেলা হয়েছে।</p>}
      <div className="c-card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink-50 text-xs text-ink-600">
            <tr>
              <th className="px-4 py-2 font-semibold">নাম</th>
              <th className="px-3 py-2 font-semibold">শ্রেণি</th>
              <th className="px-3 py-2 font-semibold">এলাকা</th>
              <th className="px-3 py-2 font-semibold">ছবি</th>
              <th className="px-3 py-2 text-right font-semibold">কাজ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {people.map((p) => (
              <tr key={p.slug} className="hover:bg-ink-50/60">
                <td className="px-4 py-2">
                  <Link href={`/admin/people/${p.slug}`} className="font-semibold text-ink-900 hover:text-brand-600">
                    {p.name}
                  </Link>
                  {p.years && <span className="ml-2 text-xs text-ink-300">({p.years})</span>}
                </td>
                <td className="px-3 py-2 text-ink-600">{p.category}</td>
                <td className="px-3 py-2 text-ink-600">
                  {p.village ? `${db.getVillage(p.village)?.name ?? p.village}, ` : ""}
                  {p.union ? db.unionName(p.union) : "–"}
                </td>
                <td className="px-3 py-2 text-ink-600">{p.image ? "আছে" : ""}</td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <Link href={`/admin/people/${p.slug}`} className="font-semibold text-brand-600 hover:underline">
                    এডিট
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-shell";
import { toBn } from "@/lib/bn";
import { data } from "@/lib/data";

export default async function AdminUnionsPage() {
  const db = await data();
  const unions = db.getUnions();
  return (
    <>
      <AdminHeader title="ইউনিয়ন" intro="চেয়ারম্যান, পরিচয়, বাজার, প্রতিষ্ঠান ও অবস্থান এডিট করুন। ইউনিয়ন যোগ বা মোছা যায় না।" />
      <div className="c-card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink-50 text-xs text-ink-600">
            <tr>
              <th className="px-4 py-2 font-semibold">ইউনিয়ন</th>
              <th className="px-3 py-2 font-semibold">গ্রাম</th>
              <th className="px-3 py-2 font-semibold">চেয়ারম্যান</th>
              <th className="px-3 py-2 font-semibold">পোস্টকোড</th>
              <th className="px-3 py-2 text-right font-semibold">কাজ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {unions.map((u) => (
              <tr key={u.slug} className="hover:bg-ink-50/60">
                <td className="px-4 py-2">
                  <Link href={`/admin/unions/${u.slug}`} className="font-semibold text-ink-900 hover:text-brand-600">
                    {u.name}
                  </Link>
                  <span className="ml-2 text-xs text-ink-300">{u.nameEn}</span>
                </td>
                <td className="px-3 py-2 text-ink-600">{toBn(db.villagesOfUnion(u.slug).length)}</td>
                <td className="px-3 py-2 text-ink-600">{u.chairman ?? "–"}</td>
                <td className="px-3 py-2 text-ink-600">{u.postcode ? toBn(u.postcode) : "–"}</td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <Link href={`/admin/unions/${u.slug}`} className="font-semibold text-brand-600 hover:underline">
                    এডিট
                  </Link>
                  <span className="mx-2 text-ink-200">|</span>
                  <a href={`/unions/${u.slug}`} target="_blank" rel="noopener noreferrer" className="text-ink-600 hover:underline">
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

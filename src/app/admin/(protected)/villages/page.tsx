import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-shell";
import { StatusBadge } from "@/components/status-badge";
import { formatDateBn, toBn } from "@/lib/bn";
import { data } from "@/lib/data";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export default async function AdminVillagesPage({ searchParams }: { searchParams: SearchParams }) {
  const db = await data();
  const sp = await searchParams;
  const q = first(sp.q).trim().toLowerCase();
  const union = first(sp.union);
  const status = first(sp.status);
  const deleted = first(sp.deleted) === "1";

  const unions = db.getUnions();
  const villages = db.getVillages().filter((v) => {
    if (union && v.union !== union) return false;
    if (status && v.status !== status) return false;
    if (q && !(v.name.includes(q) || v.nameEn.toLowerCase().includes(q) || v.slug.includes(q))) return false;
    return true;
  });

  return (
    <>
      <AdminHeader title="গ্রাম" intro={`${toBn(villages.length)}টি গ্রাম দেখানো হচ্ছে`}>
        <Link href="/admin/villages/new" className="c-btn c-btn--solid">
          + নতুন গ্রাম
        </Link>
      </AdminHeader>

      {deleted && <p className="mb-4 rounded-xl bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-800">গ্রামটি মুছে ফেলা হয়েছে।</p>}

      <form method="get" className="c-card mb-4 grid gap-3 p-4 sm:grid-cols-[1fr_200px_180px_auto] sm:items-end">
        <div>
          <label htmlFor="q" className="c-label">
            খুঁজুন
          </label>
          <input id="q" name="q" defaultValue={first(sp.q)} placeholder="নাম, ইংরেজি নাম বা slug" className="c-input" />
        </div>
        <div>
          <label htmlFor="union" className="c-label">
            ইউনিয়ন
          </label>
          <select id="union" name="union" defaultValue={union} className="c-input">
            <option value="">সব</option>
            {unions.map((u) => (
              <option key={u.slug} value={u.slug}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status" className="c-label">
            অবস্থা
          </label>
          <select id="status" name="status" defaultValue={status} className="c-input">
            <option value="">সব</option>
            <option value="stub">তথ্য নেই</option>
            <option value="partial">আংশিক</option>
            <option value="complete">পূর্ণাঙ্গ</option>
          </select>
        </div>
        <button type="submit" className="c-btn c-btn--outline">
          ফিল্টার
        </button>
      </form>

      <div className="c-card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink-50 text-xs text-ink-600">
            <tr>
              <th className="px-4 py-2 font-semibold">গ্রাম</th>
              <th className="px-3 py-2 font-semibold">ইউনিয়ন</th>
              <th className="px-3 py-2 font-semibold">অবস্থা</th>
              <th className="px-3 py-2 font-semibold">হালনাগাদ</th>
              <th className="px-3 py-2 font-semibold">ছবি</th>
              <th className="px-3 py-2 text-right font-semibold">কাজ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {villages.map((v) => (
              <tr key={v.slug} className="hover:bg-ink-50/60">
                <td className="px-4 py-2">
                  <Link href={`/admin/villages/${v.slug}`} className="font-semibold text-ink-900 hover:text-brand-600">
                    {v.name}
                  </Link>
                  <span className="ml-2 font-mono text-xs text-ink-300">{v.slug}</span>
                </td>
                <td className="px-3 py-2 text-ink-600">{db.unionName(v.union)}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={v.status} />
                </td>
                <td className="px-3 py-2 text-ink-600">{v.updatedAt ? formatDateBn(v.updatedAt) : "–"}</td>
                <td className="px-3 py-2 text-ink-600">{v.cover ? "কভার" : ""}{v.images?.length ? ` +${toBn(v.images.length)}` : ""}</td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <Link href={`/admin/villages/${v.slug}`} className="font-semibold text-brand-600 hover:underline">
                    এডিট
                  </Link>
                  <span className="mx-2 text-ink-200">|</span>
                  <a href={`/villages/${v.slug}`} target="_blank" rel="noopener noreferrer" className="text-ink-600 hover:underline">
                    দেখুন ↗
                  </a>
                </td>
              </tr>
            ))}
            {villages.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink-600">
                  কিছু পাওয়া যায়নি
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

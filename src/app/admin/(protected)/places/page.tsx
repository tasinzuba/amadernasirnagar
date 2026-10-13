import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-shell";
import { PlaceTypeBadge } from "@/components/cards";
import { toBn } from "@/lib/bn";
import { data } from "@/lib/data";

export default async function AdminPlacesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const db = await data();
  const sp = await searchParams;
  const places = db.getPlaces();
  return (
    <>
      <AdminHeader title="দর্শনীয় স্থান" intro={`${toBn(places.length)}টি স্থান। গ্রামের পেজে দেখাতে হলে গ্রামের ফর্মে স্থানটি টিক দিন বা এখানে গ্রাম বাছাই করুন।`}>
        <Link href="/admin/places/new" className="c-btn c-btn--solid">
          + নতুন স্থান
        </Link>
      </AdminHeader>
      {sp.deleted === "1" && <p className="mb-4 rounded-xl bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-800">মুছে ফেলা হয়েছে।</p>}
      <div className="c-card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink-50 text-xs text-ink-600">
            <tr>
              <th className="px-4 py-2 font-semibold">স্থান</th>
              <th className="px-3 py-2 font-semibold">ধরন</th>
              <th className="px-3 py-2 font-semibold">অবস্থান</th>
              <th className="px-3 py-2 font-semibold">হোমপেজ</th>
              <th className="px-3 py-2 text-right font-semibold">কাজ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {places.map((p) => (
              <tr key={p.slug} className="hover:bg-ink-50/60">
                <td className="px-4 py-2">
                  <Link href={`/admin/places/${p.slug}`} className="font-semibold text-ink-900 hover:text-brand-600">
                    {p.name}
                  </Link>
                </td>
                <td className="px-3 py-2">
                  <PlaceTypeBadge type={p.type} />
                </td>
                <td className="px-3 py-2 text-ink-600">
                  {p.village ? `${db.getVillage(p.village)?.name ?? p.village}, ` : ""}
                  {db.unionName(p.union)}
                </td>
                <td className="px-3 py-2 text-ink-600">{p.featured ? "হ্যাঁ" : ""}</td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <Link href={`/admin/places/${p.slug}`} className="font-semibold text-brand-600 hover:underline">
                    এডিট
                  </Link>
                  <span className="mx-2 text-ink-200">|</span>
                  <a href={`/places/${p.slug}`} target="_blank" rel="noopener noreferrer" className="text-ink-600 hover:underline">
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

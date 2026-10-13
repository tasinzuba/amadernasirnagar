import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-shell";
import { SchoolTypeBadge } from "@/components/cards";
import { toBn } from "@/lib/bn";
import { data } from "@/lib/data";
import { coverFor } from "@/lib/images";
import { schoolTypeSchema } from "@/lib/schemas";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminSchoolsPage({ searchParams }: { searchParams: SearchParams }) {
  const db = await data();
  const sp = await searchParams;
  const union = typeof sp.union === "string" ? sp.union : "";
  const type = typeof sp.type === "string" ? sp.type : "";
  const all = db.getSchools();
  const schools = all.filter((s) => (!union || s.union === union) && (!type || s.type === type));
  const filterHref = (next: { union?: string; type?: string }) => {
    const p = new URLSearchParams();
    const u = next.union ?? union;
    const t = next.type ?? type;
    if (u) p.set("union", u);
    if (t) p.set("type", t);
    const q = p.toString();
    return `/admin/schools${q ? `?${q}` : ""}`;
  };
  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-sm font-semibold ${active ? "border-brand-500 bg-brand-500 text-white" : "border-ink-150 bg-white text-ink-700 hover:border-brand-500"}`;

  return (
    <>
      <AdminHeader
        title="শিক্ষা প্রতিষ্ঠান"
        intro={`${toBn(all.length)}টি স্কুল, কলেজ ও মাদ্রাসা। গ্রাম বাছাই করলে প্রতিষ্ঠানটি সেই গ্রামের পেজেও দেখায়।`}
      >
        <Link href="/admin/schools/new" className="c-btn c-btn--solid">
          + নতুন প্রতিষ্ঠান
        </Link>
      </AdminHeader>
      {sp.deleted === "1" && <p className="mb-4 rounded-xl bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-800">মুছে ফেলা হয়েছে।</p>}

      <div className="c-card mb-4 space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          <Link href={filterHref({ type: "" })} className={chip(!type)}>
            সব ধরন
          </Link>
          {schoolTypeSchema.options.map((t) => {
            const n = all.filter((s) => s.type === t && (!union || s.union === union)).length;
            return n > 0 ? (
              <Link key={t} href={filterHref({ type: t })} className={chip(type === t)}>
                {t} ({toBn(n)})
              </Link>
            ) : null;
          })}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={filterHref({ union: "" })} className={chip(!union)}>
            সব ইউনিয়ন
          </Link>
          {db.getUnions().map((u) => (
            <Link key={u.slug} href={filterHref({ union: u.slug })} className={chip(union === u.slug)}>
              {u.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="c-card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink-50 text-xs text-ink-600">
            <tr>
              <th className="px-4 py-2 font-semibold">প্রতিষ্ঠান</th>
              <th className="px-3 py-2 font-semibold">ধরন</th>
              <th className="px-3 py-2 font-semibold">অবস্থান</th>
              <th className="px-3 py-2 font-semibold">প্রতিষ্ঠা</th>
              <th className="px-3 py-2 font-semibold">ছবি</th>
              <th className="px-3 py-2 text-right font-semibold">কাজ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {schools.map((s) => (
              <tr key={s.slug} className="hover:bg-ink-50/60">
                <td className="px-4 py-2">
                  <Link href={`/admin/schools/${s.slug}`} className="font-semibold text-ink-900 hover:text-brand-600">
                    {s.name}
                  </Link>
                  {s.eiin && <span className="ml-2 text-xs text-ink-300">EIIN {s.eiin}</span>}
                </td>
                <td className="px-3 py-2">
                  <SchoolTypeBadge type={s.type} />
                </td>
                <td className="px-3 py-2 text-ink-600">
                  {s.village ? `${db.getVillage(s.village)?.name ?? s.village}, ` : ""}
                  {db.unionName(s.union)}
                </td>
                <td className="px-3 py-2 text-ink-600">{s.established ? toBn(s.established) : <span className="text-ink-300">–</span>}</td>
                <td className="px-3 py-2 text-ink-600">{coverFor("schools", s.slug, s.cover) ? "আছে" : ""}</td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <Link href={`/admin/schools/${s.slug}`} className="font-semibold text-brand-600 hover:underline">
                    এডিট
                  </Link>
                  <span className="mx-2 text-ink-200">|</span>
                  <a href={`/schools/${s.slug}`} target="_blank" rel="noopener noreferrer" className="text-ink-600 hover:underline">
                    দেখুন ↗
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {schools.length === 0 && <p className="p-6 text-center text-ink-600">এই বাছাইয়ে কোনো প্রতিষ্ঠান নেই।</p>}
      </div>
    </>
  );
}

import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-shell";
import { toBn } from "@/lib/bn";
import { data } from "@/lib/data";

export default async function AdminEventsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const db = await data();
  const sp = await searchParams;
  const events = db.getEvents();
  return (
    <>
      <AdminHeader title="উৎসব ও মেলা" intro={`${toBn(events.length)}টি বার্ষিক আয়োজন`}>
        <Link href="/admin/events/new" className="c-btn c-btn--solid">
          + নতুন আয়োজন
        </Link>
      </AdminHeader>
      {sp.deleted === "1" && <p className="mb-4 rounded-xl bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-800">মুছে ফেলা হয়েছে।</p>}
      <div className="c-card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink-50 text-xs text-ink-600">
            <tr>
              <th className="px-4 py-2 font-semibold">আয়োজন</th>
              <th className="px-3 py-2 font-semibold">ব্যাজ</th>
              <th className="px-3 py-2 font-semibold">কখন</th>
              <th className="px-3 py-2 font-semibold">কোথায়</th>
              <th className="px-3 py-2 text-right font-semibold">কাজ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {events.map((e) => (
              <tr key={e.slug} className="hover:bg-ink-50/60">
                <td className="px-4 py-2">
                  <Link href={`/admin/events/${e.slug}`} className="font-semibold text-ink-900 hover:text-brand-600">
                    {e.title}
                  </Link>
                </td>
                <td className="px-3 py-2 text-ink-600">{e.badge}</td>
                <td className="px-3 py-2 text-ink-600">{e.when}</td>
                <td className="px-3 py-2 text-ink-600">{e.place}</td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <Link href={`/admin/events/${e.slug}`} className="font-semibold text-brand-600 hover:underline">
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

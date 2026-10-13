import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-shell";
import { EventForm } from "@/components/admin/item-forms";
import { data } from "@/lib/data";
import { withEventCover } from "@/lib/images";

export default async function AdminEventEditPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const db = await data();
  const { slug } = await params;
  const sp = await searchParams;
  const isNew = slug === "new";
  // ফোল্ডার থেকে খুঁজে পাওয়া ছবিসহ, যাতে সাইটে যা দেখায় ফর্মেও তা-ই দেখা যায়
  const event = isNew ? null : withEventCover(db.getEvent(slug) ?? notFound());
  const unions = db.getUnions().map((u) => ({ slug: u.slug, name: u.name, lat: u.lat, lng: u.lng }));
  const villages = db.getVillages().map((v) => ({ slug: v.slug, name: v.name, union: v.union }));
  return (
    <>
      <AdminHeader title={event ? event.title : "নতুন আয়োজন"}>
        <Link href="/admin/events" className="c-btn c-btn--outline">
          ← তালিকা
        </Link>
      </AdminHeader>
      {sp.created === "1" && <p className="mb-4 rounded-xl bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-800">তৈরি হয়েছে।</p>}
      <EventForm event={event} isNew={isNew} unions={unions} villages={villages} />
    </>
  );
}

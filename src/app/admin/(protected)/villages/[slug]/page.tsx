import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-shell";
import { VillageForm } from "@/components/admin/village-form";
import { data } from "@/lib/data";
import { withVillageImages } from "@/lib/images";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminVillageEditPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const db = await data();
  const { slug } = await params;
  const sp = await searchParams;
  const isNew = slug === "new";
  // ফোল্ডার থেকে খুঁজে পাওয়া ছবিসহ, যাতে সাইটে যা দেখায় ফর্মেও তা-ই দেখা যায়
  const village = isNew ? null : withVillageImages(db.getVillage(slug) ?? notFound());

  const unions = db.getUnions().map((u) => ({ slug: u.slug, name: u.name, lat: u.lat, lng: u.lng }));
  const places = db.getPlaces().map((p) => ({ slug: p.slug, name: p.name, union: p.union, type: p.type }));
  const people = db.getPeople().map((p) => ({ slug: p.slug, name: p.name, category: p.category }));

  return (
    <>
      <AdminHeader
        title={village ? `${village.name} গ্রাম` : "নতুন গ্রাম"}
        intro={village ? `${db.unionName(village.union)} ইউনিয়ন · /villages/${village.slug}` : "নাম, ইউনিয়ন ও slug দিয়ে তৈরি করুন; বাকি তথ্য পরে যোগ করা যাবে।"}
      >
        <Link href="/admin/villages" className="c-btn c-btn--outline">
          ← গ্রামের তালিকা
        </Link>
      </AdminHeader>
      {sp.created === "1" && (
        <p className="mb-4 rounded-xl bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-800">
          গ্রামটি তৈরি হয়েছে। এখন বাকি তথ্য ও ছবি যোগ করুন; ডানে প্রিভিউ দেখা যাবে।
        </p>
      )}
      <VillageForm village={village} isNew={isNew} unions={unions} places={places} people={people} />
    </>
  );
}

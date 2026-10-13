import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-shell";
import { SchoolForm } from "@/components/admin/school-form";
import { data } from "@/lib/data";
import { withSchoolImages } from "@/lib/images";

export default async function AdminSchoolEditPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const db = await data();
  const { slug } = await params;
  const sp = await searchParams;
  const isNew = slug === "new";
  // ফোল্ডার থেকে খুঁজে পাওয়া ছবিসহ, যাতে সাইটে যা দেখায় ফর্মেও তা-ই দেখা যায়
  const school = isNew ? null : withSchoolImages(db.getSchool(slug) ?? notFound());
  const unions = db.getUnions().map((u) => ({ slug: u.slug, name: u.name, lat: u.lat, lng: u.lng }));
  const villages = db.getVillages().map((v) => ({ slug: v.slug, name: v.name, union: v.union }));
  return (
    <>
      <AdminHeader title={school ? school.name : "নতুন শিক্ষা প্রতিষ্ঠান"} intro={school ? `/schools/${school.slug}` : "নাম, ধরন, ইউনিয়ন ও slug দিয়ে তৈরি করুন; বাকি তথ্য ও ছবি পরে যোগ করা যাবে।"}>
        <Link href="/admin/schools" className="c-btn c-btn--outline">
          ← তালিকা
        </Link>
      </AdminHeader>
      {sp.created === "1" && <p className="mb-4 rounded-xl bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-800">তৈরি হয়েছে। এখন ছবি ও বিস্তারিত যোগ করুন।</p>}
      <SchoolForm school={school} isNew={isNew} unions={unions} villages={villages} />
    </>
  );
}

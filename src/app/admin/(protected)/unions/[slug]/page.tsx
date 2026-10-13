import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-shell";
import { UnionForm } from "@/components/admin/item-forms";
import { data } from "@/lib/data";

export default async function AdminUnionEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const db = await data();
  const { slug } = await params;
  const union = db.getUnion(slug) ?? notFound();
  return (
    <>
      <AdminHeader title={`${union.name} ইউনিয়ন`} intro={`/unions/${union.slug}`}>
        <Link href="/admin/unions" className="c-btn c-btn--outline">
          ← ইউনিয়নের তালিকা
        </Link>
      </AdminHeader>
      <UnionForm union={union} />
    </>
  );
}

import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-shell";
import { deleteSubmissionAction } from "@/lib/admin/actions";
import { listSubmissions } from "@/lib/admin/submissions";
import { toBn } from "@/lib/bn";
import { data } from "@/lib/data";

export default async function AdminSubmissionsPage() {
  const db = await data();
  const submissions = await listSubmissions();
  const villages = db.getVillages();
  return (
    <>
      <AdminHeader
        title="জমা পড়া তথ্য"
        intro={`সাইটের "তথ্য দিন" ফর্ম থেকে ${toBn(submissions.length)}টি জমা। যাচাই করে গ্রামের পেজে যোগ করুন, তারপর এখান থেকে মুছে ফেলুন।`}
      />
      {submissions.length === 0 && <p className="c-card p-6 text-center text-ink-600">এখনো কিছু জমা পড়েনি।</p>}
      <div className="grid grid-cols-1 gap-4">
        {submissions.map((s) => {
          const matched = villages.find((v) => v.name === s.village.trim());
          return (
            <article key={s.id} className="c-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-ink-900">
                    {s.village || "গ্রামের নাম নেই"}
                    {s.union && <span className="ml-2 text-sm font-normal text-ink-600">{db.unionName(s.union)} ইউনিয়ন</span>}
                  </p>
                  <p className="text-xs text-ink-300">
                    {s.kind} · {s.name} {s.contact && `· ${s.contact}`} · {s.submittedAt.slice(0, 10)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {matched && (
                    <Link href={`/admin/villages/${matched.slug}`} className="c-btn c-btn--outline">
                      গ্রামের পেজ এডিট
                    </Link>
                  )}
                  <form action={deleteSubmissionAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <button type="submit" className="c-btn border-danger-500/60 text-danger-600 hover:bg-danger-50">
                      মুছুন
                    </button>
                  </form>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-ink-700">{s.details}</p>
              {s.links && <p className="mt-2 whitespace-pre-wrap text-xs text-brand-600">{s.links}</p>}
            </article>
          );
        })}
      </div>
    </>
  );
}

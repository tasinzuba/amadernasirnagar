import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Container, HeaderFrame, PageHeader } from "@/components/section";
import { toBn } from "@/lib/bn";
import { data } from "@/lib/data";
import { creditFor, withEventCover } from "@/lib/images";
import { PhotoCredit } from "@/components/photo-credit";

export const metadata: Metadata = {
  title: "উৎসব ও মেলা",
  description: "নাসিরনগরের রথযাত্রা, বৈশাখী মেলা, নৌকাবাইচ, পূজা, ওরস ও লোকজ উৎসবের পরিচিতি।",
};

export default async function EventsPage() {
  const db = await data();
  const allEvents = db.getEvents().map(withEventCover);
  return (
    <>
      <PageHeader
        title="উৎসব ও মেলা"
        intro={`নাসিরনগরের ${toBn(allEvents.length)}টি ঐতিহ্যবাহী উৎসব ও আয়োজনের তথ্য এখানে রয়েছে। বর্তমান বছরের তারিখ, স্থান বা আয়োজনের হালনাগাদ তথ্য জানাতে পারেন।`}
        crumbs={[{ label: "উৎসব" }]}
        theme="events"
        eyebrow="সারা বছরের উৎসব"
        aside={<HeaderFrame tag="উৎসব" icon={CalendarDays} value={toBn(allEvents.length)} label="বার্ষিক উৎসব আর মেলা" />}
      />
      <Container className="py-10">
        <ol className="space-y-5">
          {allEvents.map((event) => {
            const village = event.village ? db.getVillage(event.village) : undefined;
            const union = event.union ? db.getUnion(event.union) : undefined;
            return (
              <li key={event.slug} id={event.slug} className="c-card scroll-mt-28 p-7 sm:p-10">
                <div className="flex flex-col gap-5 sm:flex-row">
                  <div className="flex h-20 w-24 shrink-0 flex-col items-center justify-center rounded-xl bg-accent-50 text-accent-800">
                    <span className="font-display text-[1.6rem] font-bold leading-none">{event.badge}</span>
                    <span className="mt-1 text-xs">প্রতি বছর</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-[1.9rem] font-bold leading-tight text-brand-900">{event.title}</h2>
                    <dl className="mt-2 grid gap-1 text-sm text-ink-600 sm:grid-cols-[auto_1fr] sm:gap-x-4">
                      <dt className="font-semibold text-ink-700">কখন</dt>
                      <dd>{event.when}</dd>
                      <dt className="font-semibold text-ink-700">কোথায়</dt>
                      <dd>
                        {event.place}
                        {(village || union) && (
                          <>
                            {", "}
                            {village ? (
                              <Link href={`/villages/${village.slug}`} className="text-link">
                                {village.name} গ্রাম
                              </Link>
                            ) : union ? (
                              <Link href={`/unions/${union.slug}`} className="text-link">
                                {union.name} ইউনিয়ন
                              </Link>
                            ) : null}
                          </>
                        )}
                      </dd>
                    </dl>
                    <p className="mt-3 text-ink-700">{event.description}</p>
                    {event.note && <p className="mt-2 text-sm text-accent-700">{event.note}</p>}
                    {event.cover && (
                      <figure className="mt-5 max-w-xl">
                        <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-ink-100">
                          <Image src={event.cover} alt={event.title} fill sizes="(min-width: 640px) 576px, 100vw" className="object-cover" />
                        </div>
                        <figcaption>
                          <PhotoCredit credit={creditFor(event.cover)} className="mt-2" />
                        </figcaption>
                      </figure>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="c-card mt-8 border-dashed p-6 text-center">
          <p className="font-bold text-ink-900">কোনো উৎসবের তথ্য বাদ পড়েছে?</p>
          <p className="mt-1 text-sm text-ink-600">আপনার এলাকার উৎসব, ধর্মীয় আয়োজন, মেলা বা সাংস্কৃতিক অনুষ্ঠানের তথ্য লিখে পাঠান।{" "}<Link href="/contribute" className="text-link">
              তথ্য দিন
            </Link>
          </p>
        </div>
      </Container>
    </>
  );
}

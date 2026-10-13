import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Landmark } from "lucide-react";
import { Block, Container, Fact, HeaderFrame, PageHeader } from "@/components/section";
import { heroImage } from "@/lib/images";
import { Timeline } from "@/components/timeline";
import { site } from "@/data/site";
import { upazila } from "@/data/upazila";
import { formatBn, formatDecimalBn, toBn } from "@/lib/bn";
import { data } from "@/lib/data";

export const metadata: Metadata = {
  title: "উপজেলা পরিচিতি",
  description:
    "নাসিরনগরের ভূগোল, ইতিহাস, নদ-নদী, হাওর, কৃষি, শিক্ষা, স্বাস্থ্যসেবা, ঐতিহ্য ও ১৩টি ইউনিয়নের পরিচিতি জানুন।",
};

/** সাইডবারের "আরও জানুন" */
const moreLinks = [
  { href: "/unions", label: "১৩টি ইউনিয়ন ও গ্রামের পরিচিতি" },
  { href: "/places", label: "নাসিরনগরের দর্শনীয় স্থান" },
  { href: "#history", label: "ইতিহাস ও ঐতিহ্য" },
  { href: "/people", label: "কৃতী ব্যক্তিত্ব" },
  { href: "/transport", label: "যাতায়াত ও মানচিত্র" },
  { href: "/emergency", label: "জরুরি যোগাযোগ" },
];

const prose = "space-y-3 text-ink-700";
const bullets = "mt-2 list-disc space-y-1 pl-5 text-ink-700";
const listTitle = "mt-4 font-bold text-ink-900";

function MoreButton({ href, label, solid = false }: { href: string; label: string; solid?: boolean }) {
  return (
    <Link href={href} className={`c-btn ${solid ? "c-btn--solid" : "c-btn--outline"}`}>
      {label}
      <ArrowRight className="h-5 w-5" aria-hidden="true" />
    </Link>
  );
}

/** তথ্য-টাইলের মানের নিচে ছোট টীকা */
function Note({ children }: { children: string }) {
  return <span className="mt-1 block text-[0.85rem] font-normal leading-snug text-white/60">{children}</span>;
}

export default async function UpazilaPage() {
  const db = await data();
  const hero = heroImage();
  const p = upazila.profile;
  const unionMap = new Map(db.getUnions().map((u) => [u.slug, u]));
  const unions = p.unions.order.map((slug) => unionMap.get(slug)).filter((u) => u !== undefined);
  return (
    <>
      <PageHeader
        title="নাসিরনগর উপজেলা পরিচিতি"
        crumbs={[{ label: "উপজেলা পরিচিতি" }]}
        theme="upazila"
        eyebrow="ব্রাহ্মণবাড়িয়া জেলা | চট্টগ্রাম বিভাগ"
        aside={
          hero ? (
            <HeaderFrame tag="নাসিরনগর" image={hero} imageAlt="নাসিরনগরের হাওরে সূর্যাস্ত" />
          ) : (
            <HeaderFrame tag="নাসিরনগর" icon={Landmark} value={formatDecimalBn(site.upazila.areaKm2)} label="বর্গকিলোমিটার" />
          )
        }
      >
        <p className="mt-6 text-[1.5rem] font-bold leading-snug text-white sm:text-[1.8rem]">{p.tagline}</p>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-white/75 sm:text-xl">{p.intro}</p>

        <h2 className="mt-10 text-[1.05rem] font-bold text-[var(--theme-accent)]">এক নজরে নাসিরনগর</h2>
        <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Fact label="আয়তন" value={`${formatDecimalBn(site.upazila.areaKm2)} বর্গকিলোমিটার`} />
          <Fact label="জনসংখ্যা (২০২২)" value={`${formatBn(site.upazila.population2022)} জন`} />
          <Fact label="ইউনিয়ন" value={`${toBn(site.upazila.unions)}টি`} />
          <Fact
            label="গ্রাম"
            value={
              <>
                {toBn(site.upazila.villagesOfficial)}টি<Note>(পুরোনো প্রশাসনিক তালিকা অনুযায়ী)</Note>
              </>
            }
          />
          <Fact
            label="মৌজা"
            value={
              <>
                {toBn(site.upazila.mouzas)}টি<Note>(পুরোনো প্রশাসনিক তালিকা অনুযায়ী)</Note>
              </>
            }
          />
          <Fact label="সাক্ষরতার হার (২০২২)" value={`${formatDecimalBn(site.upazila.literacy2022)}%`} />
          <Fact label="উপজেলা প্রতিষ্ঠা" value="১ আগস্ট ১৯৮৩" />
          <Fact label="জেলা সদর থেকে দূরত্ব" value={`প্রায় ${toBn(site.upazila.distanceFromDistrictKm)} কিলোমিটার`} />
        </dl>
      </PageHeader>

      <Container className="py-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0 space-y-6">
            <Block id="location" title="নাসিরনগর কোথায় অবস্থিত?">
              <p className="text-ink-700">{p.location.intro}</p>
              <p className={listTitle}>চারপাশের অবস্থান:</p>
              <ul className="mt-2 space-y-1.5 text-ink-700">
                {p.location.borders.map((b) => (
                  <li key={b.dir}>
                    <span className="font-bold text-ink-900">{b.dir}:</span> {b.text}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-ink-700">{p.location.outro}</p>
            </Block>

            <Block id="history" title="নাসিরনগরের ইতিহাস">
              <div className={prose}>
                {p.history.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
              <h3 className="mt-6 text-[1.25rem] font-bold text-ink-900">নাসিরনগর নামকরণের ইতিহাস</h3>
              <div className={`mt-2 ${prose}`}>
                {p.nameOrigin.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
            </Block>

            <Block id="timeline" title="ইতিহাসের গুরুত্বপূর্ণ সময়কাল">
              <Timeline vertical />
            </Block>

            <Block id="rivers" title="নাসিরনগরের নদ-নদী">
              <p className="text-ink-700">{p.rivers.intro}</p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-ink-50 text-ink-600">
                    <tr>
                      <th className="px-3 py-2 font-semibold">নদীর নাম</th>
                      <th className="px-3 py-2 font-semibold">সংক্ষিপ্ত পরিচিতি</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100 text-ink-700">
                    {p.rivers.items.map((r) => (
                      <tr key={r.name}>
                        <td className="whitespace-nowrap px-3 py-2 font-semibold">{r.name}</td>
                        <td className="px-3 py-2">{r.about}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-ink-700">{p.rivers.outro}</p>
            </Block>

            <Block id="haor" title="হাওর ও প্রাকৃতিক সৌন্দর্য">
              <div className={prose}>
                {p.haor.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
            </Block>

            <Block id="livelihood" title="কৃষি ও মানুষের জীবিকা">
              <div className={prose}>
                {p.livelihood.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
            </Block>

            <Block id="education" title="শিক্ষা ও সাক্ষরতা">
              <div className={prose}>
                {p.education.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
            </Block>

            <Block id="health" title="চিকিৎসা ও স্বাস্থ্যসেবা">
              <p className="text-ink-700">{p.healthcare.intro}</p>
              <p className={listTitle}>{p.healthcare.listTitle}</p>
              <ul className={bullets}>
                {p.healthcare.services.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <p className="mt-4 text-ink-700">{p.healthcare.outro}</p>
              <div className="mt-5">
                <MoreButton href="/emergency" label="জরুরি স্বাস্থ্যসেবা ও যোগাযোগ" />
              </div>
            </Block>

            <Block id="culture" title="খেলাধুলা ও গ্রামীণ সংস্কৃতি">
              <div className={prose}>
                {p.culture.paragraphs.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
              <p className={listTitle}>{p.culture.listTitle}</p>
              <ul className={bullets}>
                {p.culture.items.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <p className="mt-4 text-ink-700">{p.culture.outro}</p>
            </Block>

            <Block id="heritage" title="ঐতিহাসিক স্থাপনা ও দর্শনীয় স্থান">
              <div className={prose}>
                {p.heritage.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
              <div className="mt-5">
                <MoreButton href="/places" label="সব দর্শনীয় স্থান দেখুন" />
              </div>
            </Block>

            <Block id="unions" title="নাসিরনগরের ১৩টি ইউনিয়ন">
              <p className="text-ink-700">{p.unions.intro}</p>
              <ol className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
                {unions.map((u, i) => (
                  <li key={u.slug} className="text-ink-700">
                    <span className="text-ink-400">{toBn(i + 1)}.</span>{" "}
                    <Link href={`/unions/${u.slug}`} className="text-link">
                      {u.name}
                    </Link>
                  </li>
                ))}
              </ol>
              <div className="mt-5">
                <MoreButton href="/unions" label="ইউনিয়ন ও গ্রামের তথ্য দেখুন" />
              </div>
            </Block>

            <Block id="initiative" title="নাসিরনগরের পরিচয় সংরক্ষণে আমাদের উদ্যোগ">
              <div className={prose}>
                {p.initiative.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <MoreButton href="/villages" label="নিজের গ্রামের তথ্য খুঁজুন" solid />
                <MoreButton href="/contribute" label="তথ্য জমা দিন" />
              </div>
            </Block>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <Block title="আরও জানুন">
              <ul className="space-y-2 text-sm">
                {moreLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-link">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Block>

            <Block title="তথ্যের উৎস" className="border-ink-150 bg-ink-50">
              <p className="text-sm text-ink-600">
                <a href={upazila.source.url} target="_blank" rel="noopener noreferrer" className="text-link">
                  উপজেলা প্রশাসন
                </a>
                , বাংলাদেশ পরিসংখ্যান ব্যুরো, সরকারি প্রকাশনা ও স্থানীয় তথ্যসূত্রের ভিত্তিতে এই পরিচিতি প্রস্তুত করা হয়েছে। তথ্যের পরিবর্তন বা
                সংশোধন প্রয়োজন হলে{" "}
                <Link href="/contribute" className="text-link">
                  আমাদের জানাতে পারেন
                </Link>
                ।
              </p>
            </Block>
          </aside>
        </div>
      </Container>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Bus } from "lucide-react";
import { Block, Container, HeaderFrame, PageHeader } from "@/components/section";
import { transportGuide } from "@/data/transport";

export const metadata: Metadata = {
  title: "যাতায়াত গাইড",
  description: "নাসিরনগরের সড়ক, রেলসংযোগ ও নৌপথের তথ্য, স্থানীয় যানবাহন, আনুমানিক যাত্রাসময় ও প্রয়োজনীয় নির্দেশনা।",
};

export default function TransportPage() {
  return (
    <>
      <PageHeader
        title="নাসিরনগরে যাতায়াতের তথ্য"
        intro={transportGuide.intro}
        crumbs={[{ label: "যাতায়াত" }]}
        theme="transport"
        eyebrow="যাতায়াত গাইড"
        aside={
          <HeaderFrame
            tag="যাতায়াত"
            icon={Bus}
            value="৩–৪ ঘণ্টা"
            label="ঢাকা থেকে আনুমানিক সড়কপথের সময়"
          />
        }
      />

      <Container className="space-y-8 py-10">
        <section>
          <h2 className="font-display text-[2.4rem] font-bold leading-tight text-brand-900">কোথা থেকে আসছেন</h2>
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            {transportGuide.routes.map((r) => (
              <Block key={r.title}>
                <h3 className="font-display text-[1.6rem] font-bold leading-tight text-brand-900">{r.title}</h3>
                <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-ink-700">
                  {r.steps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
                {r.time && <p className="mt-3 text-sm font-semibold text-brand-700">সময় লাগে {r.time}</p>}
                {r.note && <p className="mt-1 text-sm text-ink-600">{r.note}</p>}
              </Block>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Block title="উপজেলার ভেতরে চলাচল">
            <ul className="space-y-3">
              {transportGuide.local.map((l) => (
                <li key={l.mode}>
                  <p className="font-bold text-ink-900">{l.mode}</p>
                  <p className="text-sm text-ink-600">{l.note}</p>
                </li>
              ))}
            </ul>
          </Block>
          <Block title="বর্ষায় নৌকায়" className="border-brand-200 bg-brand-50">
            <p className="text-ink-700">{transportGuide.monsoon}</p>
          </Block>
        </section>

        <Block title="আনুমানিক ভাড়া ও সময়">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink-50 text-ink-600">
                <tr>
                  <th className="px-3 py-2 font-semibold">পথ</th>
                  <th className="px-3 py-2 font-semibold">বাহন</th>
                  <th className="px-3 py-2 font-semibold">ভাড়া</th>
                  <th className="px-3 py-2 font-semibold">সময়</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {transportGuide.fares.map((f) => (
                  <tr key={`${f.route}-${f.mode}`}>
                    <td className="px-3 py-2">{f.route}</td>
                    <td className="px-3 py-2">{f.mode}</td>
                    <td className="px-3 py-2">{f.fare}</td>
                    <td className="px-3 py-2">{f.time ?? "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-ink-300">ভাড়া ও যাত্রার সময় পরিবর্তিত হতে পারে। হালনাগাদ তথ্য জানা থাকলে{" "}<Link href="/contribute" className="text-link">
              জানাবেন
            </Link>
            ।
          </p>
        </Block>

        <Block title="যাত্রার আগে যা জানা জরুরি">
          <ul className="list-disc space-y-1.5 pl-5 text-ink-700">
            {transportGuide.tips.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </Block>
      </Container>
    </>
  );
}

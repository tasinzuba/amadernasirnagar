import type { Metadata } from "next";
import Link from "next/link";
import { Phone } from "lucide-react";
import { Block, Container, HeaderFrame, PageHeader } from "@/components/section";
import { upazila } from "@/data/upazila";
import { toBn } from "@/lib/bn";
import { data } from "@/lib/data";
import type { EmergencyContact } from "@/lib/types";

export const metadata: Metadata = {
  title: "জরুরি নম্বর",
  description: "নাসিরনগরের জরুরি স্বাস্থ্যসেবা, থানা, জাতীয় হেল্পলাইন ও প্রয়োজনীয় যোগাযোগের তথ্য।",
};

function ContactList({ contacts }: { contacts: EmergencyContact[] }) {
  return (
    <ul className="divide-y divide-ink-100">
      {contacts.map((c) => (
        <li key={c.name} className="flex flex-wrap items-center justify-between gap-2 py-3">
          <div>
            <p className="font-semibold text-ink-700">{c.name}</p>
            {c.note && <p className="text-xs text-ink-300">{c.note}</p>}
          </div>
          {c.phone ? (
            <a href={`tel:${c.phone}`} className="c-btn c-btn--solid">
              {toBn(c.phone)}
            </a>
          ) : (
            <span className="rounded-full bg-ink-50 px-3.5 py-1.5 text-xs font-semibold text-ink-300">নম্বর যুক্ত হবে</span>
          )}
        </li>
      ))}
    </ul>
  );
}

export default async function EmergencyPage() {
  const db = await data();
  const { national: nationalContacts, local: localContacts } = db.getEmergency();
  return (
    <>
      <PageHeader
        title="জরুরি নম্বর"
        intro="জরুরি পরিস্থিতিতে জাতীয় জরুরি সেবা ৯৯৯-এ কল করুন। স্থানীয় যোগাযোগের নম্বরগুলো যাচাই করে যুক্ত করা হচ্ছে। সঠিক নম্বর জানা থাকলে আমাদের পাঠাতে পারেন।"
        crumbs={[{ label: "জরুরি" }]}
        theme="emergency"
        eyebrow="জরুরি সেবা ও যোগাযোগ"
        aside={<HeaderFrame tag="জরুরি" icon={Phone} value="৯৯৯" label="পুলিশ, ফায়ার সার্ভিস আর অ্যাম্বুলেন্স" />}
      />
      <Container className="py-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Block title="সারা দেশের হেল্পলাইন">
            <ContactList contacts={nationalContacts} />
          </Block>
          <Block title="নাসিরনগরের স্থানীয় নম্বর">
            <ContactList contacts={localContacts} />
            <p className="mt-4 rounded-xl bg-accent-50 p-3 text-sm text-accent-800">স্থানীয় নম্বরগুলো যাচাই করে যুক্ত করা হবে। সঠিক তথ্য জানলে{" "}<Link href="/contribute" className="font-semibold underline">
                তথ্য দিন
              </Link>{" "}পেজের মাধ্যমে আমাদের জানাতে পারেন।</p>
          </Block>
        </div>

        <Block title="উপজেলা স্বাস্থ্য কমপ্লেক্স ও ইউনিয়ন স্বাস্থ্যকেন্দ্র" className="mt-6">
          <p className="text-ink-700">{upazila.health.intro}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-ink-700">
            {upazila.health.services.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p className="mt-3 text-ink-700">{upazila.health.unionCentres}</p>
          <p className="mt-3 text-sm text-ink-400">তথ্যটা উপজেলা পোর্টালের “হাসপাতাল ও ক্লিনিক” পেজ থেকে নেওয়া।</p>
        </Block>
      </Container>
    </>
  );
}

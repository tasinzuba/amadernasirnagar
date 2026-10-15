import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Users } from "lucide-react";
import { Block, Container, HeaderFrame, PageHeader } from "@/components/section";
import { team, type TeamMember } from "@/data/team";
import { toBn } from "@/lib/bn";
import { imageSizeOf } from "@/lib/images";
import type { ImageSize } from "@/lib/types";

export const metadata: Metadata = {
  title: "আমাদের টিম",
  description: "আমাদের নাসিরনগর যাঁদের উদ্যোগে তৈরি ও পরিচালিত হচ্ছে, তাঁদের পরিচয় ও যোগাযোগ।",
};

function FacebookIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M13.5 21v-7.5h2.53l.38-2.94H13.5V8.69c0-.85.24-1.43 1.46-1.43h1.56V4.63a20.6 20.6 0 0 0-2.27-.12c-2.25 0-3.79 1.37-3.79 3.9v2.15H7.92v2.94h2.54V21h3.04Z" />
    </svg>
  );
}

/** নামের আদ্যক্ষর: "Md Jubayer Ahamed" → "JA" (Md বাদ), বাংলা নামে প্রথম অক্ষর */
function initials(name: string): string {
  const words = name.split(/\s+/).filter((w) => !/^(md|mohammad|muhammad|মোঃ|মো\.)\.?$/i.test(w));
  if (/^[a-z]/i.test(words[0] ?? "")) return words.slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  return (words[0] ?? name).charAt(0);
}

/** ছবি যেমন আছে তেমন (পোর্ট্রেট, বড় করা হয় না); না থাকলে নামের আদ্যক্ষর */
function MemberPhoto({ member, size }: { member: TeamMember; size?: ImageSize }) {
  if (member.photo && size) {
    const scale = Math.min(1, 320 / size.height);
    return (
      <Image
        src={member.photo}
        alt={member.name}
        width={Math.round(size.width * scale)}
        height={Math.round(size.height * scale)}
        className="h-auto max-w-full rounded-lg"
      />
    );
  }
  return (
    <div className="flex h-40 w-32 items-center justify-center rounded-lg bg-accent-500 font-display text-[3.2rem] font-bold text-white" aria-hidden="true">
      {initials(member.name)}
    </div>
  );
}

export default async function TeamPage() {
  const members = await Promise.all(team.map(async (m) => ({ member: m, size: await imageSizeOf(m.photo) })));

  return (
    <>
      <PageHeader
        title="আমাদের টিম"
        intro="আমাদের নাসিরনগর যাঁদের উদ্যোগে তৈরি ও পরিচালিত হচ্ছে। সাইট নিয়ে কোনো পরামর্শ, ভুল তথ্যের খবর বা সহযোগিতার কথা থাকলে সরাসরি যোগাযোগ করতে পারেন।"
        crumbs={[{ label: "সম্পর্কে", href: "/about" }, { label: "আমাদের টিম" }]}
        theme="about"
        eyebrow="যাঁদের উদ্যোগে"
        aside={<HeaderFrame tag="টিম" icon={Users} value={`${toBn(team.length)} জন`} label="এই সাইটের পেছনে" />}
      />

      <Container className="py-14">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {members.map(({ member, size }) => (
            <article key={member.name} className="c-card flex flex-col gap-6 p-7 sm:flex-row sm:items-start sm:p-8">
              <div className="shrink-0">
                <MemberPhoto member={member} size={size} />
              </div>
              <div className="min-w-0">
                <p className="text-[0.95rem] font-bold text-accent-600">{member.role}</p>
                <h2 className="mt-1 text-[1.9rem] font-bold leading-snug text-brand-900">{member.name}</h2>
                {member.nameEn && <p className="text-ink-400">{member.nameEn}</p>}
                {member.bio && <p className="mt-4 leading-relaxed text-ink-600">{member.bio}</p>}
                {member.facebook && (
                  <a href={member.facebook} target="_blank" rel="noopener noreferrer" className="c-btn c-btn--outline mt-6">
                    <FacebookIcon className="h-5 w-5 text-[#1877f2]" />
                    ফেসবুকে যোগাযোগ
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 max-w-3xl">
          <Block title="আপনিও যুক্ত হতে পারেন">
            <p className="text-ink-700">
              আপনার গ্রামের ইতিহাস, ছবি বা কোনো ভুল তথ্যের সংশোধন{" "}
              <Link href="/contribute" className="text-link">
                তথ্য দিন
              </Link>{" "}
              ফর্ম থেকে পাঠাতে পারেন। যাচাই করে সাইটে যুক্ত করা হবে।
            </p>
          </Block>
        </div>
      </Container>
    </>
  );
}

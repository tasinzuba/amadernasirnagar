import Link from "next/link";
import { Logo } from "./logo";
import { SearchForm } from "./search-form";
import { Container } from "./section";
import { site } from "@/data/site";
import { team } from "@/data/team";
import { data } from "@/lib/data";

/** ফুটারে ইউনিয়নের ক্রম; তালিকায় না থাকা নতুন ইউনিয়ন থাকলে শেষে বসে */
const unionOrder = [
  "nasirnagar",
  "haripur",
  "gokarna",
  "fandauk",
  "kunda",
  "chapairtala",
  "goalnagar",
  "buriswar",
  "guniauk",
  "chatalpar",
  "purbabhag",
  "dharmandal",
  "bhalakut",
];

const explore = [
  { href: "/villages", label: "সকল গ্রাম" },
  { href: "/upazila#history", label: "ইতিহাস ও ঐতিহ্য" },
  { href: "/places", label: "দর্শনীয় স্থান" },
  { href: "/people", label: "কৃতী ব্যক্তিত্ব" },
  { href: "/schools", label: "শিক্ষা প্রতিষ্ঠান" },
  { href: "/news", label: "খবর ও আপডেট" },
  { href: "/events", label: "উৎসব ও সংস্কৃতি" },
];

const useful = [
  { href: "/upazila", label: "উপজেলা পরিচিতি" },
  { href: "/map", label: "মানচিত্র" },
  { href: "/transport", label: "যাতায়াত তথ্য" },
  { href: "/emergency", label: "জরুরি যোগাযোগ" },
  { href: "/about", label: "আমাদের সম্পর্কে" },
  { href: "/team", label: "আমাদের টিম" },
];

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-[1.05rem] text-ink-300 transition-colors hover:text-accent-400">
      {label}
    </Link>
  );
}

/** গাঢ় (প্রায় কালো) ফুটার: লোগো ও পরিচিতি, ডানে খোঁজার বাক্স; তারপর লিংকের কলাম (ফোনে দুই কলামে) ও কপিরাইট */
export async function SiteFooter() {
  const db = await data();
  const all = db.getUnions();
  const rank = (slug: string) => {
    const i = unionOrder.indexOf(slug);
    return i < 0 ? unionOrder.length : i;
  };
  const unions = [...all].sort((a, b) => rank(a.slug) - rank(b.slug));
  return (
    <footer id="footer" className="bg-brand-950 text-ink-300">
      <Container>
        <div className="grid grid-cols-1 gap-10 py-16 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <Logo className="h-11 w-11 drop-shadow-[0_4px_12px_rgba(20,20,43,0.28)]" />
              <span className="text-[1.65rem] font-bold leading-none text-white">{site.name}</span>
            </Link>
            <p className="mt-6 max-w-xl leading-relaxed text-ink-300">
              হাওর-বেষ্টিত নাসিরনগরের প্রতিটি গ্রামের ইতিহাস, ঐতিহ্য, সংস্কৃতি, দর্শনীয় স্থান ও মানুষের অজানা তথ্য নিয়ে আমাদের এই ডিজিটাল
              তথ্যভান্ডার। জানুন নিজের শিকড়কে, চিনুন প্রিয় নাসিরনগরকে।
            </p>
            <p className="mt-4 max-w-xl font-semibold leading-relaxed text-accent-400">
              আমাদের গ্রাম, আমাদের পরিচয় — তথ্যেই বেঁচে থাকুক নাসিরনগরের ঐতিহ্য।
            </p>
          </div>
          <div>
            <h2 className="text-[1.5rem] font-bold text-white">আপনার গ্রামের তথ্য খুঁজুন</h2>
            <SearchForm id="footer-search" size="lg" placeholder="গ্রামের নাম লিখে খুঁজুন..." className="mt-5" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 border-t border-white/10 py-16 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
          <nav aria-label="ইউনিয়নসমূহ">
            <h2 className="mb-6 text-[1.3rem] font-bold text-white">ইউনিয়নসমূহ</h2>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
              {unions.map((u) => (
                <li key={u.slug}>
                  <FooterLink href={`/unions/${u.slug}`} label={u.name} />
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="নাসিরনগর ঘুরে দেখুন">
            <h2 className="mb-6 text-[1.3rem] font-bold text-white">নাসিরনগর ঘুরে দেখুন</h2>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-1">
              {explore.map((l) => (
                <li key={l.href}>
                  <FooterLink href={l.href} label={l.label} />
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="প্রয়োজনীয় লিংক">
            <h2 className="mb-6 text-[1.3rem] font-bold text-white">প্রয়োজনীয় লিংক</h2>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-1">
              {useful.map((l) => (
                <li key={l.href}>
                  <FooterLink href={l.href} label={l.label} />
                </li>
              ))}
              <li>
                <Link href="/contribute" className="text-[1.05rem] font-bold text-accent-400 underline underline-offset-4 hover:text-accent-300">
                  তথ্য জমা দিন
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 py-8 text-[0.98rem] text-ink-300 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p>© ২০২৬ {site.name}। সকল স্বত্ব সংরক্ষিত।</p>
            <p>
              সাইটটি বানিয়েছেন{" "}
              {team.map((m, i) => (
                <span key={m.name}>
                  {i > 0 && (i === team.length - 1 ? " ও " : ", ")}
                  {m.facebook ? (
                    <a
                      href={m.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-white underline decoration-accent-400 underline-offset-4 transition-colors hover:text-accent-400"
                    >
                      {m.name}
                    </a>
                  ) : (
                    <span className="font-semibold text-white">{m.name}</span>
                  )}
                </span>
              ))}
            </p>
          </div>
          <p>নাসিরনগরের ইতিহাস, ঐতিহ্য ও তথ্য সংরক্ষণে আমাদের সম্মিলিত উদ্যোগ।</p>
        </div>
      </Container>
    </footer>
  );
}

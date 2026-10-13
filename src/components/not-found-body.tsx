import Link from "next/link";
import { Container } from "@/components/section";

/** ৪০৪ পেজের মূল অংশ; হেডার-ফুটার যে লেআউট থেকে আসে, সেখানেই বসে */
export function NotFoundBody() {
  return (
    <Container className="py-24 text-center sm:py-32">
      <p className="text-7xl font-bold text-accent-500">৪০৪</p>
      <h1 className="mt-4 text-3xl font-bold text-ink-900">দুঃখিত, পেজটি পাওয়া যায়নি</h1>
      <p className="mx-auto mt-3 max-w-md text-ink-500">লিংকটি সঠিক কি না দেখুন। পেজটি সরানো হয়ে থাকতে পারে অথবা তথ্য এখনো যুক্ত হয়নি।</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="c-btn c-btn--solid c-btn--lg">
          হোমে ফিরে যান
        </Link>
        <Link href="/villages" className="c-btn c-btn--outline c-btn--lg">
          সব গ্রাম দেখুন
        </Link>
      </div>
    </Container>
  );
}

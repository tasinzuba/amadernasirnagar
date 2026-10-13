import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";
import { NavMenu } from "./nav-menu";
import { Container } from "./section";
import { site } from "@/data/site";

/** রেফারেন্সের মতো হেডার: বাঁয়ে লোগো, মাঝে মেনু, ডানে সাদা আইকন-বোতাম ও কোরাল পিল বোতাম */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md">
      <Container className="flex h-20 items-center gap-4 lg:h-24 lg:gap-6">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label={`${site.name}, হোম`}>
          <Logo className="h-11 w-11 drop-shadow-[0_6px_14px_rgba(255,57,81,0.35)]" />
          <span className="font-display text-[1.3rem] font-bold leading-none text-brand-900 sm:text-[1.65rem]">{site.name}</span>
        </Link>

        <div className="hidden flex-1 justify-center lg:flex">
          <Suspense fallback={<NavLinks items={site.nav} pathname={null} />}>
            <NavMenu items={site.nav} more={site.secondaryNav} />
          </Suspense>
        </div>

        <div className="ml-auto flex items-center gap-3 lg:ml-0">
          <Link
            href="/villages"
            aria-label="গ্রাম খুঁজুন"
            className="hidden h-12 w-12 items-center justify-center rounded-xl bg-white text-accent-500 shadow-soft transition-transform duration-300 hover:-translate-y-0.5 sm:flex"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Link href="/contribute" className="c-btn c-btn--solid hidden xl:inline-flex">
            তথ্য দিন
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
          <MobileNav primary={site.nav} more={site.secondaryNav} />
        </div>
      </Container>
    </header>
  );
}

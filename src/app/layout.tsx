import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Anek_Bangla, Hind_Siliguri, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { site } from "@/data/site";

/* ইংরেজি অক্ষর: Plus Jakarta Sans (রেফারেন্স টেমপ্লেটের ফন্টের কাছাকাছি) */
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

/* বাংলা পড়ার লেখা: Hind Siliguri */
const hind = Hind_Siliguri({
  variable: "--font-hind",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/* বাংলা শিরোনাম: Anek Bangla (জ্যামিতিক, মোটা ওজনে আধুনিক) */
const anek = Anek_Bangla({
  variable: "--font-anek",
  subsets: ["bengali", "latin"],
  display: "swap",
});

function metadataBase(): URL {
  try {
    return new URL(site.url);
  } catch {
    return new URL("http://localhost:3000");
  }
}

export const metadata: Metadata = {
  metadataBase: metadataBase(),
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: ["নাসিরনগর", "Nasirnagar", "ব্রাহ্মণবাড়িয়া", "Brahmanbaria", "গ্রাম", "হরিপুর জমিদার বাড়ি", "উপজেলা"],
  openGraph: {
    type: "website",
    locale: "bn_BD",
    siteName: site.name,
    title: site.name,
    description: site.description,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bn" data-scroll-behavior="smooth" className={`${jakarta.variable} ${hind.variable} ${anek.variable} h-full antialiased`}>
      {/* suppressHydrationWarning: ব্রাউজার এক্সটেনশন body-তে attribute বসালে সতর্কবার্তা না দেখায় */}
      <body className="flex min-h-full flex-col bg-white font-sans text-ink-500" suppressHydrationWarning>
        {/* জাভাস্ক্রিপ্ট বন্ধ থাকলে অ্যানিমেশনের জন্য লুকানো অংশগুলো দেখা যাবে */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

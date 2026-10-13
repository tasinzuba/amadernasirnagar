import Link from "next/link";
import type { ImageCredit } from "@/lib/images";

const isCommons = (url: string) => /wikimedia\.org/.test(url);

/** একটা ছবির কৃতজ্ঞতা: লেখক, লাইসেন্স আর উৎস (CC BY / CC BY-SA-এর শর্ত) */
export function PhotoCredit({
  credit,
  tone = "light",
  className = "",
}: {
  credit?: ImageCredit;
  tone?: "light" | "dark";
  className?: string;
}) {
  if (!credit) return null;
  const link =
    tone === "dark"
      ? "underline decoration-white/30 underline-offset-2 transition-colors hover:text-white"
      : "underline decoration-ink-200 underline-offset-2 transition-colors hover:text-accent-600";
  return (
    <p className={`text-xs leading-relaxed ${tone === "dark" ? "text-white/55" : "text-ink-400"} ${className}`}>
      ছবি:{" "}
      <a href={credit.source} target="_blank" rel="noopener noreferrer" className={link}>
        {credit.author}
      </a>
      {", "}
      {credit.licenseUrl ? (
        <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer license" className={link}>
          {credit.license}
        </a>
      ) : (
        credit.license
      )}
      {isCommons(credit.source) && ", উইকিমিডিয়া কমন্স"}
      {credit.note && ` (${credit.note})`}
    </p>
  );
}

/** গ্যালারির নিচে: সব ছবির লেখক আর লাইসেন্স এক লাইনে */
export function GalleryCredits({ credits, className = "" }: { credits: (ImageCredit | undefined)[]; className?: string }) {
  const list = credits.filter((c): c is ImageCredit => Boolean(c));
  if (list.length === 0) return null;
  const authors = [...new Set(list.map((c) => c.author))];
  const licenses = [...new Set(list.map((c) => c.license))];
  const from = list.some((c) => isCommons(c.source)) ? "উইকিমিডিয়া কমন্স, " : "";
  return (
    <p className={`mt-4 text-xs leading-relaxed text-ink-400 ${className}`}>
      ছবি: {authors.join(", ")} ({from}
      {licenses.join(", ")})। কোন ছবি কার, বড় করে দেখলে লেখা থাকে।{" "}
      <Link href="/about#photo-credits" className="underline decoration-ink-200 underline-offset-2 hover:text-accent-600">
        সব ছবির তালিকা
      </Link>
    </p>
  );
}

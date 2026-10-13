/* ছবি না থাকলে: নরম রঙের টাইলে সরু রেখায় আঁকা হাওর (সূর্য, দিগন্ত, ঢেউ, নৌকা) */
const tones = [
  { bg: "#e4dfd0", ink: "#5a584d" },
  { bg: "#dde4da", ink: "#4d5c52" },
  { bg: "#ead8cd", ink: "#6b4a3b" },
  { bg: "#d8e1e1", ink: "#495b5d" },
  { bg: "#e8e2c9", ink: "#675d3a" },
];

function hash(s: string): number {
  let h = 0;
  for (const ch of s) h = (h * 31 + (ch.codePointAt(0) ?? 0)) >>> 0;
  return h;
}

/**
 * className-এ অবস্থান (relative / absolute inset-0) ও মাপ দিতে হয়।
 * seed অনুযায়ী রং ও সূর্যের অবস্থান বদলায়, যাতে পাশাপাশি টাইলগুলো একরকম না দেখায়।
 */
export function Placeholder({
  seed,
  label = "ছবি যোগ হবে",
  showLabel = true,
  className = "relative",
}: {
  seed: string;
  label?: string;
  showLabel?: boolean;
  className?: string;
}) {
  const h = hash(seed);
  const t = tones[h % tones.length];
  const sunX = 150 + (h % 100);
  return (
    <div className={`overflow-hidden ${className}`} style={{ backgroundColor: t.bg }} aria-hidden="true">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        stroke={t.ink}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.55"
      >
        <circle cx={sunX} cy="118" r="26" />
        <path d={`M${sunX - 62} 118h22M${sunX + 40} 118h22`} strokeOpacity="0.3" />
        <path d="M0 178h400" strokeOpacity="0.35" />
        <path d="M40 206c20-10 40-10 60 0s40 10 60 0 40-10 60 0 40 10 60 0 40-10 60 0 40 10 60 0" />
        <path d="M20 232c20-10 40-10 60 0s40 10 60 0 40-10 60 0 40 10 60 0 40-10 60 0 40 10 60 0" strokeOpacity="0.35" />
        <path d="M250 172q30 10 60 0l-6 8h-48z" fill={t.ink} fillOpacity="0.45" stroke="none" />
        <path d="M278 172v-22l14 22" strokeOpacity="0.6" />
      </svg>
      {showLabel && (
        <span className="absolute bottom-3 left-3 font-display text-xs italic" style={{ color: t.ink }}>
          {label}
        </span>
      )}
    </div>
  );
}

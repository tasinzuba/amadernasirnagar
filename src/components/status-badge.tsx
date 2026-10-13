import type { VillageStatus } from "@/lib/types";

/** গ্রামের তথ্যের অবস্থা: পরিচিতি থাকলে কোরাল বিন্দু (পূর্ণাঙ্গ হলে চারপাশে আভা), না থাকলে ফাঁপা বৃত্ত */
export function Lamp({ status, className = "" }: { status: VillageStatus; className?: string }) {
  const look =
    status === "stub"
      ? "border-[1.5px] border-ink-300"
      : status === "complete"
        ? "bg-accent-500 shadow-[0_0_0_3px_rgb(255_57_81_/_0.2)]"
        : "bg-accent-500";
  return <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${look} ${className}`} aria-hidden="true" />;
}

const labels: Record<VillageStatus, string> = {
  complete: "পুরো কথা লেখা হয়েছে",
  partial: "কিছু কথা লেখা হয়েছে",
  stub: "এখনো লেখা হয়নি",
};

/** tone="dark" গাঢ় পটভূমিতে */
export function StatusBadge({ status, tone = "light" }: { status: VillageStatus; tone?: "light" | "dark" }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold ${
        tone === "dark" ? "bg-white/15 text-white" : "border border-line bg-white text-ink-700 shadow-input"
      }`}
    >
      <Lamp status={status} />
      {labels[status]}
    </span>
  );
}

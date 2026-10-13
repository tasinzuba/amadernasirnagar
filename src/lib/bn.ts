const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

const bnMonths = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

/** ইংরেজি অঙ্ককে বাংলা অঙ্কে রূপান্তর: 128 → ১২৮ */
export function toBn(input: number | string): string {
  return String(input).replace(/\d/g, (d) => bnDigits[Number(d)]);
}

/** বাংলা রীতিতে কমা দিয়ে সংখ্যা: 346774 → ৩,৪৬,৭৭৪ */
export function formatBn(n: number): string {
  const s = Math.round(Math.abs(n)).toString();
  let grouped = s;
  if (s.length > 3) {
    const last3 = s.slice(-3);
    let rest = s.slice(0, -3);
    const parts: string[] = [];
    while (rest.length > 2) {
      parts.unshift(rest.slice(-2));
      rest = rest.slice(0, -2);
    }
    if (rest) parts.unshift(rest);
    grouped = `${parts.join(",")},${last3}`;
  }
  return (n < 0 ? "-" : "") + toBn(grouped);
}

/** দশমিক সংখ্যা বাংলায়: 311.66 → ৩১১.৬৬ */
export function formatDecimalBn(n: number, digits = 2): string {
  return toBn(n.toFixed(digits));
}

/** ISO তারিখ বাংলায়: "2026-10-07" → "৭ অক্টোবর ২০২৬" */
export function formatDateBn(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d || m < 1 || m > 12) return toBn(iso);
  return `${toBn(d)} ${bnMonths[m - 1]} ${toBn(y)}`;
}

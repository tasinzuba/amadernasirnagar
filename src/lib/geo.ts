export interface LatLng {
  lat: number;
  lng: number;
}

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** দুই স্থানাঙ্কের সরলরেখা দূরত্ব (কিলোমিটার) */
export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** a থেকে b কোন দিকে (ডিগ্রি, ০ = উত্তর) */
export function bearing(a: LatLng, b: LatLng): number {
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const dLng = toRad(b.lng - a.lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export function directionBn(deg: number): string {
  const names = [
    "উত্তরে",
    "উত্তর-পূর্বে",
    "পূর্বে",
    "দক্ষিণ-পূর্বে",
    "দক্ষিণে",
    "দক্ষিণ-পশ্চিমে",
    "পশ্চিমে",
    "উত্তর-পশ্চিমে",
  ];
  return names[Math.round(deg / 45) % 8];
}

"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const MapPickerInner = dynamic(() => import("./map-picker-inner"), {
  ssr: false,
  loading: () => <div className="flex h-[320px] items-center justify-center bg-ink-50 text-sm text-ink-600">মানচিত্র লোড হচ্ছে…</div>,
});

/**
 * মানচিত্রে ক্লিক করে অক্ষাংশ/দ্রাঘিমাংশ বসানো। মানগুলো lat ও lng নামের ইনপুটে থাকে।
 * fallback = কোনো মান না থাকলে মানচিত্র যেখানে কেন্দ্রীভূত হবে (যেমন ইউনিয়ন কেন্দ্র)।
 */
export function MapPicker({
  lat,
  lng,
  fallback,
  fallbackLabel = "ইউনিয়ন কেন্দ্র",
}: {
  lat?: number;
  lng?: number;
  fallback: { lat: number; lng: number };
  fallbackLabel?: string;
}) {
  const [latText, setLatText] = useState(lat !== undefined ? String(lat) : "");
  const [lngText, setLngText] = useState(lng !== undefined ? String(lng) : "");

  const latNum = Number(latText);
  const lngNum = Number(lngText);
  const hasMarker = latText !== "" && lngText !== "" && Number.isFinite(latNum) && Number.isFinite(lngNum);
  const center: [number, number] = hasMarker ? [latNum, lngNum] : [fallback.lat, fallback.lng];

  return (
    <div className="grid grid-cols-1 gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
        <div>
          <label htmlFor="lat" className="c-label">
            অক্ষাংশ (lat)
          </label>
          <input id="lat" name="lat" value={latText} onChange={(e) => setLatText(e.target.value)} placeholder="যেমন 24.1928" className="c-input" inputMode="decimal" />
        </div>
        <div>
          <label htmlFor="lng" className="c-label">
            দ্রাঘিমাংশ (lng)
          </label>
          <input id="lng" name="lng" value={lngText} onChange={(e) => setLngText(e.target.value)} placeholder="যেমন 91.1946" className="c-input" inputMode="decimal" />
        </div>
        <button
          type="button"
          className="c-btn c-btn--outline"
          onClick={() => {
            setLatText(String(fallback.lat));
            setLngText(String(fallback.lng));
          }}
        >
          {fallbackLabel}
        </button>
        <button
          type="button"
          className="c-btn c-btn--outline"
          onClick={() => {
            setLatText("");
            setLngText("");
          }}
        >
          মুছুন
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-ink-100">
        <MapPickerInner
          center={center}
          marker={hasMarker ? [latNum, lngNum] : null}
          onPick={(la, ln) => {
            setLatText(String(la));
            setLngText(String(ln));
          }}
        />
      </div>
      <p className="text-xs text-ink-300">মানচিত্রে ক্লিক করলে লাল বিন্দু বসবে ও মান বদলাবে। Google Maps থেকে কপি করেও বসাতে পারেন।</p>
    </div>
  );
}

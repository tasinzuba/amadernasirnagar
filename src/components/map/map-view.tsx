"use client";

import dynamic from "next/dynamic";
import type { LeafletMapProps } from "./leaflet-map";

const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[280px] w-full items-center justify-center bg-water text-sm text-ink-500">মানচিত্র লোড হচ্ছে…</div>
  ),
});

/** Leaflet শুধু ব্রাউজারে চলে, তাই ssr বন্ধ রেখে ডায়নামিক লোড */
export function MapView(props: LeafletMapProps) {
  return (
    <div className="overflow-hidden rounded-[28px]">
      <LeafletMap {...props} />
    </div>
  );
}

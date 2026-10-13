"use client";

import "leaflet/dist/leaflet.css";
import { useCallback, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from "react-leaflet";

export type MarkerKind = "union" | "village" | "place" | "focus";

export interface MapMarker {
  lat: number;
  lng: number;
  label: string;
  sub?: string;
  href?: string;
  kind: MarkerKind;
}

export interface LeafletMapProps {
  center: [number, number];
  zoom?: number;
  markers: MapMarker[];
  className?: string;
  scrollWheelZoom?: boolean;
}

/* মানচিত্রের মার্কার: কোরাল ইউনিয়ন, নীল গ্রাম, বেগুনি দর্শনীয় স্থান */
const styles: Record<MarkerKind, { color: string; fillColor: string; radius: number }> = {
  union: { color: "#ffffff", fillColor: "#ff3951", radius: 10 },
  village: { color: "#ffffff", fillColor: "#3d7fff", radius: 6 },
  place: { color: "#ffffff", fillColor: "#6a35ff", radius: 7 },
  focus: { color: "#14142b", fillColor: "#ff3951", radius: 12 },
};

export default function LeafletMap({
  center,
  zoom = 11,
  markers,
  className = "h-[420px] w-full",
  scrollWheelZoom = false,
}: LeafletMapProps) {
  // অন্য পেজে গেলে Next.js আগের পেজটা মুছে না দিয়ে লুকিয়ে রাখে (React Activity)। লুকানোর সময় react-leaflet
  // ভেতরের ম্যাপটা মুছে ফেলে, কিন্তু আবার দেখানোর সময় নতুন করে বানায় না, তাই টাইল বসাতে গিয়ে ভেঙে পড়ে।
  // এজন্য লুকানোর সময় ম্যাপটা সরিয়ে দিই, আর পেজ আবার দেখা গেলে নতুন ম্যাপ বসাই। কলব্যাক ref-এর
  // cleanup লুকানোর সময় চলে, আর ref আবার দেখানোর সময় বসে (Next.js-এর preserving-ui-state গাইডের ধরন)।
  const [active, setActive] = useState(false);
  const hostRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    setActive(true);
    return () => setActive(false);
  }, []);

  return (
    <div ref={hostRef} className={className}>
      {active && (
        <MapContainer center={center} zoom={zoom} scrollWheelZoom={scrollWheelZoom} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markers.map((m, i) => {
            const s = styles[m.kind];
            return (
              <CircleMarker
                key={`${m.kind}-${m.label}-${i}`}
                center={[m.lat, m.lng]}
                radius={s.radius}
                pathOptions={{ color: s.color, fillColor: s.fillColor, fillOpacity: 1, weight: 2.5 }}
              >
                <Tooltip direction="top" offset={[0, -8]}>
                  {m.label}
                </Tooltip>
                <Popup>
                  <strong>{m.label}</strong>
                  {m.sub && <div>{m.sub}</div>}
                  {m.href && (
                    <div style={{ marginTop: 4 }}>
                      <a href={m.href}>বিস্তারিত →</a>
                    </div>
                  )}
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      )}
    </div>
  );
}

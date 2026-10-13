"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)));
    },
  });
  return null;
}

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [map, center]);
  return null;
}

export default function MapPickerInner({
  center,
  marker,
  onPick,
}: {
  center: [number, number];
  marker: [number, number] | null;
  onPick: (lat: number, lng: number) => void;
}) {
  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom className="h-[320px] w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPick={onPick} />
      <Recenter center={center} />
      {marker && (
        <CircleMarker center={marker} radius={10} pathOptions={{ color: "#8f2c22", fillColor: "#cd4335", fillOpacity: 0.9, weight: 2.5 }} />
      )}
    </MapContainer>
  );
}

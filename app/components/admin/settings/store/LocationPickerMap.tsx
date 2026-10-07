"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { ABUJA_CENTER } from "@/app/data/stores";

const pinIcon = L.divIcon({
  className: "",
  iconSize: [34, 44],
  iconAnchor: [17, 44],
  html: `<svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg"><path d="M17 0C7.6 0 0 7.4 0 16.6 0 29 17 44 17 44s17-15 17-27.4C34 7.4 26.4 0 17 0z" fill="#2C337C"/><circle cx="17" cy="16.5" r="6.5" fill="#FCB415"/></svg>`,
});

function ClickToPlace({ onChange, disabled }: { onChange: (lat: number, lng: number) => void; disabled?: boolean }) {
  useMapEvents({
    click(e) {
      if (!disabled) onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/** Keeps the pin in view when the coordinates are typed or filled in from the phone's location. */
function KeepInView({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position && !map.getBounds().contains(position)) {
      map.flyTo(position, Math.max(map.getZoom(), 15), { duration: 0.7 });
    }
  }, [position, map]);
  return null;
}

/** Wheel zooms only after the map is clicked, so it never traps page scrolling. */
function WheelGuard() {
  const map = useMap();
  useEffect(() => {
    map.scrollWheelZoom.disable();
    const el = map.getContainer();
    const on = () => map.scrollWheelZoom.enable();
    const off = () => map.scrollWheelZoom.disable();
    map.on("click", on);
    el.addEventListener("mouseleave", off);
    return () => {
      map.off("click", on);
      el.removeEventListener("mouseleave", off);
    };
  }, [map]);
  return null;
}

export type LocationPickerMapProps = {
  latitude: number | null;
  longitude: number | null;
  onChange: (latitude: number, longitude: number) => void;
  disabled?: boolean;
};

/** Click the map or drag the pin to set where the store is. */
export default function LocationPickerMap({ latitude, longitude, onChange, disabled }: LocationPickerMapProps) {
  const position = useMemo<[number, number] | null>(
    () => (latitude !== null && longitude !== null ? [latitude, longitude] : null),
    [latitude, longitude],
  );
  const markerRef = useRef<L.Marker>(null);

  return (
    <MapContainer
      center={position ?? [ABUJA_CENTER.lat, ABUJA_CENTER.lng]}
      zoom={position ? 16 : 12}
      className="h-72 w-full rounded-xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <WheelGuard />
      <ClickToPlace onChange={onChange} disabled={disabled} />
      <KeepInView position={position} />
      {position && (
        <Marker
          ref={markerRef}
          position={position}
          icon={pinIcon}
          draggable={!disabled}
          eventHandlers={{
            dragend() {
              const p = markerRef.current?.getLatLng();
              if (p) onChange(p.lat, p.lng);
            },
          }}
        />
      )}
    </MapContainer>
  );
}

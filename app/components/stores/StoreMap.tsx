"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import type { PublicStore } from "@/redux/types";

const esc = (v: string) => v.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Logo badge + name label. Falls back to the store's initial if there is no logo or it fails to load. */
const pin = (s: PublicStore, active: boolean) => {
  const ring = active ? "#FCB415" : "#2C337C";
  const logo = s.logo
    ? `<img src="${esc(s.logo)}" alt="" onerror="this.style.display='none'" style="position:absolute;left:4px;top:0;width:60px;height:60px;border-radius:50%;object-fit:cover;border:4px solid ${ring};box-sizing:border-box;background:#fff"/>`
    : "";
  return L.divIcon({
    className: "",
    iconSize: [130, 96],
    iconAnchor: [65, 68],
    html: `<div style="width:130px;display:flex;flex-direction:column;align-items:center;transition:transform .15s;transform:scale(${active ? 1.15 : 1});transform-origin:center 68px;cursor:pointer">
      <div style="position:relative;width:68px;height:68px">
        <div style="position:absolute;left:4px;top:0;width:60px;height:60px;border-radius:50%;background:${ring};color:#fff;font:700 24px/60px sans-serif;text-align:center;box-shadow:0 3px 8px rgba(0,0,0,.35);border:4px solid ${ring}">${esc(s.name.charAt(0))}</div>
        ${logo}
        <div style="position:absolute;left:25px;top:56px;width:0;height:0;border-left:9px solid transparent;border-right:9px solid transparent;border-top:12px solid ${ring}"></div>
      </div>
      <div style="margin-top:2px;max-width:130px;padding:2px 8px;border-radius:999px;background:#fff;color:#1f2937;font:600 11px/16px sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:0 1px 4px rgba(0,0,0,.3)">${esc(s.name)}</div>
    </div>`,
  });
};

const youIcon = L.divIcon({
  className: "",
  iconSize: [18, 18],
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 0 0 6px rgba(37,99,235,.25)"></div>`,
});

/** Wheel zooms only after the map is clicked/tapped, so it never traps page scrolling. */
function WheelGuard() {
  const map = useMap();
  useEffect(() => {
    map.scrollWheelZoom.disable();
    const el = map.getContainer();
    const on = () => map.scrollWheelZoom.enable();
    const off = () => map.scrollWheelZoom.disable();
    map.on("click", on);
    el.addEventListener("mouseleave", off);
    return () => { map.off("click", on); el.removeEventListener("mouseleave", off); };
  }, [map]);
  return null;
}

export type MapView = { key: number; center?: [number, number]; zoom?: number; bounds?: [[number, number], [number, number]] };

/** Moves the map whenever `view.key` changes (user located, recenter, show nearest stores). */
function ViewTo({ view }: { view?: MapView }) {
  const map = useMap();
  useEffect(() => {
    if (!view) return;
    if (view.bounds) map.flyToBounds(view.bounds, { padding: [60, 60], duration: 0.9, maxZoom: 14 });
    else if (view.center) map.flyTo(view.center, view.zoom ?? 13, { duration: 0.9 });
  }, [view, map]);
  return null;
}

/** Takes plain numbers so it only flies when the target really moves, not on every re-render. */
function FlyTo({ lat, lng }: { lat?: number; lng?: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat !== undefined && lng !== undefined) map.flyTo([lat, lng], Math.max(map.getZoom(), 14), { duration: 0.7 });
  }, [lat, lng, map]);
  return null;
}

type Props = {
  stores: PublicStore[];
  selectedSlug: string | null;
  /** Which of the selected store's locations to fly to. Defaults to its first (closest). */
  selectedLocationId?: string | null;
  /** `locationId` is the pin that was clicked, so a branch pin opens on that branch */
  onSelect: (slug: string | null, locationId?: string) => void;
  center: { lat: number; lng: number };
  user: { lat: number; lng: number } | null;
  view?: MapView;
};

export default function StoreMap({ stores, selectedSlug, selectedLocationId, onSelect, center, user, view }: Props) {
  const selected = stores.find((s) => s.slug === selectedSlug);
  const selectedLoc = selected?.locations.find((l) => l.id === selectedLocationId) ?? selected?.locations[0];
  return (
    <MapContainer center={[center.lat, center.lng]} zoom={12} zoomControl className="h-full w-full" attributionControl>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <WheelGuard />
      <ViewTo view={view} />
      <FlyTo lat={selectedLoc?.latitude} lng={selectedLoc?.longitude} />
      {user && <Marker position={[user.lat, user.lng]} icon={youIcon} interactive={false} />}
      {/* One pin per location: a store with branches shows on the map once for each */}
      {stores.flatMap((s) =>
        s.locations.map((l) => (
          <Marker
            key={`${s.slug}:${l.id}`}
            position={[l.latitude, l.longitude]}
            icon={pin(s, s.slug === selectedSlug)}
            zIndexOffset={s.slug === selectedSlug ? 1000 : 0}
            eventHandlers={{ click: () => onSelect(s.slug, l.id) }}
            title={s.locations.length > 1 ? `${s.name} · ${l.label}` : s.name}
          />
        )),
      )}
    </MapContainer>
  );
}
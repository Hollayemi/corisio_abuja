"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { siteConfig } from "@/app/config/site";
import { ABUJA_CENTER, distanceKm, formatNaira, isOpenNow, stores, type Store } from "@/app/data/stores";

import type { MapView } from "./StoreMap";

const StoreMap = dynamic(() => import("./StoreMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-neutral-200" />,
});

type LatLng = { lat: number; lng: number };
type Item = { s: Store; km: number };
type Geo = "locating" | "granted" | "denied" | "unsupported";

const NEARBY_KM = 30;

function fmtKm(km: number): string {
  if (km < 1) return `${Math.round(km * 10) * 100} m`;
  if (km < 100) return `${km.toFixed(1)} km`;
  return `${Math.round(km).toLocaleString()} km`;
}

/* eslint-disable @next/next/no-img-element */

function OpenBadge({ store }: { store: Store }) {
  const open = isOpenNow(store);
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${open ? "bg-corisio-100merald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>
      {open ? "Open" : "Closed"}
    </span>
  );
}

function Briefing({ store, km, onClose }: { store: Store; km: number | null; onClose: () => void }) {
  const allDay = store.hours.open === 0 && store.hours.close === 24;
  return (
    <div className="absolute inset-x-0 bottom-0 z-[500] max-h-[75%] overflow-y-auto overscroll-contain rounded-t-2xl bg-white p-5 shadow-2xl sm:inset-x-auto sm:bottom-4 sm:left-4 sm:w-[380px] sm:rounded-2xl">
      <button onClick={onClose} aria-label="Close briefing" className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-white/90 text-neutral-600 shadow hover:bg-white">✕</button>
      <img src={store.image} alt={store.name} className="-mx-5 -mt-5 mb-4 h-36 w-[calc(100%+2.5rem)] rounded-t-2xl object-cover" />
      <span className="text-[11px] font-semibold uppercase tracking-wide text-corisio-blue/70">{store.categoryLabel}</span>
      <h2 className="mt-1 text-lg font-bold text-neutral-800">{store.name}</h2>
      <p className="mt-1 text-sm text-neutral-500">{store.tagline}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <OpenBadge store={store} />
        <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-neutral-600">{allDay ? "24 hrs" : `${store.hours.open}:00–${store.hours.close}:00`}</span>
        <span className="rounded-full bg-corisio-yellow/15 px-2.5 py-0.5 font-medium text-neutral-700">★ {store.rating} ({store.reviews})</span>
        {km !== null && <span className="rounded-full bg-corisio-blue/10 px-2.5 py-0.5 font-medium text-corisio-blue">{fmtKm(km)}</span>}
      </div>
      <p className="mt-3 text-sm text-neutral-600">📍 {store.address}</p>
      <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-400">Popular here</h3>
      <ul className="mt-1 divide-y divide-neutral-100 text-sm">
        {store.products.map((p) => (
          <li key={p.name} className="flex items-center gap-3 py-1.5">
            <img src={p.image} alt="" className="size-9 rounded-md bg-neutral-50 object-contain" />
            <span className="flex-1 text-neutral-700">{p.name}</span>
            <span className="font-semibold text-neutral-800">{formatNaira(p.price)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex gap-2">
        <Link href={`/stores/${store.slug}`} className="flex-1 rounded-lg bg-corisio-blue px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-corisio-blue/90">View store</Link>
        <a href={`https://www.openstreetmap.org/directions?to=${store.lat}%2C${store.lng}`} target="_blank" rel="noreferrer" className="rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50">Directions</a>
      </div>
    </div>
  );
}

/** Large list card (desktop sidebar + mobile list view). */
function ListCard({ s, km, active, onPick }: Item & { active: boolean; onPick: () => void }) {
  return (
    <button data-slug={s.slug} onClick={onPick} aria-current={active} className={`flex w-full gap-3 rounded-xl border p-2.5 text-left transition hover:shadow-md ${active ? "border-corisio-yellow bg-corisio-yellow/10" : "border-neutral-200 bg-white"}`}>
      <img src={s.image} alt="" className="size-24 shrink-0 rounded-lg object-cover" />
      <div className="min-w-0 flex-1 py-0.5">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-neutral-800">{s.name}</span>
          <span className="shrink-0 text-xs font-semibold text-corisio-blue">{fmtKm(km)}</span>
        </div>
        <p className="mt-0.5 truncate text-xs text-neutral-500">{s.categoryLabel} · {s.area}</p>
        <div className="mt-1.5 flex items-center gap-2 text-xs"><OpenBadge store={s} /><span className="text-neutral-600">★ {s.rating}</span></div>
        <p className="mt-1.5 truncate text-xs text-neutral-500">{s.products[0].name} · <b className="text-neutral-700">{formatNaira(s.products[0].price)}</b></p>
      </div>
    </button>
  );
}

/** Compact swipeable card shown over the map on mobile. */
function StripCard({ s, km, active, onPick }: Item & { active: boolean; onPick: () => void }) {
  return (
    <button data-slug={s.slug} onClick={onPick} className={`flex w-[250px] shrink-0 snap-center items-center gap-3 rounded-xl p-2 text-left shadow-lg ${active ? "bg-corisio-yellow" : "bg-white"}`}>
      <img src={s.image} alt="" className="size-14 shrink-0 rounded-lg object-cover" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-neutral-800">{s.name}</p>
        <p className="truncate text-xs text-neutral-600">{fmtKm(km)} · ★ {s.rating} · {s.area}</p>
      </div>
    </button>
  );
}

export default function StoresExplorer() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [user, setUser] = useState<LatLng | null>(null);
  const [geo, setGeo] = useState<Geo>("locating");
  const [view, setMapView] = useState<MapView | undefined>();
  const [tab, setTab] = useState<"map" | "list">("map"); // mobile only
  const listRef = useRef<HTMLUListElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  const origin = user ?? ABUJA_CENTER;

  const list = useMemo<Item[]>(() => {
    const q = query.trim().toLowerCase();
    return stores
      .filter((s) => category === "all" || s.category === category)
      .filter((s) => !q || [s.name, s.area, s.categoryLabel, ...s.products.map((p) => p.name)].join(" ").toLowerCase().includes(q))
      .map((s) => ({ s, km: distanceKm(origin, s) }))
      .sort((a, b) => a.km - b.km);
  }, [query, category, origin]);

  const active = list.find((x) => x.s.slug === selected);

  // Keep the selected store visible in the sidebar and the mobile strip.
  useEffect(() => {
    if (!selected) return;
    for (const root of [listRef.current, stripRef.current]) {
      root?.querySelector<HTMLElement>(`[data-slug="${selected}"]`)?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    }
  }, [selected, tab]);

  const pick = (slug: string) => { setSelected(slug); setTab("map"); };

  function onPosition(p: GeolocationPosition) {
    const u = { lat: p.coords.latitude, lng: p.coords.longitude };
    setUser(u);
    setGeo("granted");
    setMapView({ key: Date.now(), center: [u.lat, u.lng], zoom: 13 });
  }

  function locate() {
    if (!navigator.geolocation) return setGeo("unsupported");
    setGeo("locating");
    navigator.geolocation.getCurrentPosition(onPosition, () => setGeo("denied"), { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
  }

  // Default behaviour: open on the visitor's own location (needs HTTPS or localhost).
  useEffect(() => {
    if (!navigator.geolocation) { queueMicrotask(() => setGeo("unsupported")); return; }
    navigator.geolocation.getCurrentPosition(onPosition, () => setGeo("denied"), { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
  }, []);

  const nearest = list[0];
  const farAway = geo === "granted" && !!nearest && nearest.km > NEARBY_KM;
  const showNearest = () =>
    nearest && user && setMapView({ key: Date.now(), bounds: [[user.lat, user.lng], [nearest.s.lat, nearest.s.lng]] });
  const recenter = () => (user ? setMapView({ key: Date.now(), center: [user.lat, user.lng], zoom: 14 }) : locate());

  const status =
    geo === "locating" ? "Finding your location…"
    : geo === "denied" ? "Location blocked — showing distances from Abuja"
    : geo === "unsupported" ? "Location not supported — showing Abuja"
    : `${list.length} store${list.length === 1 ? "" : "s"} · distances from you`;

  return (
    <div className="flex h-[calc(100dvh-11rem)] min-h-[520px] flex-col lg:flex-row">
      <aside className={`${tab === "list" ? "flex" : "hidden"} min-h-0 flex-1 flex-col bg-white lg:flex lg:w-[420px] lg:flex-none lg:border-r lg:border-neutral-200`}>
        <div className="space-y-3 p-4 pb-2">
          <h1 className="hidden text-xl font-bold text-neutral-800 lg:block">Stores near you</h1>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a product, store or area…" aria-label="Search stores" className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-corisio-yellow/70" />
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {siteConfig.categories.map((c) => (
              <button key={c.slug} onClick={() => setCategory(c.slug)} aria-pressed={category === c.slug} className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition ${category === c.slug ? "bg-corisio-blue text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}>{c.label}</button>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <button onClick={locate} className="font-semibold text-corisio-blue hover:underline">◎ Update my location</button>
            <span aria-live="polite">{status}</span>
          </div>
        </div>
        {(farAway || geo === "denied") && (
          <div className="mx-4 mb-1 rounded-lg bg-corisio-yellow/15 p-3 text-xs text-neutral-700">
            {farAway ? (
              <>No Corisio stores within {NEARBY_KM} km of you yet — the closest is <b>{nearest.s.name}</b>, {fmtKm(nearest.km)} away.{" "}
                <button onClick={() => { showNearest(); setTab("map"); }} className="font-semibold text-corisio-blue underline">Show on map</button></>
            ) : (
              <>Allow location access in your browser to see stores around you.{" "}
                <button onClick={locate} className="font-semibold text-corisio-blue underline">Try again</button></>
            )}
          </div>
        )}
        <ul ref={listRef} className="min-h-0 flex-1 space-y-2.5 overflow-y-auto overscroll-contain p-4 pt-2">
          {list.length === 0 && <li className="p-6 text-center text-sm text-neutral-500">No stores match that search.</li>}
          {list.map((it) => (
            <li key={it.s.slug}><ListCard {...it} active={it.s.slug === selected} onPick={() => pick(it.s.slug)} /></li>
          ))}
        </ul>
      </aside>

      <section className={`${tab === "map" ? "block" : "hidden"} relative min-h-0 flex-1 lg:block`} aria-label="Map of nearby stores">
        <StoreMap stores={list.map((x) => x.s)} selectedSlug={selected} onSelect={setSelected} center={origin} user={user} view={view} />
        <button onClick={recenter} aria-label="Centre map on my location" title="My location" className="absolute right-2.5 top-[5.5rem] z-[500] flex size-[34px] items-center justify-center rounded border-2 border-black/20 bg-white text-lg text-corisio-blue shadow hover:bg-neutral-50">◎</button>
        {geo === "locating" && <div className="absolute left-1/2 top-3 z-[500] -translate-x-1/2 rounded-full bg-white px-4 py-1.5 text-xs font-medium text-neutral-700 shadow-lg">Finding your location…</div>}
        {farAway && !active && <button onClick={showNearest} className="absolute left-1/2 top-3 z-[500] -translate-x-1/2 rounded-full bg-corisio-blue px-4 py-2 text-xs font-semibold text-white shadow-lg">Closest store is {fmtKm(nearest.km)} away · Show</button>}

        {!active && list.length > 0 && (
          <div ref={stripRef} className="absolute inset-x-0 bottom-20 z-[400] flex snap-x gap-3 overflow-x-auto overscroll-x-contain px-4 pb-1 lg:hidden">
            {list.map((it) => <StripCard key={it.s.slug} {...it} active={false} onPick={() => setSelected(it.s.slug)} />)}
          </div>
        )}
        {active && <Briefing store={active.s} km={active.km} onClose={() => setSelected(null)} />}
      </section>

      {/* Mobile map/list toggle */}
      <div className={`fixed bottom-5 left-1/2 z-[600] -translate-x-1/2 lg:hidden ${active && tab === "map" ? "hidden" : ""}`}>
        <div className="flex rounded-full bg-corisio-blue p-1 text-xs font-semibold text-white shadow-xl" role="group" aria-label="View">
          {(["map", "list"] as const).map((v) => (
            <button key={v} onClick={() => setTab(v)} aria-pressed={tab === v} className={`rounded-full px-5 py-2 capitalize ${tab === v ? "bg-corisio-yellow text-corisio-blue" : ""}`}>{v}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
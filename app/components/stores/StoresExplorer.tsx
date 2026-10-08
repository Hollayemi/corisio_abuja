"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { siteConfig } from "@/app/config/site";
import {
  ABUJA_CENTER,
  distanceKm,
  FALLBACK_STORE_IMAGE,
  formatKm,
  formatNaira,
  isStoreOpen,
  todayHoursLabel,
  type LatLng,
} from "@/app/utils/geo";
import { useUserLocation } from "@/lib/location/hooks";
import { getErrorMessage } from "@/redux/config/errors";
import { useListPublicStoresQuery } from "@/redux/slices/publicStoresApi";
import type { PublicStore, PublicStoreLocation } from "@/redux/types";

import type { MapView } from "./StoreMap";

const StoreMap = dynamic(() => import("./StoreMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-neutral-200" />,
});

/** The store, plus the location of it that is closest to the visitor and how far that is. */
type Item = { s: PublicStore; loc: PublicStoreLocation; km: number };
type Geo = "locating" | "granted" | "denied" | "unsupported" | "failed";

const NEARBY_KM = 30;
const SEARCH_DEBOUNCE_MS = 300;

/** Closest of a store's locations. Trusts the API's distance, falls back to working it out here. */
function nearest(s: PublicStore, origin: LatLng): { loc: PublicStoreLocation; km: number } | null {
  let best: { loc: PublicStoreLocation; km: number } | null = null;
  for (const loc of s.locations) {
    const km = loc.distanceKm ?? distanceKm(origin, { lat: loc.latitude, lng: loc.longitude });
    if (!best || km < best.km) best = { loc, km };
  }
  return best;
}

function useDebounced<T>(value: T, ms: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

/* eslint-disable @next/next/no-img-element */

const coverOf = (s: PublicStore) => s.banner || s.logo || FALLBACK_STORE_IMAGE;

function OpenBadge({ store }: { store: PublicStore }) {
  const open = isStoreOpen(store);
  if (open === null) return null;
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${open ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>
      {open ? "Open" : "Closed"}
    </span>
  );
}

function Rating({ store }: { store: PublicStore }) {
  if (store.rating == null) return null;
  return <>★ {store.rating.toFixed(1)}{store.reviewCount ? ` (${store.reviewCount})` : ""}</>;
}

function Briefing({ item, onClose }: { item: Item; onClose: () => void }) {
  const { s: store, loc, km } = item;
  const hours = todayHoursLabel(store);
  return (
    <div className="absolute inset-x-0 bottom-0 z-[500] max-h-[75%] overflow-y-auto overscroll-contain rounded-t-2xl bg-white shadow-2xl sm:inset-x-auto sm:bottom-4 sm:left-4 sm:w-[380px] sm:rounded-2xl">
      <button onClick={onClose} aria-label="Close briefing" className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-white/90 text-neutral-600 shadow hover:bg-white">✕</button>
      <img src={coverOf(store)} alt={store.name} className="mb-4 h-36 w-full rounded-t-2xl object-cover" />
      <div className="p-5 ">
      {store.categories[0] && <span className="text-[11px] font-semibold uppercase tracking-wide text-corisio-blue/70">{store.categories[0].name}</span>}
        <h2 className="mt-1 text-lg font-bold text-neutral-800">{store.name}</h2>
        {store.tagline && <p className="mt-1 text-sm text-neutral-500">{store.tagline}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <OpenBadge store={store} />
          {hours && <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-neutral-600">{hours}</span>}
          {store.rating != null && <span className="rounded-full bg-corisio-yellow/15 px-2.5 py-0.5 font-medium text-neutral-700"><Rating store={store} /></span>}
          <span className="rounded-full bg-corisio-blue/10 px-2.5 py-0.5 font-medium text-corisio-blue">{formatKm(km)}</span>
        </div>
        <p className="mt-3 text-sm text-neutral-600">📍 {store.locations.length > 1 ? `${loc.label}: ` : ""}{loc.address}</p>
        {store.locations.length > 1 && <p className="mt-1 text-xs text-neutral-400">{store.locations.length} locations · see them all on the store page</p>}
        {store.topProducts.length > 0 && (
          <>
            <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-400">Popular here</h3>
            <ul className="mt-1 divide-y divide-neutral-100 text-sm">
              {store.topProducts.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-1.5">
                  {p.image ? <img src={p.image} alt="" className="size-9 rounded-md bg-neutral-50 object-contain" /> : <span className="size-9 rounded-md bg-neutral-100" />}
                  <span className="flex-1 text-neutral-700">{p.name}</span>
                  <span className="font-semibold text-neutral-800">{formatNaira(p.price)}</span>
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="mt-5 flex gap-2">
          <Link href={`/stores/${store.slug}`} className="flex-1 rounded-lg bg-corisio-blue px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-corisio-blue/90">View store</Link>
          <a href={`https://www.openstreetmap.org/directions?to=${loc.latitude}%2C${loc.longitude}`} target="_blank" rel="noreferrer" className="rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50">Directions</a>
        </div>
      </div>
    </div>
  );
}

/** Large list card (desktop sidebar + mobile list view). */
function ListCard({ s, loc, km, active, onPick }: Item & { active: boolean; onPick: () => void }) {
  const top = s.topProducts[0];
  return (
    <button data-slug={s.slug} onClick={onPick} aria-current={active} className={`flex w-full gap-3 rounded-xl border p-2.5 text-left transition hover:shadow-md ${active ? "border-corisio-yellow bg-corisio-yellow/10" : "border-neutral-200 bg-white"}`}>
      <img src={coverOf(s)} alt="" className="size-24 shrink-0 rounded-lg object-cover" />
      <div className="min-w-0 flex-1 py-0.5">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-neutral-800">{s.name}</span>
          <span className="shrink-0 text-xs font-semibold text-corisio-blue">{formatKm(km)}</span>
        </div>
        <p className="mt-0.5 truncate text-xs text-neutral-500">{[s.categories[0]?.name, loc.region].filter(Boolean).join(" · ")}</p>
        <div className="mt-1.5 flex items-center gap-2 text-xs"><OpenBadge store={s} /><span className="text-neutral-600"><Rating store={s} /></span></div>
        {top && <p className="mt-1.5 truncate text-xs text-neutral-500">{top.name} · <b className="text-neutral-700">{formatNaira(top.price)}</b></p>}
      </div>
    </button>
  );
}

/** Compact swipeable card shown over the map on mobile. */
function StripCard({ s, loc, km, active, onPick }: Item & { active: boolean; onPick: () => void }) {
  return (
    <button data-slug={s.slug} onClick={onPick} className={`flex w-[250px] shrink-0 snap-center items-center gap-3 rounded-xl p-2 text-left shadow-lg ${active ? "bg-corisio-yellow" : "bg-white"}`}>
      <img src={coverOf(s)} alt="" className="size-14 shrink-0 rounded-lg object-cover" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-neutral-800">{s.name}</p>
        <p className="truncate text-xs text-neutral-600">{formatKm(km)}{s.rating != null && ` · ★ ${s.rating.toFixed(1)}`} · {loc.region}</p>
      </div>
    </button>
  );
}

function ListSkeleton() {
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <li key={i} aria-hidden="true" className="h-[108px] animate-pulse rounded-xl bg-neutral-100" />
      ))}
    </>
  );
}

export default function StoresExplorer() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedLoc, setSelectedLoc] = useState<string | null>(null);
  const [view, setMapView] = useState<MapView | undefined>();
  const [tab, setTab] = useState<"map" | "list">("map"); // mobile only
  const listRef = useRef<HTMLUListElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  // The visitor's location. Every request below already carries it (X-User-Lat / X-User-Lng),
  // so the API answers nearest first; nothing here passes coordinates to the query.
  const { location, status, locate } = useUserLocation();
  const user = useMemo<LatLng | null>(
    () => (location ? { lat: location.latitude, lng: location.longitude } : null),
    [location],
  );
  const origin = user ?? ABUJA_CENTER;

  const search = useDebounced(query.trim(), SEARCH_DEBOUNCE_MS);
  const stores = useListPublicStoresQuery({
    search: search || undefined,
    category: category === "all" ? undefined : category,
    limit: 100,
  });

  const list = useMemo<Item[]>(() => {
    const items: Item[] = [];
    for (const s of stores.data?.data.items ?? []) {
      const near = nearest(s, origin);
      if (near) items.push({ s, ...near });
    }
    return items.sort((a, b) => a.km - b.km);
  }, [stores.data, origin]);

  const active = list.find((x) => x.s.slug === selected);
  // The branch that was clicked on the map, otherwise the closest one
  const activeItem = useMemo<Item | undefined>(() => {
    if (!active) return undefined;
    const picked = active.s.locations.find((l) => l.id === selectedLoc);
    if (!picked) return active;
    return {
      ...active,
      loc: picked,
      km: picked.distanceKm ?? distanceKm(origin, { lat: picked.latitude, lng: picked.longitude }),
    };
  }, [active, selectedLoc, origin]);

  // Keep the selected store visible in the sidebar and the mobile strip.
  useEffect(() => {
    if (!selected) return;
    for (const root of [listRef.current, stripRef.current]) {
      root?.querySelector<HTMLElement>(`[data-slug="${selected}"]`)?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    }
  }, [selected, tab]);

  const pick = (slug: string) => { setSelected(slug); setSelectedLoc(null); setTab("map"); };
  const pickOnMap = (slug: string | null, locationId?: string) => { setSelected(slug); setSelectedLoc(locationId ?? null); };

  async function findMe() {
    const loc = await locate();
    if (loc) setMapView({ key: Date.now(), center: [loc.latitude, loc.longitude], zoom: 13 });
  }

  // Default behaviour: open on the visitor's own location (needs HTTPS or localhost).
  // If we already know where they are the map starts there; this just refreshes it.
  useEffect(() => {
    let cancelled = false;
    locate().then((loc) => {
      if (!cancelled && loc) setMapView({ key: Date.now(), center: [loc.latitude, loc.longitude], zoom: 13 });
    });
    return () => {
      cancelled = true;
    };
  }, [locate]);

  const geo: Geo = location
    ? "granted"
    : status === "denied" ? "denied"
      : status === "unsupported" ? "unsupported"
        : status === "error" ? "failed"
          : "locating";

  const nearestItem = list[0];
  const farAway = geo === "granted" && !!nearestItem && nearestItem.km > NEARBY_KM;
  const showNearest = () =>
    nearestItem && user && setMapView({ key: Date.now(), bounds: [[user.lat, user.lng], [nearestItem.loc.latitude, nearestItem.loc.longitude]] });
  const recenter = () => (user ? setMapView({ key: Date.now(), center: [user.lat, user.lng], zoom: 14 }) : void findMe());

  const loadingFirst = stores.isLoading;
  const status_ =
    geo === "locating" ? "Finding your location…"
      : geo === "denied" ? "Location blocked — showing distances from Abuja"
        : geo === "unsupported" ? "Location not supported — showing Abuja"
          : geo === "failed" ? "Couldn't get your location — showing distances from Abuja"
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
            <button onClick={() => void findMe()} className="font-semibold text-corisio-blue hover:underline">◎ Update my location</button>
            <span aria-live="polite">{loadingFirst ? "Loading stores…" : status_}</span>
          </div>
        </div>
        {(farAway || geo === "denied" || geo === "failed") && (
          <div className="mx-4 mb-1 rounded-lg bg-corisio-yellow/15 p-3 text-xs text-neutral-700">
            {farAway ? (
              <>No Corisio stores within {NEARBY_KM} km of you yet — the closest is <b>{nearestItem.s.name}</b>, {formatKm(nearestItem.km)} away.{" "}
                <button onClick={() => { showNearest(); setTab("map"); }} className="font-semibold text-corisio-blue underline">Show on map</button></>
            ) : (
              <>{geo === "failed" ? "We couldn't get your location." : "Allow location access in your browser to see stores around you."}{" "}
                <button onClick={() => void findMe()} className="font-semibold text-corisio-blue underline">Try again</button></>
            )}
          </div>
        )}
        <ul ref={listRef} className="min-h-0 flex-1 space-y-2.5 overflow-y-auto overscroll-contain p-4 pt-2">
          {loadingFirst && <ListSkeleton />}
          {stores.isError && !stores.data && (
            <li role="alert" className="p-6 text-center text-sm text-neutral-600">
              {getErrorMessage(stores.error)}{" "}
              <button onClick={() => stores.refetch()} className="font-semibold text-corisio-blue underline">Try again</button>
            </li>
          )}
          {!loadingFirst && !stores.isError && list.length === 0 && <li className="p-6 text-center text-sm text-neutral-500">No stores match that search.</li>}
          {list.map((it) => (
            <li key={it.s.slug}><ListCard {...it} active={it.s.slug === selected} onPick={() => pick(it.s.slug)} /></li>
          ))}
        </ul>
      </aside>

      <section className={`${tab === "map" ? "block" : "hidden"} relative min-h-0 flex-1 lg:block`} aria-label="Map of nearby stores">
        <StoreMap stores={list.map((x) => x.s)} selectedSlug={selected} selectedLocationId={selectedLoc} onSelect={pickOnMap} center={origin} user={user} view={view} />
        <button onClick={recenter} aria-label="Centre map on my location" title="My location" className="absolute right-2.5 top-[5.5rem] z-[500] flex size-[34px] items-center justify-center rounded border-2 border-black/20 bg-white text-lg text-corisio-blue shadow hover:bg-neutral-50">◎</button>
        {geo === "locating" && <div className="absolute left-1/2 top-3 z-[500] -translate-x-1/2 rounded-full bg-white px-4 py-1.5 text-xs font-medium text-neutral-700 shadow-lg">Finding your location…</div>}
        {farAway && !active && <button onClick={showNearest} className="absolute left-1/2 top-3 z-[500] -translate-x-1/2 rounded-full bg-corisio-blue px-4 py-2 text-xs font-semibold text-white shadow-lg">Closest store is {formatKm(nearestItem.km)} away · Show</button>}

        {!active && list.length > 0 && (
          <div ref={stripRef} className="absolute inset-x-0 bottom-20 z-[400] flex snap-x gap-3 overflow-x-auto overscroll-x-contain px-4 pb-1 lg:hidden">
            {list.map((it) => <StripCard key={it.s.slug} {...it} active={false} onPick={() => pick(it.s.slug)} />)}
          </div>
        )}
        {activeItem && <Briefing item={activeItem} onClose={() => { setSelected(null); setSelectedLoc(null); }} />}
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

import { distanceKm } from "@/app/utils/geo";

/**
 * Where the visitor is, kept in one place so every API request can carry it.
 *
 *  - The browser's location is saved in localStorage (like the cart), so a visit to
 *    the map also helps the shop and search pages on the next page load.
 *  - axiosBaseQuery reads it at send time and adds `X-User-Lat` / `X-User-Lng` to
 *    every request (see redux/config/axiosBaseQuery.ts). The backend uses them to
 *    sort stores and products by distance.
 *  - Coordinates are rounded to 4 decimals (about 11 m) before they are saved or sent.
 *    That is plenty for "closest store" and stops the exact spot being sent around.
 *
 * Same shape as lib/auth/token.ts: plain functions plus subscribe(), so it works
 * outside React too (the axios interceptor) and inside it (see ./hooks.ts).
 */

export type UserLocation = {
  latitude: number;
  longitude: number;
  /** Metres, when the device says */
  accuracy?: number;
  /** "device" = the browser's location. "manual" is for a future "set my area" picker. */
  source: "device" | "manual";
};

export type LocateStatus = "idle" | "locating" | "denied" | "unsupported" | "error";

export const LOCATION_HEADERS = { lat: "X-User-Lat", lng: "X-User-Lng" } as const;

const STORAGE_KEY = "corisio:location:v1";
/** A saved location older than this is treated as unknown, people move. */
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
/** Moving less than this is GPS jitter, not a new location: no refetch. */
const MIN_MOVE_KM = 0.15;

type Saved = UserLocation & { savedAt: number };

type Listener = () => void;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l());

/** undefined = not read from storage yet */
let current: Saved | null | undefined;
let status: LocateStatus = "idle";
let inFlight: Promise<UserLocation | null> | null = null;
let storageHooked = false;

const round = (n: number) => Math.round(n * 1e4) / 1e4;

function isValid(lat: unknown, lng: unknown): lat is number {
  return (
    typeof lat === "number" && typeof lng === "number" &&
    Number.isFinite(lat) && Number.isFinite(lng) &&
    Math.abs(lat) <= 90 && Math.abs(lng) <= 180
  );
}

function parse(raw: string | null): Saved | null {
  if (!raw) return null;
  try {
    const d = JSON.parse(raw) as Partial<Saved>;
    if (!isValid(d.latitude, d.longitude) || typeof d.savedAt !== "number") return null;
    return {
      latitude: d.latitude,
      longitude: d.longitude as number,
      accuracy: typeof d.accuracy === "number" ? d.accuracy : undefined,
      source: d.source === "manual" ? "manual" : "device",
      savedAt: d.savedAt,
    };
  } catch {
    return null;
  }
}

function persist(value: Saved | null) {
  try {
    if (value) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be blocked (private mode); the location still works in memory.
  }
}

function load(): Saved | null {
  try {
    return parse(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function hookStorage() {
  if (storageHooked || typeof window === "undefined") return;
  storageHooked = true;
  // Another tab found (or cleared) the location
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY) return;
    current = parse(e.newValue);
    emit();
  });
}

/* ------------------------------------------------------------------ */
/* Reading                                                             */
/* ------------------------------------------------------------------ */

/**
 * The saved location, or null. The same object is returned until the location
 * really changes, which useSyncExternalStore needs.
 */
export function readLocation(): UserLocation | null {
  if (typeof window === "undefined") return null;
  if (current === undefined) current = load();
  if (current && Date.now() - current.savedAt > MAX_AGE_MS) current = null;
  return current;
}

export const getLocateStatus = () => status;

export function subscribeLocation(listener: Listener) {
  hookStorage();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** How long ago the location was last confirmed (ms), or Infinity when there is none. */
export function locationAgeMs(): number {
  readLocation();
  return current ? Date.now() - current.savedAt : Infinity;
}

/** The two headers that go on every API request, or {} when the location is unknown. */
export function locationHeaders(): Record<string, string> {
  const loc = readLocation();
  if (!loc) return {};
  return {
    [LOCATION_HEADERS.lat]: String(round(loc.latitude)),
    [LOCATION_HEADERS.lng]: String(round(loc.longitude)),
  };
}

/* ------------------------------------------------------------------ */
/* Writing                                                             */
/* ------------------------------------------------------------------ */

export function writeLocation(
  latitude: number,
  longitude: number,
  options: { accuracy?: number; source?: UserLocation["source"] } = {},
): UserLocation | null {
  if (typeof window === "undefined" || !isValid(latitude, longitude)) return null;

  const source = options.source ?? "device";
  const prev = readLocation();
  const next: Saved = {
    latitude: round(latitude),
    longitude: round(longitude),
    accuracy: options.accuracy,
    source,
    savedAt: Date.now(),
  };

  // Same place (GPS wobble): remember that it was confirmed just now, but don't tell
  // anyone it changed, otherwise every refresh would refetch every list on the page.
  if (
    prev && prev.source === source &&
    distanceKm({ lat: prev.latitude, lng: prev.longitude }, { lat: next.latitude, lng: next.longitude }) < MIN_MOVE_KM
  ) {
    // Same object, so React sees no change
    (current as Saved).savedAt = next.savedAt;
    persist(current as Saved);
    return current as Saved;
  }

  current = next;
  persist(next);
  emit();
  return next;
}

export function clearLocation() {
  if (typeof window === "undefined") return;
  current = null;
  persist(null);
  emit();
}

/* ------------------------------------------------------------------ */
/* Asking the browser                                                  */
/* ------------------------------------------------------------------ */

function setStatus(next: LocateStatus) {
  if (status === next) return;
  status = next;
  emit();
}

/**
 * Asks the browser where the visitor is (needs HTTPS or localhost). Asking twice at
 * once shares one request. Resolves with the location, or null if it couldn't be found:
 * check getLocateStatus() to see why.
 */
export function requestLocation(): Promise<UserLocation | null> {
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
    setStatus("unsupported");
    return Promise.resolve(null);
  }
  if (inFlight) return inFlight;

  setStatus("locating");
  inFlight = new Promise<UserLocation | null>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const saved = writeLocation(pos.coords.latitude, pos.coords.longitude, { accuracy: pos.coords.accuracy });
        setStatus("idle");
        resolve(saved);
      },
      (err) => {
        setStatus(err.code === 1 ? "denied" : "error");
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    );
  }).finally(() => {
    inFlight = null;
  });
  return inFlight;
}

/** "granted" means we can read the location without a pop-up. "unknown" = the browser can't say. */
export async function locationPermission(): Promise<"granted" | "denied" | "prompt" | "unknown"> {
  try {
    if (!navigator.permissions) return "unknown";
    return (await navigator.permissions.query({ name: "geolocation" })).state;
  } catch {
    return "unknown";
  }
}

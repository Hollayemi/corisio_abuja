import type { DayKey, OpeningHours } from "@/redux/types";

export const ABUJA_CENTER = { lat: 9.0765, lng: 7.4986 };

/** Shown when a store has neither a cover photo nor a logo. */
export const FALLBACK_STORE_IMAGE = "/images/market.webp";

export type LatLng = { lat: number; lng: number };

/** Haversine distance in km, computed locally, no Maps API call needed. */
export function distanceKm(a: LatLng, b: LatLng) {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function formatKm(km: number): string {
  if (km < 1) return `${Math.round(km * 10) * 100} m`;
  if (km < 100) return `${km.toFixed(1)} km`;
  return `${Math.round(km).toLocaleString()} km`;
}

export const formatNaira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

/* ------------------------------------------------------------------ */
/* Opening hours                                                       */
/* ------------------------------------------------------------------ */

type HoursSource = { openingHours?: OpeningHours | null; timezone?: string | null; isOpen?: boolean | null };

/** Weekday and "HH:mm" in the store's own time zone, so a shopper abroad still gets the right answer. */
function clockIn(timezone: string | null | undefined, now: Date): { day: DayKey; time: string } {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone || "Africa/Lagos",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(now);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
    return { day: get("weekday").slice(0, 3).toLowerCase() as DayKey, time: `${get("hour")}:${get("minute")}` };
  } catch {
    return { day: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][now.getDay()] as DayKey, time: now.toTimeString().slice(0, 5) };
  }
}

/** true / false, or null when the store hasn't said (then no badge is shown). */
export function isStoreOpen(store: HoursSource, now = new Date()): boolean | null {
  if (store.openingHours) {
    const { day, time } = clockIn(store.timezone, now);
    const today = store.openingHours[day];
    if (!today) return null;
    return !today.closed && time >= today.open && time < today.close;
  }
  return typeof store.isOpen === "boolean" ? store.isOpen : null;
}

/** "08:00–20:00", "24 hrs", "Closed today", or null when there are no hours. */
export function todayHoursLabel(store: HoursSource, now = new Date()): string | null {
  if (!store.openingHours) return null;
  const today = store.openingHours[clockIn(store.timezone, now).day];
  if (!today) return null;
  if (today.closed) return "Closed today";
  if (today.open === "00:00" && (today.close === "23:59" || today.close === "24:00")) return "24 hrs";
  return `${today.open}–${today.close}`;
}

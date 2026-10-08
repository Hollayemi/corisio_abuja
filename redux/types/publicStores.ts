import type { OpeningHours, StoreSocialLinks } from "./storeProfile";

/**
 * Public stores: what the /stores map and the store page show to shoppers.
 * Read-only. The store owner edits the source of this in Settings -> Profile
 * (see storeProfile.ts).
 *
 * Distances: when a request carries the visitor's location (the X-User-Lat and
 * X-User-Lng headers added by axiosBaseQuery) the backend fills in `distanceKm` and
 * sorts nearest first. Without it, `distanceKm` is null.
 */

/** One place a store can be visited: its main location or a branch (StoreAddress). */
export type PublicStoreLocation = {
  /** StoreLocation.id or StoreAddress.id */
  id: string;
  /** "Main", "Ikeja Branch" */
  label: string;
  address: string;
  region: string;
  latitude: number;
  longitude: number;
  phone?: string | null;
  /** km from the visitor. Null when the request didn't carry their location. */
  distanceKm?: number | null;
};

export type PublicStoreCategory = {
  slug: string;
  name: string;
};

export type PublicStoreProduct = {
  id: string;
  slug: string;
  name: string;
  /** What to charge now (the promo price when there is one) */
  price: number;
  image?: string | null;
};

export type PublicStore = {
  id: string;
  slug: string;
  name: string;
  tagline?: string | null;
  /** The round pin on the map */
  logo?: string | null;
  /** The cover photo at the top of the map card */
  banner?: string | null;
  categories: PublicStoreCategory[];
  /** Closest to the visitor first. With no location sent, the main location first. */
  locations: PublicStoreLocation[];
  /** IANA name of the main location, so "open now" is right for the store, not the visitor */
  timezone?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  openingHours?: OpeningHours | null;
  /** Used when the backend sends no openingHours. Otherwise the browser works it out. */
  isOpen?: boolean | null;
  /** A few best sellers for the map card */
  topProducts: PublicStoreProduct[];
};

/** GET /catalog/stores/:slug */
export type PublicStoreDetail = PublicStore & {
  description?: string | null;
  email?: string | null;
  socialLinks?: StoreSocialLinks | null;
  /** A page of the store's products */
  products: PublicStoreProduct[];
};

export type ListPublicStoresParams = {
  /** Matches store name, area, category or a product name */
  search?: string;
  /** Category slug; omit for every category */
  category?: string;
  /** Only stores with a location within this many km of the visitor (needs their location) */
  radiusKm?: number;
  /** "nearest" (default when a location is sent) | "popular" (most orders first) | "rating" */
  sort?: "nearest" | "popular" | "rating";
  /** Default 100 */
  limit?: number;
};

export type PublicStoreList = {
  items: PublicStore[];
};

/**
 * Store profile shapes (what a store owner edits from Settings -> Profile).
 * Mirrors the Prisma models Store, StoreLocation and StoreAddress. StoreSettings
 * (pickup, delivery, minimum order, returns) is NOT here on purpose: it has its own screen.
 *
 * Fields marked "NEW" don't exist in the Prisma schema yet, see STORE_PROFILE_SCHEMA.prisma.
 */

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type OpeningDay = {
  closed: boolean;
  /** "08:00" (24-hour) */
  open: string;
  /** "20:00" (24-hour) */
  close: string;
};

/** NEW: Store.openingHours (Json). Drives the Open / Closed badge on the stores map. */
export type OpeningHours = Record<DayKey, OpeningDay>;

/** NEW: Store.socialLinks (Json). Every value is a full https link, or "" when not set. */
export type StoreSocialLinks = {
  website?: string;
  instagram?: string;
  facebook?: string;
  x?: string;
};

/** StoreLocation: the primary pickup / dispatch point, shown as the pin on the map. */
export type StoreLocation = {
  id: string;
  label: string;
  address: string;
  region: string;
  country: string;
  phone?: string | null;
  latitude: number;
  longitude: number;
  /** IANA name, e.g. "Africa/Lagos" */
  timezone: string;
};

/** GET /stores/:storeId/profile */
export type StoreProfile = {
  id: string;
  /** Used in the store's link. Read-only here, changing it would break shared links. */
  slug: string;
  name: string;
  legalName?: string | null;
  description?: string | null;
  /** NEW: Store.tagline, the one-liner under the name on the map card. */
  tagline?: string | null;
  logo?: string | null;
  /** The cover photo. Shown at the top of the map card and on the store page. */
  banner?: string | null;
  email: string;
  phone: string;
  /** NEW: Store.whatsapp */
  whatsapp?: string | null;
  /** PENDING until the platform approves the store. Read-only here. */
  status: string;
  orderPrefix: string;
  /** Read-only here: changing it with products and orders on file would corrupt prices. */
  currency: string;
  socialLinks?: StoreSocialLinks | null;
  openingHours?: OpeningHours | null;
  location: StoreLocation | null;
  updatedAt: string;
};

/**
 * PATCH /stores/:storeId/profile (JSON). Send only what changed.
 * Send "" to clear an optional text field (the backend stores null).
 */
export type UpdateStoreProfileRequest = {
  storeId: string;
  name?: string;
  legalName?: string;
  description?: string;
  tagline?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  orderPrefix?: string;
  socialLinks?: StoreSocialLinks;
  openingHours?: OpeningHours;
};

/** PUT /stores/:storeId/location (JSON). Creates the location on first save. */
export type UpdateStoreLocationRequest = {
  storeId: string;
} & Omit<StoreLocation, "id">;

export type StoreMediaKind = "logo" | "banner";

/** POST /stores/:storeId/media/:kind (multipart, field name "file") */
export type UploadStoreMediaRequest = {
  storeId: string;
  kind: StoreMediaKind;
  file: File;
};

export type StoreMediaResult = {
  kind: StoreMediaKind;
  url: string;
};

/** StoreAddress: an extra branch. */
export type StoreBranch = {
  id: string;
  label: string;
  address: string;
  region: string;
  country: string;
  phone?: string | null;
  latitude: number;
  longitude: number;
  isDefault: boolean;
};

export type StoreBranchList = {
  items: StoreBranch[];
};

export type CreateStoreBranchRequest = {
  storeId: string;
} & Omit<StoreBranch, "id">;

export type UpdateStoreBranchRequest = {
  storeId: string;
  id: string;
} & Partial<Omit<StoreBranch, "id">>;

export type DeleteStoreBranchRequest = {
  storeId: string;
  id: string;
};

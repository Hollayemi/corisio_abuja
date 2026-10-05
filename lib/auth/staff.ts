import { SignupAccountType, type StoreMembership, type User } from "@/redux/types";

/**
 * Small helpers shared by the sign in / invite pages, the dashboard layout and
 * the auth forms. Everything that decides "where does this person go" lives
 * here, so changing a route or a role name is a one-file edit.
 */

/** Where the store owner's / staff dashboard lives. */
export const DASHBOARD_PATH = "/dashboard";
/** The dashboard's own sign in page (and its invite page below it). */
export const DASHBOARD_AUTH_PATH = `${DASHBOARD_PATH}/auth`;
/** The store profile form a new STORE_OWNER lands on. */
export const STORE_SETUP_PATH = "/store/setup";

/** Roles that are ordinary shoppers or store users, not platform staff. */
const NON_STAFF_ROLES = new Set(["customer", "has_store"]);

/**
 * Platform staff: anyone whose role isn't a customer / store-user role.
 * (Tighten this to an explicit list if you want per-role access later.)
 */
export function isStaffRole(role?: string | null) {
  const value = role?.trim().toLowerCase();
  return !!value && !NON_STAFF_ROLES.has(value);
}

/** The stores this person belongs to (own or otherwise). */
export const storeMemberships = (user?: User | null): StoreMembership[] =>
  user?.memberships ?? [];

/** The store the dashboard opens on: the first membership. */
export const primaryStore = (user?: User | null) => storeMemberships(user)[0] ?? null;

/** Belongs to at least one store (any status, including PENDING). */
export const hasStore = (user?: User | null) =>
  !!user && (storeMemberships(user).length > 0 || user.role?.trim().toLowerCase() === "has_store");

/** Signed up as a store owner, but hasn't created the store yet. */
export const needsStoreSetup = (user?: User | null) =>
  !!user && !hasStore(user) && user.pendingAccountType === SignupAccountType.STORE_OWNER;

/** Who may open the dashboard: platform staff, and anyone with a store. */
export const canAccessDashboard = (user?: User | null) =>
  !!user && (isStaffRole(user.role) || hasStore(user));

/**
 * Where to send someone right after they sign in or register.
 * Returns null when they should stay where they are (plain customers).
 */
export function postAuthPath(user?: User | null): string | null {
  if (needsStoreSetup(user)) return STORE_SETUP_PATH;
  if (canAccessDashboard(user)) return DASHBOARD_PATH;
  return null;
}

/** "operations_manager" / "OPERATIONS-MANAGER" -> "Operations Manager" */
export function formatRole(role: string) {
  return role
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** "a" / "an" in front of a role name: "an Operations Manager" */
export function withArticle(label: string) {
  return `${/^[aeiou]/i.test(label) ? "an" : "a"} ${label}`;
}

export function firstName(name?: string | null, fallback = "there") {
  return name?.trim().split(/\s+/)[0] || fallback;
}

/** Only ever send people to a page inside the dashboard (never an outside URL). */
export function safeDashboardPath(raw?: string | string[]) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (
    !value ||
    !(value === DASHBOARD_PATH || value.startsWith(`${DASHBOARD_PATH}/`)) ||
    value.startsWith("//") ||
    value.startsWith(DASHBOARD_AUTH_PATH)
  ) {
    return DASHBOARD_PATH;
  }
  return value;
}

export const NO_DASHBOARD_ACCESS = "This account doesn't have access to the dashboard.";

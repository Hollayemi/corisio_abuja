/** Small helpers shared by the admin sign in / invite pages and the admin layout. */

/**
 * Anyone the backend gives a role other than "customer" counts as staff.
 * (Tighten this to an explicit list if you want per-role access later.)
 */
export function isStaffRole(role?: string | null) {
  return !!role && role.trim().toLowerCase() !== "customer";
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

/** Only ever send people to a page inside /admin (never an outside URL). */
export function safeAdminPath(raw?: string | string[]) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (
    !value ||
    !value.startsWith("/admin") ||
    value.startsWith("//") ||
    value.startsWith("/admin/auth")
  ) {
    return "/admin";
  }
  return value;
}

export const NO_ADMIN_ACCESS = "This account doesn't have access to the admin area.";

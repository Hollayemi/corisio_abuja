import type { AdminIconName } from "@/app/components/admin/layout/AdminIcon";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: AdminIconName;
  /** Small count pill next to the label (Orders shows one in the design) */
  badge?: number;
  /** Opens the customer-facing page in a new tab */
  external?: boolean;
};

/**
 * The admin sidebar. Add a page here and it shows up in the menu, and the
 * active highlight follows the URL automatically.
 */
export const adminNav = {
  core: [
    { label: "Overview", href: "/admin", icon: "overview" },
    // TODO: feed the badge from the real number of orders needing attention
    { label: "Orders", href: "/admin/orders", icon: "orders", badge: 0 },
    { label: "Customers", href: "/admin/customers", icon: "customers" },
    { label: "Inventory", href: "/admin/inventory", icon: "inventory" },
    { label: "Promotions", href: "/admin/promotions", icon: "promotions" },
    { label: "Delivery & Schedule", href: "/admin/delivery", icon: "delivery" },
    { label: "Analytics", href: "/admin/analytics", icon: "analytics" },
    { label: "Membership", href: "/admin/membership", icon: "membership" },
  ],
  features: [
    { label: "Meat Box", href: "/meat-box", icon: "meatBox", external: true },
    {
      label: "Freezer Planner",
      href: "/freezer-planner",
      icon: "freezerPlanner",
      external: true,
    },
  ],
  settings: { label: "Settings", href: "/admin/settings", icon: "settings" },
} satisfies {
  core: AdminNavItem[];
  features: AdminNavItem[];
  settings: AdminNavItem;
};

/** "/admin" only matches itself; other items also match their sub pages. */
export function isNavActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

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
    { label: "Overview", href: "/dashboard", icon: "overview" },
    // TODO: feed the badge from the real number of orders needing attention
    { label: "Store", href: "/dashboard/store", icon: "store" },
    { label: "Orders", href: "/dashboard/orders", icon: "orders", badge: 0 },
    { label: "Customers", href: "/dashboard/customers", icon: "customers" },
    { label: "Inventory", href: "/dashboard/inventory", icon: "inventory" },
    { label: "Promotions", href: "/dashboard/promotions", icon: "promotions" },
    { label: "Delivery & Schedule", href: "/dashboard/delivery", icon: "delivery" },
    { label: "Analytics", href: "/dashboard/analytics", icon: "analytics" },
    { label: "Membership", href: "/dashboard/membership", icon: "membership" },
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
  settings: { label: "Settings", href: "/dashboard/settings", icon: "settings" },
} satisfies {
  core: AdminNavItem[];
  features: AdminNavItem[];
  settings: AdminNavItem;
};

/** "/dashboard" only matches itself; other items also match their sub pages. */
export function isNavActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

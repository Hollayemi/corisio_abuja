import type { AdminOrderCustomerBrief, AdminOrderPeriod, AdminOrderStat } from "./adminOrders";

/**
 * Admin Overview ("Business Overview"): the landing page of the admin area.
 * Two requests feed it:
 *
 *   GET /admin/overview                 -> AdminOverview     (everything except Top Selling)
 *   GET /admin/overview/top-products    -> AdminTopProducts  (follows the "This Month" select)
 *
 * Adjust field names here to match the NestJS DTOs.
 */

/* ------------------------------------------------------------------ */
/* Orders this week (the ring and the M-T-W-T-F-S-S bars)              */
/* ------------------------------------------------------------------ */

export type AdminOverviewDay = {
  /** Calendar day, "2026-09-18". Bars for days after today are drawn empty. */
  date: string;
  orders: number;
};

export type AdminOverviewWeek = {
  /** Orders so far this week: the number inside the ring (86). */
  total: number;
  /** All orders last week: the "of 120" under it. The ring fills to total / lastWeekTotal. */
  lastWeekTotal: number;
  /** Monday and Sunday of the week shown, "2026-09-14" and "2026-09-20". */
  rangeStart: string;
  rangeEnd: string;
  /** Seven entries, Monday first. */
  days: AdminOverviewDay[];
};

/* ------------------------------------------------------------------ */
/* The four numbers beside it                                          */
/* ------------------------------------------------------------------ */

/** Each carries a count or % change against last month ("+23 this month"). */
export type AdminOverviewStats = {
  completedOrders: AdminOrderStat;
  /** NGN. */
  totalSales: AdminOrderStat;
  activeCustomers: AdminOrderStat;
  activeMemberships: AdminOrderStat;
};

/* ------------------------------------------------------------------ */
/* The four service cards                                              */
/* ------------------------------------------------------------------ */

export type AdminOverviewMeatBox = {
  activeOrders: number;
  preparing: number;
  awaitingWeight: number;
  /** Ready to show, e.g. "Today: 10:00 AM - 2:00PM". Null when nothing is scheduled. */
  nextDeliveryWindow: string | null;
};

export type AdminOverviewFreezerPlanner = {
  activeOrders: number;
  processing: number;
  recurring: number;
  nextDeliveryWindow: string | null;
};

export type AdminOverviewMembership = {
  activeMembers: number;
  newMembers: number;
  /** Renewals due soon. */
  renewals: number;
  /** NGN. */
  expectedRecurringRevenue: number;
};

export type AdminOverviewInventory = {
  lowStock: number;
  outOfStock: number;
  runningLow: number;
  /** Items that need action right now ("13 items need immediate attention"). */
  immediateAttention: number;
};

export type AdminOverviewModules = {
  meatBox: AdminOverviewMeatBox;
  freezerPlanner: AdminOverviewFreezerPlanner;
  membership: AdminOverviewMembership;
  inventory: AdminOverviewInventory;
};

/* ------------------------------------------------------------------ */
/* Needs your attention                                                */
/* ------------------------------------------------------------------ */

/** What the row is: the "Meat Box" / "Membership" / "Order" / "Freezer Planner" column. */
export type AdminAttentionKind = "SHOP" | "MEAT_BOX" | "FREEZER_PLANNER" | "MEMBERSHIP";

/** Why it is on the list: the coloured pill on the right. */
export type AdminAttentionStatus = "AWAITING_WEIGHT" | "PAYMENT_ISSUE" | "PROCESSING" | "PENDING";

export type AdminAttentionItem = {
  id: string;
  reference: string;
  customer: AdminOrderCustomerBrief & { email: string };
  kind: AdminAttentionKind;
  /** NGN. Null while it can't be known yet (a Meat Box still awaiting its weight). */
  amount: number | null;
  status: AdminAttentionStatus;
  createdAt: string;
};

/* ------------------------------------------------------------------ */
/* The whole summary                                                   */
/* ------------------------------------------------------------------ */

export type AdminOverview = {
  week: AdminOverviewWeek;
  stats: AdminOverviewStats;
  modules: AdminOverviewModules;
  /** The most urgent few, newest first. The page shows what it is given. */
  attention: AdminAttentionItem[];
};

/* ------------------------------------------------------------------ */
/* Top Selling Products                                                */
/* ------------------------------------------------------------------ */

export type GetAdminTopProductsParams = {
  period?: AdminOrderPeriod;
  /** Default 4. */
  limit?: number;
};

export type AdminTopProduct = {
  id: string;
  name: string;
  /** Shown under the name as "#6727811". */
  sku: string;
  image?: string | null;
  /** Units ordered all time: "12,536". */
  totalOrders: number;
  /** Units ordered in the selected period: "2,352 this month". */
  periodOrders: number;
  /** NGN per unit. */
  price: number;
};

export type AdminTopProducts = {
  items: AdminTopProduct[];
};

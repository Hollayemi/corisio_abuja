import type {
  AdminOrderCustomerBrief,
  AdminOrderPeriod,
  AdminOrderStat,
  AdminOrderStatus,
} from "./adminOrders";

/**
 * Admin Overview ("Business Overview"): the landing page of the admin area.
 * Two requests feed it:
 *
 *   GET /admin/overview                 -> AdminOverview     (everything except Top Selling, incl. the two charts)
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
/* The three numbers beside it                                          */
/* ------------------------------------------------------------------ */

/** Each carries a count or % change against last month ("+23 this month"). */
export type AdminOverviewStats = {
  completedOrders: AdminOrderStat;
  /** NGN. */
  totalSales: AdminOrderStat;
  activeCustomers: AdminOrderStat;
};

/* ------------------------------------------------------------------ */
/* The inventory card                                                  */
/* ------------------------------------------------------------------ */

export type AdminOverviewInventory = {
  lowStock: number;
  outOfStock: number;
  runningLow: number;
  /** Items that need action right now ("13 items need immediate attention"). */
  immediateAttention: number;
};

export type AdminOverviewModules = {
  inventory: AdminOverviewInventory;
};

/* ------------------------------------------------------------------ */
/* Charts                                                              */
/* ------------------------------------------------------------------ */

/** One day on the sales chart. */
export type AdminOverviewSalesPoint = {
  /** Calendar day, "2026-10-09". */
  date: string;
  /** NGN taken that day from paid orders. */
  sales: number;
  /** Orders placed that day. */
  orders: number;
};

/** One row of the "Orders by status" chart. */
export type AdminOverviewStatusCount = {
  status: AdminOrderStatus;
  count: number;
};

/* ------------------------------------------------------------------ */
/* Needs your attention                                                */
/* ------------------------------------------------------------------ */

/** What the row is: the "Order" column. */
export type AdminAttentionKind = "SHOP";

/** Why it is on the list: the coloured pill on the right. */
export type AdminAttentionStatus = "PAYMENT_ISSUE" | "PROCESSING" | "PENDING";

export type AdminAttentionItem = {
  id: string;
  reference: string;
  customer: AdminOrderCustomerBrief & { email: string };
  kind: AdminAttentionKind;
  /** NGN. Null while the amount can't be known yet. */
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
  /** Daily sales for the last 30 days, oldest first. The page shows 7 or 30 of them. */
  salesTrend?: AdminOverviewSalesPoint[];
  /** Order counts per status for the current month, in any order. */
  ordersByStatus?: AdminOverviewStatusCount[];
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

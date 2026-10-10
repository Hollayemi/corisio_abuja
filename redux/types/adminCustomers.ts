import type { AdminOrderPeriod, AdminOrderStat } from "./adminOrders";

/**
 * Admin Customers: the staff-side customer list (stats + table) and the
 * single-customer page (summary cards, order history, personal
 * info, activity, Suspend / Reactivate).
 *
 * The order history on the detail page reuses AdminOrderSummary and
 * useListAdminOrdersQuery({ customerId }), see adminOrders.ts.
 * Adjust field names here to match the NestJS DTOs.
 */

/**
 * active    -> can sign in and order
 * inactive  -> hasn't ordered for a while (set by the backend, shown "In-Active")
 * suspended -> blocked by staff via "Suspend Account"
 */
export type AdminCustomerStatus = "active" | "inactive" | "suspended";

/** Statuses staff can set (inactive is worked out by the backend, never set by hand). */
export type AdminCustomerSettableStatus = Exclude<AdminCustomerStatus, "inactive">;

/** Same "This Month" select as the Orders page. */
export type AdminCustomerPeriod = AdminOrderPeriod;

/** Same shape as the order stats: value plus an optional % or count change. */
export type AdminCustomerStat = AdminOrderStat;

/* ------------------------------------------------------------------ */
/* List                                                                */
/* ------------------------------------------------------------------ */

/** A row in the Customers table. */
export type AdminCustomerSummary = {
  id: string;
  fullName: string;
  /** Profile photo. When missing the table shows initials ("CO"). */
  avatar?: string | null;
  email: string;
  phone: string;
  /** Number of orders placed. */
  ordersCount: number;
  /** NGN. */
  totalSpent: number;
  /** ISO, null if the customer has never ordered. */
  lastOrderAt: string | null;
  status: AdminCustomerStatus;
};

export type ListAdminCustomersParams = {
  /** Matches name, email and phone. */
  search?: string;
  status?: AdminCustomerStatus;
  /** Only members (true) or only non-members (false). Omit for everyone. */
  isMember?: boolean;
  period?: AdminCustomerPeriod;
  page?: number;
  perPage?: number;
};

/* ------------------------------------------------------------------ */
/* Stats                                                               */
/* ------------------------------------------------------------------ */

export type GetAdminCustomerStatsParams = {
  period?: AdminCustomerPeriod;
};

/** The four numbers at the top of the Customers page. */
export type AdminCustomerStats = {
  totalCustomers: AdminCustomerStat;
  newCustomers: AdminCustomerStat;
  activeCustomers: AdminCustomerStat;
  members: AdminCustomerStat;
};

/* ------------------------------------------------------------------ */
/* Detail                                                              */
/* ------------------------------------------------------------------ */

export type AdminCustomerAddress = {
  id: string;
  /** One line, e.g. "1 Ola Akadiri Street, Alagbaka Quarters, Akure, Ondo State." */
  address: string;
  isDefault: boolean;
};

export type AdminCustomerActivityType =
  | "order_placed"
  | "order_delivered"
  | "order_cancelled"
  | "points_redeemed"
  | "points_earned"
  | "address_added"
  | "other";

/** One line of the Activity feed. */
export type AdminCustomerActivity = {
  id: string;
  type: AdminCustomerActivityType;
  title: string;
  /** ISO. */
  occurredAt: string;
};

export type AdminCustomerDetail = {
  id: string;
  fullName: string;
  avatar?: string | null;
  email: string;
  phone: string;
  status: AdminCustomerStatus;
  /** NGN. */
  totalSpent: number;
  totalOrders: number;
  loyaltyPoints: number;
  /** ISO. The "Customer Since" card. */
  customerSince: string;
  addresses: AdminCustomerAddress[];
  /** Newest first. */
  activity: AdminCustomerActivity[];
};

/* ------------------------------------------------------------------ */
/* Actions                                                             */
/* ------------------------------------------------------------------ */

/** "Suspend Account" / "Reactivate Account". */
export type UpdateAdminCustomerStatusRequest = {
  id: string;
  status: AdminCustomerSettableStatus;
};

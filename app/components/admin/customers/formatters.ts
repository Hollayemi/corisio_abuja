import type {
  AdminCustomerStatus,
  AdminMembershipStatus,
  AdminOrderPaymentStatus,
  AdminOrderType,
} from "@/redux/types";

export const CUSTOMER_STATUS_LABELS: Record<AdminCustomerStatus, string> = {
  active: "Active",
  inactive: "In-Active",
  suspended: "Suspended",
};

export const CUSTOMER_STATUS_FILTER_OPTIONS = (
  Object.keys(CUSTOMER_STATUS_LABELS) as AdminCustomerStatus[]
).map((value) => ({ value, label: CUSTOMER_STATUS_LABELS[value] }));

export const MEMBERSHIP_STATUS_LABELS: Record<AdminMembershipStatus, string> = {
  active: "Active",
  paused: "Paused",
  cancelled: "Canceled",
  expired: "Expired",
};

/** The Type column in the customer's Order History. */
export const ORDER_TYPE_LABELS: Record<AdminOrderType, string> = {
  SHOP: "SHOP",
  MEAT_BOX: "Meat Box",
  FREEZER_PLANNER: "Freezer Planner",
};

/** The Payment column in Order History says "Paid" where the order drawer says "Success". */
export const HISTORY_PAYMENT_LABELS: Record<AdminOrderPaymentStatus, string> = {
  SUCCESS: "",
  PENDING: "Pending",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

export const INTERVAL_LABELS = { week: "week", month: "month", year: "year" } as const;

function toDate(iso?: string | null) {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "Sep 16, 2026". "-" when there is no date. */
export function formatDate(iso?: string | null) {
  const date = toDate(iso);
  if (!date) return "-";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** "Sep 16, 2026 · 9:42 AM" */
export function formatDateTimeLong(iso?: string | null) {
  const date = toDate(iso);
  if (!date) return "-";
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${formatDate(iso)} · ${time}`;
}

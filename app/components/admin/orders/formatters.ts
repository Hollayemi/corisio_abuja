import type {
  AdminOrderPaymentStatus,
  AdminOrderPeriod,
  AdminOrderStat,
  AdminOrderStatus,
  AdminOrderStatusGroup,
  AdminOrderType,
} from "@/redux/types";

/* ------------------------------------------------------------------ */
/* Labels                                                              */
/* ------------------------------------------------------------------ */

export const ORDER_STATUS_LABELS: Record<AdminOrderStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const PAYMENT_STATUS_LABELS: Record<AdminOrderPaymentStatus, string> = {
  PENDING: "Pending",
  SUCCESS: "Success",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

export const STATUS_GROUP_LABELS: Record<AdminOrderStatusGroup, string> = {
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

/** The drawer shows a coarser status than the table ("In Progress"). */
export function getStatusGroup(
  status: AdminOrderStatus
): AdminOrderStatusGroup {
  if (status === "DELIVERED") return "COMPLETED";
  if (status === "CANCELLED") return "CANCELLED";
  return "IN_PROGRESS";
}

export const ORDER_TABS: { value: AdminOrderType; label: string }[] = [
  { value: "SHOP", label: "Shop Orders" },
  { value: "FREEZER_PLANNER", label: "Freezer Planner Orders" },
];

export const PERIOD_OPTIONS: { value: AdminOrderPeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_year", label: "This Year" },
  { value: "all_time", label: "All Time" },
];

export const STATUS_FILTER_OPTIONS: {
  value: AdminOrderStatus;
  label: string;
}[] = (Object.keys(ORDER_STATUS_LABELS) as AdminOrderStatus[]).map(
  (value) => ({
    value,
    label: ORDER_STATUS_LABELS[value],
  })
);

/* ------------------------------------------------------------------ */
/* Stats                                                               */
/* ------------------------------------------------------------------ */

const PERIOD_SUFFIX: Record<AdminOrderPeriod, string | null> = {
  today: "today",
  this_week: "this week",
  this_month: "this month",
  last_month: "last month",
  this_year: "this year",
  all_time: null,
};

export function formatCount(value: number) {
  return value.toLocaleString("en-US");
}

/** { changePercent: 12.4 } + "THIS_MONTH" -> { text: "+12.4% this month", trend: "up" } */
export function getStatChange(
  stat: AdminOrderStat,
  period: AdminOrderPeriod
) {
  const suffix = PERIOD_SUFFIX[period];
  const isPercent = stat.changePercent !== undefined;
  const raw = stat.changePercent ?? stat.change;

  if (!suffix || raw === undefined || raw === 0) return undefined;

  const sign = raw > 0 ? "+" : "-";
  const magnitude = Math.abs(raw).toLocaleString("en-US", {
    maximumFractionDigits: 1,
  });

  return {
    text: `${sign}${magnitude}${isPercent ? "%" : ""} ${suffix}`,
    trend: raw > 0 ? ("up" as const) : ("down" as const),
  };
}

/* ------------------------------------------------------------------ */
/* Dates & names                                                       */
/* ------------------------------------------------------------------ */

function toDate(iso?: string | null) {
  if (!iso) return null;

  const date = new Date(iso);

  return Number.isNaN(date.getTime()) ? null : date;
}

/** "Sep 16, 10:00 AM" (table and drawer). "-" when there is no date. */
export function formatOrderDateTime(iso?: string | null) {
  const date = toDate(iso);

  if (!date) return "-";

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** "25 Sep - 03:37 PM" (timeline). */
export function formatTimelineTime(iso?: string | null) {
  const date = toDate(iso);

  if (!date) return "";

  const day = `${date.getDate()} ${date.toLocaleString("en-US", {
    month: "short",
  })}`;

  const time = date.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${day} - ${time}`;
}

/** "Remi Olatunji" -> "RO" */
export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "?";

  const first = parts[0][0] ?? "";
  const last =
    parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";

  return (first + last).toUpperCase();
}

/** Safe CSV cell: always quoted, quotes doubled. */
export function csvCell(value: string | number | null | undefined) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}


import type { OrderDetail, OrderItem, OrderStatus } from "@/redux/types";

/** Which of the two page tabs an order lives under. */
export type OrdersTab = "orders" | "cancelled";

export function tabForStatus(status: OrderStatus): OrdersTab {
  return status === "cancelled" || status === "returned" ? "cancelled" : "orders";
}


export function formatOrderId(order: { orderNumber: string }): string {
  return `#${order.orderNumber}`;
}

// "en-US" gives the "Sep 12, 2026" / "2:15PM" ordering used in the design,
// regardless of the server/browser's own locale.
const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const monthFmt = new Intl.DateTimeFormat("en-US", { month: "short" });
const dayFmt = new Intl.DateTimeFormat("en-US", { day: "numeric" });
const timeFmt = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

/** 2026-09-12T14:15:00Z -> "Sep 12, 2026" */
export function formatOrderDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

/** 2026-09-12T14:15:00Z -> "2:15PM" */
export function formatOrderTime(iso: string): string {
  return timeFmt.format(new Date(iso)).replace(" ", "").toUpperCase();
}

/** 2026-09-12T14:15:00Z -> "Sep 12, 2026 – 2:15PM" */
export function formatOrderDateTime(iso: string): string {
  return `${formatOrderDate(iso)} – ${formatOrderTime(iso)}`;
}

/** Track-step timestamps are `occurredAt: string | null` — undefined until they happen. */
export function formatStepMonth(occurredAt: string | null): string | undefined {
  return occurredAt ? monthFmt.format(new Date(occurredAt)) : undefined;
}
export function formatStepDay(occurredAt: string | null): string | undefined {
  return occurredAt ? dayFmt.format(new Date(occurredAt)) : undefined;
}
export function formatStepTime(occurredAt: string | null): string | undefined {
  return occurredAt ? formatOrderTime(occurredAt) : undefined;
}

export function getUnitLabel(item: OrderItem): string {
  if (item.unitLabel) return item.unitLabel;
  return item.quantity === 1 ? "Unit" : "Units";
}

export function isRatable(order: Pick<OrderDetail, "status">): boolean {
  return order.status === "completed";
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  "in-progress": "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  returned: "Returned",
  delivered: "Delivered",
};
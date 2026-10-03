import type {
  AdminOrderPaymentStatus,
  AdminOrderStatus,
  AdminOrderStatusGroup,
} from "@/redux/types";
import {
  getStatusGroup,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  STATUS_GROUP_LABELS,
} from "./formatters";

const STATUS_STYLES: Record<AdminOrderStatus, string> = {
  PENDING: "bg-neutral-100 text-neutral-600",
  PROCESSING: "bg-[#fdf0da] text-amber-700",
  OUT_FOR_DELIVERY: "bg-[#e6effb] text-blue-700",
  DELIVERED: "bg-[#e7f4e4] text-corisio-blue",
  CANCELLED: "bg-[#fbe9e9] text-red-600",
};

export type OrderStatusPillProps = { status: AdminOrderStatus };

/** The coloured Status cell in the table ("Processing", "Delivered"). */
export function OrderStatusPill({ status }: OrderStatusPillProps) {
  return (
    <span
      className={`inline-flex rounded-lg px-4 py-2 text-sm font-medium ${STATUS_STYLES[status]}`}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

const GROUP_DOT: Record<AdminOrderStatusGroup, string> = {
  IN_PROGRESS: "bg-neutral-800",
  COMPLETED: "bg-corisio-blue",
  CANCELLED: "bg-red-600",
};

export type OrderStatusGroupPillProps = { status: AdminOrderStatus };

/** The small "• In Progress" pill next to Status in the drawer. */
export function OrderStatusGroupPill({ status }: OrderStatusGroupPillProps) {
  const group = getStatusGroup(status);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-800">
      <span aria-hidden="true" className={`size-1.5 rounded-full ${GROUP_DOT[group]}`} />
      {STATUS_GROUP_LABELS[group]}
    </span>
  );
}

const PAYMENT_STYLES: Record<AdminOrderPaymentStatus, string> = {
  PENDING: "bg-[#fdf0da] text-amber-700",
  SUCCESS: "bg-[#e7f4e4] text-corisio-blue",
  FAILED: "bg-[#fbe9e9] text-red-600",
  REFUNDED: "bg-neutral-100 text-neutral-600",
};

export type PaymentStatusPillProps = { status: AdminOrderPaymentStatus };

/** The green "Success" pill under Payment in the drawer. */
export function PaymentStatusPill({ status }: PaymentStatusPillProps) {
  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${PAYMENT_STYLES[status]}`}
    >
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}

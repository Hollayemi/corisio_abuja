import type {
  AdminCustomerStatus,
  AdminOrderPaymentStatus,
} from "@/redux/types";
import {
  CUSTOMER_STATUS_LABELS,
  HISTORY_PAYMENT_LABELS,
} from "./formatters";

const CUSTOMER_STYLES: Record<AdminCustomerStatus, string> = {
  active: "bg-corisio-100 text-corisio-blue",
  inactive: "bg-[#fbe9e9] text-red-600",
  suspended: "bg-[#fdf0da] text-amber-700",
};

export type CustomerStatusPillProps = { status: AdminCustomerStatus };

/** "Active" / "In-Active" / "Suspended" in the table. */
export function CustomerStatusPill({ status }: CustomerStatusPillProps) {
  return (
    <span
      className={`inline-flex rounded-lg px-4 py-2 text-sm font-medium ${CUSTOMER_STYLES[status]}`}
    >
      {CUSTOMER_STATUS_LABELS[status]}
    </span>
  );
}


export type HistoryPaymentPillProps = { status: AdminOrderPaymentStatus };

/** "Paid" / "Failed" in the customer's Order History. */
export function HistoryPaymentPill({ status }: HistoryPaymentPillProps) {
  const failed = status === "FAILED" || status === "REFUNDED";
  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${
        failed ? "bg-[#fbe9e9] text-red-600" : "bg-neutral-100 text-neutral-700"
      }`}
    >
      {HISTORY_PAYMENT_LABELS[status]}
    </span>
  );
}

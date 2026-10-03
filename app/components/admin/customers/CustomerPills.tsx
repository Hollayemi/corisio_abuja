import type {
  AdminCustomerStatus,
  AdminMembershipStatus,
  AdminOrderPaymentStatus,
} from "@/redux/types";
import {
  CUSTOMER_STATUS_LABELS,
  HISTORY_PAYMENT_LABELS,
  MEMBERSHIP_STATUS_LABELS,
} from "./formatters";

const CUSTOMER_STYLES: Record<AdminCustomerStatus, string> = {
  active: "bg-[#e7f4e4] text-corisio-blue",
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

const MEMBERSHIP_STYLES: Record<AdminMembershipStatus, { pill: string; dot: string }> = {
  active: { pill: "bg-[#e7f4e4] text-corisio-blue", dot: "bg-corisio-blue" },
  paused: { pill: "bg-[#fdf0da] text-amber-700", dot: "bg-amber-600" },
  cancelled: { pill: "bg-[#fbe9e9] text-red-600", dot: "bg-red-600" },
  expired: { pill: "bg-neutral-100 text-neutral-600", dot: "bg-neutral-500" },
};

export type MembershipStatusPillProps = {
  status: AdminMembershipStatus;
  /** Adds the leading dot ("• Active"), as in the Membership card header. */
  withDot?: boolean;
};

export function MembershipStatusPill({ status, withDot }: MembershipStatusPillProps) {
  const s = MEMBERSHIP_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${s.pill}`}>
      {withDot && <span aria-hidden="true" className={`size-1.5 rounded-full ${s.dot}`} />}
      {MEMBERSHIP_STATUS_LABELS[status]}
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

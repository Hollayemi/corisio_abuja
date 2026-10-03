import type { AdminActiveStatus, AdminMembershipStatus } from "@/redux/types";
import { MEMBERSHIP_STATUS_LABELS } from "@/app/components/admin/customers/formatters";
import { ACTIVE_STATUS_LABELS } from "./formatters";

const SUBSCRIPTION_STYLES: Record<AdminMembershipStatus, string> = {
  active: "bg-[#e7f4e4] text-corisio-blue",
  paused: "bg-[#fdf0da] text-amber-700",
  cancelled: "bg-[#fbe9e9] text-red-600",
  expired: "bg-neutral-100 text-neutral-600",
};

export type SubscriptionStatusPillProps = { status: AdminMembershipStatus };

/** "Active" / "Paused" / "Cancelled" in the Subscribers table. */
export function SubscriptionStatusPill({ status }: SubscriptionStatusPillProps) {
  return (
    <span
      className={`inline-flex rounded-lg px-4 py-2 text-sm font-medium ${SUBSCRIPTION_STYLES[status]}`}
    >
      {MEMBERSHIP_STATUS_LABELS[status]}
    </span>
  );
}

export type ActiveStatusPillProps = { status: AdminActiveStatus };

/** "Active" / "Inactive" for plans and proteins. */
export function ActiveStatusPill({ status }: ActiveStatusPillProps) {
  return (
    <span
      className={`inline-flex rounded-lg px-4 py-2 text-sm font-medium ${
        status === "active" ? "bg-[#e7f4e4] text-corisio-blue" : "bg-neutral-100 text-neutral-600"
      }`}
    >
      {ACTIVE_STATUS_LABELS[status]}
    </span>
  );
}

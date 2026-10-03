import { formatNaira } from "@/app/utils/product";
import type {
  AdminActiveStatus,
  AdminDeliveryFrequency,
  AdminMembershipInterval,
  AdminMembershipPlanInput,
  AdminMembershipStatus,
} from "@/redux/types";

export type MembershipTab = "overview" | "subscribers" | "proteins";

export const MEMBERSHIP_TABS: { value: MembershipTab; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "subscribers", label: "Subscribers / Deliveries" },
  { value: "proteins", label: "Proteins" },
];

export const DELIVERY_FREQUENCY_LABELS: Record<AdminDeliveryFrequency, string> = {
  weekly: "Weekly",
  fortnightly: "Fortnightly",
  monthly: "Monthly",
};

export const INTERVAL_LABELS: Record<AdminMembershipInterval, string> = {
  week: "Weekly",
  month: "Monthly",
  year: "Yearly",
};

/** "₦30,000" + "month" -> "₦30,000/mo" */
const INTERVAL_SUFFIX: Record<AdminMembershipInterval, string> = {
  week: "wk",
  month: "mo",
  year: "yr",
};

export const ACTIVE_STATUS_LABELS: Record<AdminActiveStatus, string> = {
  active: "Active",
  inactive: "Inactive",
};

export const ACTIVE_STATUS_OPTIONS = (Object.keys(ACTIVE_STATUS_LABELS) as AdminActiveStatus[]).map(
  (value) => ({ value, label: ACTIVE_STATUS_LABELS[value] }),
);

export const SUBSCRIPTION_STATUS_OPTIONS: { value: AdminMembershipStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "cancelled", label: "Cancelled" },
  { value: "expired", label: "Expired" },
];

export const PLAN_INTERVAL_OPTIONS = (Object.keys(INTERVAL_LABELS) as AdminMembershipInterval[]).map(
  (value) => ({ value, label: INTERVAL_LABELS[value] }),
);

export const PLAN_FREQUENCY_OPTIONS = (
  Object.keys(DELIVERY_FREQUENCY_LABELS) as AdminDeliveryFrequency[]
).map((value) => ({ value, label: DELIVERY_FREQUENCY_LABELS[value] }));

export function formatPlanPrice(price: number, interval: AdminMembershipInterval) {
  return `${formatNaira(price)}/${INTERVAL_SUFFIX[interval]}`;
}

/** 8_420_000 -> "₦8.42M", 450_000 -> "₦450K", 900 -> "₦900" */
export function formatCompactNaira(amount: number) {
  const compact = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(amount);
  return `₦${compact}`;
}

function toDate(iso?: string | null) {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "Sep 24 · 12-2 PM". "-" when nothing is scheduled. */
export function formatNextDelivery(iso?: string | null, slot?: string | null) {
  const date = toDate(iso);
  if (!date) return "-";
  const day = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return slot ? `${day} · ${slot}` : day;
}

/** "Oct 02, 2026" (two-digit day, as in the design). */
export function formatRenewal(iso?: string | null) {
  const date = toDate(iso);
  if (!date) return "-";
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

/** 37.5 -> "37.5%", 40 -> "40%". Clamped to 0-100. */
export function formatPercent(value: number) {
  const clamped = Math.min(100, Math.max(0, value));
  return `${Number(clamped.toFixed(1))}%`;
}

/** The plan dialog's starting values. */
export const EMPTY_PLAN_INPUT: AdminMembershipPlanInput = {
  name: "",
  description: "",
  price: 0,
  interval: "month",
  deliveryFrequency: "weekly",
  status: "active",
};

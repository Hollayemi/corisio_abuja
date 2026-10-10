import type {
  AdminDeliverySettableStatus,
  AdminDeliveryStatus,
  AdminDeliveryType,
} from "@/redux/types/adminDeliveries";

export const DELIVERY_TYPE_LABELS: Record<AdminDeliveryType, string> = {
  freezer_planner: "Freezer Planner Delivery",
  membership: "Membership Order Delivery",
};

/** The short word on a calendar chip ("Free..", "Mem.."). */
export const DELIVERY_TYPE_SHORT: Record<AdminDeliveryType, string> = {
  freezer_planner: "Freezer Planner",
  membership: "Membership",
};

export const DELIVERY_TYPE_OPTIONS = (
  Object.keys(DELIVERY_TYPE_SHORT) as AdminDeliveryType[]
).map((value) => ({ value, label: DELIVERY_TYPE_SHORT[value] }));

export const DELIVERY_STATUS_LABELS: Record<AdminDeliveryStatus, string> = {
  scheduled: "Scheduled",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  missed: "Missed",
  skipped: "Skipped",
};

export const DELIVERY_STATUS_OPTIONS = (
  Object.keys(DELIVERY_STATUS_LABELS) as AdminDeliveryStatus[]
).map((value) => ({ value, label: DELIVERY_STATUS_LABELS[value] }));

/** The ⋮ menu wording for each status staff can set. */
export const SET_STATUS_LABELS: Record<AdminDeliverySettableStatus, string> = {
  out_for_delivery: "Mark as out for delivery",
  delivered: "Mark as delivered",
  missed: "Mark as missed",
};

/** Colours per type: chip on the calendar, card in the side panel. */
export const DELIVERY_TYPE_STYLES: Record<
  AdminDeliveryType,
  { chip: string; card: string }
> = {
  freezer_planner: {
    chip: "bg-[#fdf0dc] text-[#e08a12]",
    card: "border-[#f5dcb8] bg-[#fff6ec]",
  },
  membership: {
    chip: "bg-[#ebe7fb] text-[#5236b8]",
    card: "border-[#d9d0f5] bg-[#f1eefc]",
  },
};

export const DELIVERY_STATUS_STYLES: Record<AdminDeliveryStatus, string> = {
  scheduled: "bg-white/70 text-neutral-600",
  out_for_delivery: "bg-[#e6effb] text-blue-700",
  delivered: "bg-corisio-100 text-corisio-blue",
  missed: "bg-[#fbe9e9] text-red-600",
  skipped: "bg-neutral-100 text-neutral-600",
};

/** "08:00" -> "08:00AM", "14:30" -> "02:30PM" */
export function formatTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")}${suffix}`;
}

/** "08:00AM - 08:30AM" */
export function formatTimeRange(start: string, end: string) {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

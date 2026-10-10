import type { AdminOrderCustomerBrief } from "./adminOrders";
import type { Paginated } from "./inventory";

/**
 * Admin Delivery & Schedule: the month calendar, the deliveries of the
 * selected day, and updating a delivery's status.
 *
 * Deliveries are created by the backend from customers' orders, so the
 * calendar always matches what customers see. Adjust field names to match
 * the NestJS DTOs.
 *
 * Dates are plain "YYYY-MM-DD" strings and times plain "HH:mm" (24-hour) in
 * the store's own timezone, so a delivery never slips to the wrong day
 * because of UTC.
 */

/** Every delivery is for a customer order. */
export type AdminDeliveryType = "shop";

/**
 * scheduled        -> upcoming
 * out_for_delivery -> with the rider
 * delivered        -> done
 * missed           -> rider couldn't deliver / customer unavailable
 * skipped          -> customer skipped this delivery
 */
export type AdminDeliveryStatus =
  | "scheduled"
  | "out_for_delivery"
  | "delivered"
  | "missed"
  | "skipped";

/** Statuses staff can set by hand. */
export type AdminDeliverySettableStatus = "out_for_delivery" | "delivered" | "missed";

/* ------------------------------------------------------------------ */
/* Calendar                                                            */
/* ------------------------------------------------------------------ */

/** One small coloured chip inside a calendar cell. */
export type AdminDeliveryPreview = {
  id: string;
  type: AdminDeliveryType;
  /** "08:00" */
  startTime: string;
  status: AdminDeliveryStatus;
};

/** One day in the calendar grid. Days with no deliveries can be left out. */
export type AdminDeliveryDay = {
  /** "2026-09-13" */
  date: string;
  /** All deliveries that day, for the "+12 more". */
  total: number;
  /** The first few (3) in time order, shown as chips. */
  previews: AdminDeliveryPreview[];
};

export type GetAdminDeliveryCalendarParams = {
  /** First day of the grid, "YYYY-MM-DD" (can be in the previous month). */
  from: string;
  /** Last day of the grid, "YYYY-MM-DD" (can be in the next month). */
  to: string;
  type?: AdminDeliveryType;
  status?: AdminDeliveryStatus;
};

export type AdminDeliveryCalendar = {
  days: AdminDeliveryDay[];
};

/* ------------------------------------------------------------------ */
/* Deliveries                                                          */
/* ------------------------------------------------------------------ */

/** A card in the "Delivery Schedules" side panel. */
export type AdminDelivery = {
  id: string;
  type: AdminDeliveryType;
  status: AdminDeliveryStatus;
  customer: AdminOrderCustomerBrief;
  /** "2026-09-13" */
  date: string;
  /** "08:00" */
  startTime: string;
  /** "08:30" */
  endTime: string;
  /**
   * What the backend allows next, so the UI never hard-codes the workflow.
   * Empty once a delivery is finished. Drives the card's ⋮ menu.
   */
  allowedNextStatuses: AdminDeliverySettableStatus[];
};

export type ListAdminDeliveriesParams = {
  /** One day: the side panel. */
  date?: string;
  /** A range: used by Export (with a large perPage). Ignored when `date` is set. */
  from?: string;
  to?: string;
  type?: AdminDeliveryType;
  status?: AdminDeliveryStatus;
  page?: number;
  perPage?: number;
};

/** Sorted by start time, earliest first. */
export type AdminDeliveryList = Paginated<AdminDelivery>;

/* ------------------------------------------------------------------ */
/* Actions                                                             */
/* ------------------------------------------------------------------ */

export type UpdateAdminDeliveryStatusRequest = {
  id: string;
  status: AdminDeliverySettableStatus;
};

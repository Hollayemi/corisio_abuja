import type { AdminMembershipStatus } from "./adminCustomers";
import type { AdminOrderCustomerBrief, AdminOrderStat } from "./adminOrders";

/**
 * Admin Membership (a membership is a subscription): the plans, the people
 * subscribed to them, and the proteins members can mix into their deliveries.
 *
 * The three tabs on the page map onto this file:
 *   Overview                 -> AdminMembershipPlan   (create / edit / delete in a dialog)
 *   Subscribers / Deliveries -> AdminSubscriber
 *   Proteins                 -> AdminProtein          (create / edit / delete in a dialog, with % sold)
 *
 * Adjust field names here to match the NestJS DTOs.
 */

export type AdminMembershipInterval = "week" | "month" | "year";

export type AdminDeliveryFrequency = "weekly" | "fortnightly" | "monthly";

/** Plans and proteins can be switched off without deleting them. */
export type AdminActiveStatus = "active" | "inactive";

/** Same shape as the other admin stat cards: value plus an optional % or count change. */
export type AdminMembershipStat = AdminOrderStat;

/* ------------------------------------------------------------------ */
/* Stats                                                               */
/* ------------------------------------------------------------------ */

/** The five numbers at the top of the Membership page. */
export type AdminMembershipStats = {
  activeMembers: AdminMembershipStat;
  /** NGN. Shown compact, e.g. "₦8.42M". */
  monthlyRecurringRevenue: AdminMembershipStat;
  upcomingDeliveries: AdminMembershipStat;
  renewalsDue: AdminMembershipStat;
  /** Subscriptions that need staff action (failed payment, paused too long...). Backend decides. */
  needsAttention: AdminMembershipStat;
};

/* ------------------------------------------------------------------ */
/* Plans (Overview tab)                                                */
/* ------------------------------------------------------------------ */

/** A row in the Overview table. */
export type AdminMembershipPlan = {
  id: string;
  /** "Silver", "Gold", "Family", "Business" */
  name: string;
  description?: string | null;
  /** NGN per billing interval. */
  price: number;
  /** Billing cycle, shown as the "/mo" after the price. */
  interval: AdminMembershipInterval;
  deliveryFrequency: AdminDeliveryFrequency;
  /** Read-only, server-computed. */
  membersCount: number;
  /** NGN. Read-only, server-computed (members x price). */
  monthlyRevenue: number;
  /** "inactive" plans can't be bought, existing members keep theirs. */
  status: AdminActiveStatus;
};

/** What the plan dialog edits. */
export type AdminMembershipPlanInput = {
  name: string;
  description?: string;
  price: number;
  interval: AdminMembershipInterval;
  deliveryFrequency: AdminDeliveryFrequency;
  status: AdminActiveStatus;
};

export type ListAdminMembershipPlansParams = {
  search?: string;
  status?: AdminActiveStatus;
};

export type CreateAdminMembershipPlanRequest = AdminMembershipPlanInput;

export type UpdateAdminMembershipPlanRequest = Partial<AdminMembershipPlanInput> & {
  id: string;
};

/* ------------------------------------------------------------------ */
/* Subscribers (Subscribers / Deliveries tab)                          */
/* ------------------------------------------------------------------ */

/** A row in the Subscribers / Deliveries table. */
export type AdminSubscriber = {
  /** The subscription's id. */
  id: string;
  /** Links to /admin/customers/:id. */
  customer: AdminOrderCustomerBrief;
  planId: string;
  /** "Gold" */
  planName: string;
  /** NGN, the "Billing" column: "₦50,000/mo". */
  price: number;
  interval: AdminMembershipInterval;
  /** ISO, null when nothing is scheduled (paused / cancelled). */
  nextDeliveryAt: string | null;
  /** Delivery window, shown after the date: "12-2 PM". */
  nextDeliverySlot: string | null;
  /** ISO, the "Renewal" column. Null when it won't renew. */
  renewalAt: string | null;
  status: AdminMembershipStatus;
};

export type ListAdminSubscribersParams = {
  /** Matches customer name and plan name. */
  search?: string;
  status?: AdminMembershipStatus;
  page?: number;
  perPage?: number;
};

/* ------------------------------------------------------------------ */
/* Proteins (Proteins tab)                                             */
/* ------------------------------------------------------------------ */

/** A protein members can pick to mix into their delivery: chicken, beef, goat meat... */
export type AdminProtein = {
  id: string;
  /** "Chicken" */
  label: string;
  description: string;
  /** URL of the uploaded image. */
  image?: string | null;
  /** "inactive" proteins can't be picked in new mixes. */
  status: AdminActiveStatus;
  /**
   * This protein's share of all protein sold this month, 0 to 100
   * (the values across proteins add up to about 100). Read-only, server-computed.
   */
  soldPercentage: number;
};

/** What the protein dialog edits. `image` is uploaded as multipart/form-data. */
export type AdminProteinInput = {
  label: string;
  description: string;
  image?: File | null;
  status: AdminActiveStatus;
};

export type ListAdminProteinsParams = {
  search?: string;
  status?: AdminActiveStatus;
};

export type CreateAdminProteinRequest = AdminProteinInput;

export type UpdateAdminProteinRequest = Partial<AdminProteinInput> & {
  id: string;
};

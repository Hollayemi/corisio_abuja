/**
 * Membership (subscription), customer side: the plans shown on /subscription,
 * the proteins and delivery options offered at checkout, subscribing, and
 * managing your own subscription.
 *
 * Everything here is served from the same data staff manage on the admin
 * Membership page (redux/types/adminMembership.ts), so a plan or protein
 * edited there shows up here on the next fetch. Only active plans and
 * proteins are returned. Prices are never sent by the client: the backend
 * always prices a subscription from its own plan.
 */

export type MembershipInterval = "week" | "month" | "year";

export type MembershipDeliveryFrequency = "WEEKLY" | "FORTNIGHTLY" | "MONTHLY";

/* ------------------------------------------------------------------ */
/* Catalogue (public: works for signed-out visitors too)               */
/* ------------------------------------------------------------------ */

/** A plan card on /subscription and the plan being bought at checkout. */
export type MembershipPlan = {
  id: string;
  /** URL-friendly name, used in /subscription/checkout?plan=gold. */
  slug: string;
  name: string;
  /** "For households that want more variety" */
  description: string;
  /** NGN per billing interval. */
  price: number;
  interval: MembershipInterval;
  /** The plan's usual delivery schedule, preselected at checkout. */
  deliveryFrequency: MembershipDeliveryFrequency;
  /** The "Weekly supply of:" list on the card. */
  supply: string[];
};

/** A protein a member can pick to mix into their deliveries. */
export type MembershipProtein = {
  id: string;
  /** "Chicken" */
  label: string;
  description: string;
  image?: string | null;
};

export type MembershipDeliveryFrequencyOption = {
  id: MembershipDeliveryFrequency;
  /** "Weekly", "Every 2 weeks", "Monthly" */
  label: string;
  /** Splits the monthly fee into per-delivery amounts. */
  deliveriesPerMonth: number;
};

/** What the checkout's delivery selects offer. */
export type MembershipOptions = {
  deliveryFrequencies: MembershipDeliveryFrequencyOption[];
  /** "Monday" ... "Sunday" */
  deliveryDays: string[];
  /** "8:00 AM – 10:00 AM" ... */
  deliveryWindows: string[];
};

/* ------------------------------------------------------------------ */
/* Subscribing                                                         */
/* ------------------------------------------------------------------ */

/** One protein's share of the weekly mix. All shares add up to 100. */
export type MembershipProteinShare = {
  proteinId: string;
  percentage: number;
};

export type SubscribeRequest = {
  planId: string;
  mix: MembershipProteinShare[];
  deliveryFrequency: MembershipDeliveryFrequency;
  deliveryDay: string;
  deliveryWindow: string;
  addressId: string;
};

export type SubscribeResponse = {
  subscriptionId: string;
  /** Send the customer here to pay, then the backend returns them to the site. */
  payment: {
    authorizationUrl: string;
    reference: string;
  };
};

/* ------------------------------------------------------------------ */
/* My subscription (signed in)                                         */
/* ------------------------------------------------------------------ */

export type MySubscriptionStatus =
  | "pending_payment"
  | "active"
  | "paused"
  | "cancelled"
  | "expired";

export type MySubscription = {
  id: string;
  status: MySubscriptionStatus;
  plan: MembershipPlan;
  /** The current mix, with each protein's details for display. */
  mix: { protein: MembershipProtein; percentage: number }[];
  deliveryFrequency: MembershipDeliveryFrequency;
  deliveryDay: string;
  deliveryWindow: string;
  address: string;
  /** ISO. */
  startedAt: string;
  /** ISO, null when paused / cancelled. */
  nextDeliveryAt: string | null;
  /** ISO, null when it won't renew. */
  nextBillingAt: string | null;
};

/** Upgrade / downgrade: applies from the next billing date. */
export type ChangeMembershipPlanRequest = {
  id: string;
  planId: string;
};

export type UpdateMembershipMixRequest = {
  id: string;
  mix: MembershipProteinShare[];
};

export type CancelMembershipRequest = {
  id: string;
  reason?: string;
};

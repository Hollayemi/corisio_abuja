/**
 * Shapes for the Orders feature ("My Orders" pages), consumed by
 * redux/slices/ordersApi.ts. Same pattern as cart.ts / auth.ts: plain
 * request/response types for the NestJS backend — every response still
 * arrives wrapped as ApiSuccess<T> (see api.ts).
 *
 * Field names and enum values are chosen to line up with the UI-side mock
 * in app/data/orders-data.ts, so pointing that page at ordersApi later is
 * close to a drop-in rename rather than a redesign.
 */

export type OrderStatus = "in-progress" | "completed" | "cancelled" | "returned" | 'delivered';
export type DeliveryType = "Delivery" | "Pickup";

export type OrderItem = {
  id: string;
  name: string;
  image: string;
  /** Unit price in NGN. */
  price: number;
  quantity: number;
  unitLabel?: string;
};

export type TrackStepState = "done" | "active" | "pending";

export type TrackStepId =
  | "placed"
  | "payment"
  | "packed"
  | "out-for-delivery"
  | "received"
  | "rate"
  | "cancelled"
  | "refunded";

export type TrackStep = {
  id: TrackStepId;
  title: string;
  description: string;
  /** ISO timestamp once the step has happened, null until then. */
  occurredAt: string | null;
  state: TrackStepState;
};

export type OrderRating = {
  stars: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  submittedAt: string;
};

/** Row shape for the list — no items/track, so the list stays light. */
export type OrderSummary = {
  id: string;
  placedAt: string;
  status: OrderStatus;
  deliveryType: DeliveryType;
  itemsCount: number;
  itemsTotal: number;
};

/** Full detail, e.g. the body of GET /orders/:id. */
export type OrderDetail = {
  id: string;
  placedAt: string;
  status: OrderStatus;
  deliveryType: DeliveryType;
  receiverPhone: string;
  orderNumber: string;
  deliveryAddress: string;
  email: string;
  items: OrderItem[];
  itemsTotal: number;
  /** Flat amount already knocked off itemsTotal. */
  discount: number;
  deliveryFee: number;
  total: number;
  timeline: TrackStep[];
  rating: OrderRating | null;

  return: ReturnEligibility
};

/* ------------------------------------------------------------------ */
/* Query (list & detail)                                               */
/* ------------------------------------------------------------------ */

export type ListOrdersRequest = {
  /** Convenience filter matching the page's two tabs. Omit for both. */
  tab?: "orders" | "cancelled";
  /** Fine-grained filter; ignored if `tab` is also set. */
  status?: OrderStatus[];
  page?: number;
  pageSize?: number;
};

export type ListOrdersResponse = {
  orders: OrderSummary[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

/* ------------------------------------------------------------------ */
/* Track (timeline + rating)                                           */
/* ------------------------------------------------------------------ */

export type OrderTracking = {
  id: string;
  status: OrderStatus;
  track: TrackStep[];
};

export type RateOrderRequest = {
  id: string;
  stars: 1 | 2 | 3 | 4 | 5;
  comment?: string;
};

/* ------------------------------------------------------------------ */
/* Return (cancel + post-delivery return)                              */
/* ------------------------------------------------------------------ */

export type CancelOrderRequest = {
  id: string;
  reason: string;
};

export type ReturnEligibility = {
  eligible: boolean;
  /** Present when eligible: the return window's hard deadline. */
  windowClosesAt?: string;
  /** Present when not eligible: why. */
  reason?: string;
};

export type RequestReturnRequest = {
  id: string;
  reason: string;
  /** Omit to return the whole order; otherwise a subset of OrderItem ids. */
  itemIds?: string[];
};

export type RequestReturnResponse = {
  returnId: string;
  status: "pending_review" | "approved" | "rejected" | "refunded";
  requestedAt: string;
};

export type ReorderResponse = {
  /** How many line items were added to the cart (some may be out of stock). */
  cartItemsAdded: number;
  unavailableItemIds: string[];
};

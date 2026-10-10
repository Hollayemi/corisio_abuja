/**
 * Admin Orders: the staff-side orders page (stats strip, tabbed table, and
 * the Order Details drawer with Update Status / Cancel actions).
 *
 * Named AdminOrder* on purpose: orders.ts already owns OrderStatus,
 * OrderItem and OrderDetail for the customer "My Orders" pages.
 * Adjust field names here to match the NestJS DTOs; every admin orders
 * component reads through these types.
 */

/** The three tabs on the page. */
export type AdminOrderType = "SHOP" | "FREEZER_PLANNER";

/**
 * pending          -> just placed, awaiting confirmation
 * processing       -> confirmed, being prepared and packaged
 * out_for_delivery -> with the rider
 * delivered        -> completed
 * cancelled        -> cancelled by staff or customer
 */
export type AdminOrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

/** Statuses staff can move an order to with "Update Order Status" (cancelling has its own action). */

export type AdminOrderUpdatableStatus = Exclude<AdminOrderStatus, "CANCELLED">;

export type AdminOrderPaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED";

/** The "This Month" select at the top right of the page. */

export type AdminOrderPeriod =
  | "today"
  | "this_week"
  | "this_month"
  | "last_month"
  | "this_year"
  | "all_time";

/** Coarser label the drawer shows next to "Status" ("In Progress"). */

export type AdminOrderStatusGroup =
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";
/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

export type AdminOrderCustomerBrief = {
  id: string;
  fullName: string;
  /** Profile photo. When missing the table shows initials ("RM"). */
  avatar?: string | null;
};

export type AdminOrderCustomer = AdminOrderCustomerBrief & {
  email: string;
  phone: string;
};

export type AdminOrderItem = {
  id: string;
  productId: string;
  name: string;
  /** Shown under the name as "#6727811". */
  sku: string;
  image?: string | null;
  quantity: number;
  /** NGN per unit. */
  unitPrice: number;
  /** quantity x unitPrice. This is the "Price" column in the drawer. */
  lineTotal: number;
};

export type AdminOrderTimelineState = "done" | "active" | "pending";

/** One line of the drawer's Timeline. */
export type AdminOrderTimelineEvent = {
  id: string;
  /** "Out for delivery", "Payment has been confirmed", ... */
  title: string;
  /** "The order is being delivered and on the way" */
  description: string;
  /** ISO timestamp, null if the step hasn't happened yet. */
  occurredAt: string | null;
  /** "active" is the current step (orange spinner); "done" shows a green check. */
  state: AdminOrderTimelineState;
};

/* ------------------------------------------------------------------ */
/* List                                                                */
/* ------------------------------------------------------------------ */

/** A row in the Orders table. */
export type AdminOrderSummary = {
  id: string;
  orderNumber: string;
  type: AdminOrderType;
  status: AdminOrderStatus;
  paymentStatus: AdminOrderPaymentStatus;
  customer: AdminOrderCustomerBrief;
  /** ISO. The "Date & Time" column. */
  placedAt: string;
  /** NGN, the "Amount" column. */
  totalAmount: number;
  /** Sum of item quantities, the "No of items" column. */
  itemsCount: number;
  /** ISO. The "Delivery Date" column: when it was delivered, null until then ("-"). */
  deliveredAt: string | null;
};

export type ListAdminOrdersParams = {
  /** Matches order number ("LX-10482") and customer name. */
  search?: string;
  type?: AdminOrderType;
  status?: AdminOrderStatus;
  paymentStatus?: AdminOrderPaymentStatus;
  period?: AdminOrderPeriod;
  page?: number;
  perPage?: number;
};

/* ------------------------------------------------------------------ */
/* Stats                                                               */
/* ------------------------------------------------------------------ */

/**
 * One number in the stat strip. The design mixes "+12.4%" and "+23" style
 * changes, so send whichever applies (changePercent wins if both are set).
 * Negative values are fine; the card renders them as a drop.
 */
export type AdminOrderStat = {
  value: number;
  changePercent?: number;
  change?: number;
};

export type GetAdminOrderStatsParams = {
  period?: AdminOrderPeriod;
  /** Omit for all order types. */
  type?: AdminOrderType;
};

export type AdminOrderStats = {
  totalOrders: AdminOrderStat;
  pendingOrders: AdminOrderStat;
  processing: AdminOrderStat;
  outForDelivery: AdminOrderStat;
  completed: AdminOrderStat;
  /**
   * The small counts on the tabs ("Shop Orders 5"). Always for all three
   * types, whatever `type` was asked for. Typically orders needing attention.
   */
  tabCounts: Record<AdminOrderType, number>;
};

/* ------------------------------------------------------------------ */
/* Detail                                                              */
/* ------------------------------------------------------------------ */

export type AdminOrderDetail = Omit<AdminOrderSummary, "customer"> & {
  customer: AdminOrderCustomer;
  /** "1 Ola Akadiri Street, Alagbaka Quarters, Akure, Ondo State." */
  shippingAddress: string;
  items: AdminOrderItem[];
  /** Oldest first. The drawer shows newest on top. */
  timeline: AdminOrderTimelineEvent[];

  /** Payment Summary block. */
  itemsTotal: number;
  discount: number;
  deliveryFee: number;
  total: number;


  allowedNextStatuses: AdminOrderUpdatableStatus[];
  /** False once it's delivered or already cancelled. Drives the "Cancel Order" button. */
  canCancel: boolean;
  cancellation?: {
    reason: string;
    cancelledAt: string;
  } | null;
};

/* ------------------------------------------------------------------ */
/* Actions                                                             */
/* ------------------------------------------------------------------ */

export type UpdateAdminOrderStatusRequest = {
  id: string;
  status: AdminOrderUpdatableStatus;
  /** Internal note, saved on the timeline event. */
  note?: string;
};

export type CancelAdminOrderRequest = {
  id: string;
  reason: string;
};

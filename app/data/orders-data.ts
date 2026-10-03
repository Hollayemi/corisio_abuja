/**
 * Order domain data for the "My Orders" pages.
 *
 * This mirrors the placeholder-data pattern used elsewhere in the app
 * (see app/data/home-data.ts and app/lib/catalog.ts): plain types + a
 * mock dataset + a handful of query helpers. Swap ORDERS/CANCELLED_ORDERS
 * and the helpers below for real API/database calls when you have a
 * backend — the page components only depend on these function signatures.
 */

export type OrderStatus = "in-progress" | "completed" | "cancelled" | "returned";
export type DeliveryType = "Delivery" | "Pickup";

export type OrderItem = {
  id: string;
  name: string;
  /** Path under /public, e.g. /images/prod1.png */
  image: string;
  /** Unit price in NGN. */
  price: number;
  quantity: number;
  /** Defaults to "Unit" / "Units" depending on quantity. */
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
  /** Month abbreviation, e.g. "Sept". Omitted once a step is too far off to date. */
  month?: string;
  /** Day number, e.g. "12". Omitted until the step has a known date. */
  day?: string;
  /** e.g. "02:15 PM". Omitted until the step has happened. */
  time?: string;
  state: TrackStepState;
};

export type OrderRating = {
  stars: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  submittedAt: string;
};

export type Order = {
  /** Without the "LX-" prefix, e.g. "10482". */
  id: string;
  placedAt: string; // ISO 8601
  status: OrderStatus;
  deliveryType: DeliveryType;
  receiverPhone: string;
  deliveryAddress: string;
  email: string;
  items: OrderItem[];
  /** Flat amount already knocked off the items total, in NGN. */
  discount: number;
  deliveryFee: number;
  track: TrackStep[];
  rating?: OrderRating;
};

/* ------------------------------------------------------------------ */
/* Derived values                                                      */
/* ------------------------------------------------------------------ */

/** Distinct line items in the order (what the list badges as "N items"). */
export function getItemsCount(order: Order): number {
  return order.items.length;
}

/** Sum of price × quantity across every line item. */
export function getItemsTotal(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/** Items total, less the order-level discount, plus delivery. */
export function getOrderTotal(order: Order): number {
  return getItemsTotal(order) - order.discount + order.deliveryFee;
}

export function getUnitLabel(item: OrderItem): string {
  if (item.unitLabel) return item.unitLabel;
  return item.quantity === 1 ? "Unit" : "Units";
}

export function isRatable(order: Order): boolean {
  return order.status === "completed";
}

const ORDER_ID_PREFIX = "LX-";

export function formatOrderId(order: Pick<Order, "id">): string {
  return `#${ORDER_ID_PREFIX}${order.id}`;
}

// "en-US" gives the "Sep 12, 2026" / "2:15PM" ordering used in the design,
// regardless of the server/browser's own locale.
const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const timeFmt = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

/** 2026-09-12T14:15:00 -> "Sep 12, 2026" */
export function formatOrderDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

/** 2026-09-12T14:15:00 -> "2:15PM" */
export function formatOrderTime(iso: string): string {
  return timeFmt.format(new Date(iso)).replace(" ", "").toUpperCase();
}

/** 2026-09-12T14:15:00 -> "Sep 12, 2026 – 2:15PM" */
export function formatOrderDateTime(iso: string): string {
  return `${formatOrderDate(iso)} – ${formatOrderTime(iso)}`;
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  "in-progress": "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  returned: "Returned",
};

/* ------------------------------------------------------------------ */
/* Mock items                                                          */
/* ------------------------------------------------------------------ */

const pringles: OrderItem = {
  id: "pringles-original-40g",
  name: "Pringles Original 40G",
  image: "/images/prod3.png",
  price: 1700,
  quantity: 1,
};
const shushuParfait: OrderItem = {
  id: "shushu-parfait-500ml",
  name: "Shushu Parfait 500Ml",
  image: "/images/prod9.png",
  price: 3490,
  quantity: 2,
};
const heineken: OrderItem = {
  id: "heineken-can-beer-33cl",
  name: "Heineken Can Beer 33Cl",
  image: "/images/prod16.png",
  price: 810,
  quantity: 10,
};
const peakPowder: OrderItem = {
  id: "peak-powder-tin-2500g",
  name: "Peak Powder Tin 2500G",
  image: "/images/prod18.png",
  price: 34090,
  quantity: 1,
};
const regalCakeRusks: OrderItem = {
  id: "regal-original-cake-rusks-28-pieces",
  name: "Regal Original Cake Rusks 28 Pieces",
  image: "/images/prod13.png",
  price: 25050,
  quantity: 1,
};
const vijuVSmartic: OrderItem = {
  id: "viju-v-smartic-wheat-flavoured-milk-drink-1l",
  name: "Viju V-Smartic Wheat Flavoured Milk Drink 1L",
  image: "/images/prod15.png",
  price: 2590,
  quantity: 2,
};
const familySizeBread: OrderItem = {
  id: "family-size-bread",
  name: "Family Size Bread",
  image: "/images/prod11.png",
  price: 1530,
  quantity: 1,
};
const indomieChicken: OrderItem = {
  id: "indomie-super-pack-chicken-flavour-120g",
  name: "Indomie Super Pack Chicken Flavour 120Grms",
  image: "/images/prod2.png",
  price: 370,
  quantity: 40,
};
const lacocoVodka: OrderItem = {
  id: "lacoco-liqueur-vodka-24x200ml",
  name: "Lacoco Liqueur Vodka 24 X 200Ml",
  image: "/images/prod5.png",
  price: 850,
  quantity: 5,
};
const goldenPennyPasta: OrderItem = {
  id: "golden-penny-pasta-spaghetti-500g",
  name: "Golden Penny Pasta Spaghetti 500G",
  image: "/images/prod4.png",
  price: 1060,
  quantity: 10,
};
const beetroot: OrderItem = {
  id: "fresh-beetroot-loose",
  name: "Fresh Beetroot, Loose",
  image: "/images/prod6.png",
  price: 6738,
  quantity: 1,
};
const atarodo: OrderItem = {
  id: "atarodo-500g",
  name: "Atarodo 500G",
  image: "/images/prod7.png",
  price: 6000,
  quantity: 1,
};
const okro: OrderItem = {
  id: "okro-500g",
  name: "Okro 500G",
  image: "/images/prod8.png",
  price: 2500,
  quantity: 1,
};
const meatPie: OrderItem = {
  id: "meat-pie",
  name: "Meat Pie",
  image: "/images/prod8.png",
  price: 1020,
  quantity: 6,
};
const sweetBite: OrderItem = {
  id: "sweet-bite",
  name: "Sweet Bite",
  image: "/images/prod13.png",
  price: 1110,
  quantity: 4,
};
const frostyBite: OrderItem = {
  id: "frosty-bite-ice-cream-fantasy",
  name: "Frosty Bite Ice-Cream Fantasy",
  image: "/images/prod15.png",
  price: 1280,
  quantity: 2,
};
const fayrouz: OrderItem = {
  id: "fayrouz-pineapple-can",
  name: "Fayrouz Pineapple Can",
  image: "/images/prod17.png",
  price: 600,
  quantity: 12,
};
const fanta: OrderItem = {
  id: "fanta-orange-can-drink",
  name: "Fanta Orange Can Drink",
  image: "/images/prod20.png",
  price: 520,
  quantity: 12,
};
const mecChills: OrderItem = {
  id: "mec-chills-parfait-400ml",
  name: "Mec Chills Parfait 400Ml",
  image: "/images/prod19.png",
  price: 3660,
  quantity: 1,
};
const hollandiaYoghurt: OrderItem = {
  id: "hollandia-yoghurt-sweetened",
  name: "Hollandia Yoghurt Sweetened",
  image: "/images/prod1.png",
  price: 1840,
  quantity: 2,
};
const titusSardines: OrderItem = {
  id: "titus-sardines-125g",
  name: "Titus Sardines 125G",
  image: "/images/prod4.png",
  price: 1580,
  quantity: 3,
};
const vitamilk: OrderItem = {
  id: "vitamilk-soyamilk-glass-bottle",
  name: "Vitamilk Soyamilk In Glass Bottle",
  image: "/images/prod3.png",
  price: 1450,
  quantity: 2,
};

/* ------------------------------------------------------------------ */
/* Track step builders                                                 */
/* ------------------------------------------------------------------ */

function doneStep(
  id: TrackStepId,
  title: string,
  description: string,
  month: string,
  day: string,
  time: string,
): TrackStep {
  return { id, title, description, month, day, time, state: "done" };
}

function activeStep(
  id: TrackStepId,
  title: string,
  description: string,
  month: string,
  day: string,
  time?: string,
): TrackStep {
  return { id, title, description, month, day, time, state: "active" };
}

function pendingStep(
  id: TrackStepId,
  title: string,
  description: string,
  month?: string,
): TrackStep {
  return { id, title, description, month, state: "pending" };
}

const STEP_COPY: Record<
  Exclude<TrackStepId, "cancelled" | "refunded">,
  { title: string; description: string }
> = {
  placed: {
    title: "Order Placed",
    description: "The order has been placed successfully",
  },
  payment: {
    title: "Payment Confirmed",
    description: "Your payment has been received and confirmed",
  },
  packed: {
    title: "Order Packed",
    description: "All items from your order has been packed",
  },
  "out-for-delivery": {
    title: "Out for Delivery",
    description: "Your package has been sent from our store to you",
  },
  received: {
    title: "Package Received",
    description: "Package received by the recipient",
  },
  rate: {
    title: "Don't forget to rate",
    description: "Share your feedback about this order",
  },
};

type BaseStepId = Exclude<TrackStepId, "cancelled" | "refunded">;

/** Full six-step track for a completed order, everything marked done. */
function completedTrack(month: string, day: string, times: string[]): TrackStep[] {
  const ids: BaseStepId[] = [
    "placed",
    "payment",
    "packed",
    "out-for-delivery",
    "received",
    "rate",
  ];
  return ids.map((id, i) =>
    doneStep(id, STEP_COPY[id].title, STEP_COPY[id].description, month, day, times[i]),
  );
}

/** Track for an order still in progress, stopped at `activeId`. */
function inProgressTrack(
  month: string,
  day: string,
  doneTimes: Partial<Record<BaseStepId, string>>,
  activeId: BaseStepId,
): TrackStep[] {
  const order: BaseStepId[] = [
    "placed",
    "payment",
    "packed",
    "out-for-delivery",
    "received",
    "rate",
  ];
  const activeIndex = order.indexOf(activeId);

  return order.map((id, i) => {
    const { title, description } = STEP_COPY[id];
    if (i < activeIndex) {
      return doneStep(id, title, description, month, day, doneTimes[id] ?? "");
    }
    if (i === activeIndex) {
      return activeStep(id, title, description, month, day, doneTimes[id]);
    }
    // Steps that still have a rough day, but not yet a date/time.
    return pendingStep(id, title, description, i === order.length - 1 ? undefined : month);
  });
}

function closedTrack(
  month: string,
  day: string,
  time: string,
  kind: "cancelled" | "returned",
): TrackStep[] {
  return [
    doneStep("placed", STEP_COPY.placed.title, STEP_COPY.placed.description, month, day, time),
    doneStep(
      "payment",
      STEP_COPY.payment.title,
      STEP_COPY.payment.description,
      month,
      day,
      time,
    ),
    kind === "cancelled"
      ? doneStep(
          "cancelled",
          "Order Cancelled",
          "This order was cancelled and will not be delivered",
          month,
          day,
          time,
        )
      : doneStep(
          "refunded",
          "Order Returned & Refunded",
          "Your refund has been processed back to your wallet",
          month,
          day,
          time,
        ),
  ];
}

/* ------------------------------------------------------------------ */
/* Mock orders                                                         */
/* ------------------------------------------------------------------ */

const SHARED_CONTACT = {
  receiverPhone: "+234 813 456 7890",
  deliveryAddress: "13 Leo Junction, Oba Adesida Road, Akure, Ondo State, Nigeria",
  email: "ayobami.designs@gmail.com",
};

export const ORDERS: Order[] = [
  {
    id: "10482",
    placedAt: "2026-09-12T14:15:00",
    status: "in-progress",
    deliveryType: "Delivery",
    ...SHARED_CONTACT,
    items: [pringles, shushuParfait, heineken, peakPowder],
    discount: 0,
    deliveryFee: 2500,
    track: inProgressTrack(
      "Sept",
      "12",
      { placed: "02:15 PM", payment: "02:15 PM", packed: "12:23 PM" },
      "packed",
    ),
  },
  {
    id: "10371",
    placedAt: "2026-09-08T14:15:00",
    status: "completed",
    deliveryType: "Delivery",
    ...SHARED_CONTACT,
    items: [
      regalCakeRusks,
      vijuVSmartic,
      familySizeBread,
      indomieChicken,
      lacocoVodka,
      goldenPennyPasta,
    ],
    discount: 5000,
    deliveryFee: 2500,
    track: completedTrack("Sept", "12", [
      "02:15 PM",
      "02:15 PM",
      "02:23 PM",
      "02:40 PM",
      "03:32 PM",
      "03:51 PM",
    ]),
    rating: {
      stars: 5,
      comment:
        "I love hw the delivery was made. it was fast and the products are okay, I have no problem with it.",
      submittedAt: "2026-09-12T15:51:00",
    },
  },
  {
    id: "10342",
    placedAt: "2026-09-04T11:05:00",
    status: "completed",
    deliveryType: "Delivery",
    ...SHARED_CONTACT,
    items: [beetroot, atarodo, okro, mecChills],
    discount: 0,
    deliveryFee: 2000,
    track: completedTrack("Sept", "4", [
      "11:05 AM",
      "11:05 AM",
      "11:20 AM",
      "11:45 AM",
      "01:10 PM",
      "01:30 PM",
    ]),
    // Not rated yet: the tracker's last step is ready for the person to act on.
  },
  {
    id: "10298",
    placedAt: "2026-08-29T09:40:00",
    status: "completed",
    deliveryType: "Pickup",
    ...SHARED_CONTACT,
    items: [
      meatPie,
      sweetBite,
      frostyBite,
      fayrouz,
      fanta,
      hollandiaYoghurt,
      titusSardines,
      vitamilk,
    ],
    discount: 1500,
    deliveryFee: 0,
    track: completedTrack("Aug", "29", [
      "09:40 AM",
      "09:40 AM",
      "10:02 AM",
      "10:30 AM",
      "11:15 AM",
      "11:40 AM",
    ]),
    rating: {
      stars: 4,
      comment: "Pickup was quick, one item was slightly damaged but support sorted it fast.",
      submittedAt: "2026-08-29T12:00:00",
    },
  },
  {
    id: "10241",
    placedAt: "2026-08-22T16:20:00",
    status: "completed",
    deliveryType: "Delivery",
    ...SHARED_CONTACT,
    items: [hollandiaYoghurt, titusSardines, vitamilk, shushuParfait, familySizeBread],
    discount: 0,
    deliveryFee: 2500,
    track: completedTrack("Aug", "22", [
      "04:20 PM",
      "04:20 PM",
      "04:35 PM",
      "05:00 PM",
      "06:05 PM",
      "06:20 PM",
    ]),
    rating: {
      stars: 5,
      comment: "Always fresh, always on time. My go-to for weekly groceries.",
      submittedAt: "2026-08-22T19:00:00",
    },
  },
];

export const CANCELLED_ORDERS: Order[] = [
  {
    id: "10197",
    placedAt: "2026-08-15T10:00:00",
    status: "cancelled",
    deliveryType: "Delivery",
    ...SHARED_CONTACT,
    items: [peakPowder, indomieChicken],
    discount: 0,
    deliveryFee: 2500,
    track: closedTrack("Aug", "15", "10:00 AM", "cancelled"),
  },
  {
    id: "10063",
    placedAt: "2026-07-30T13:30:00",
    status: "returned",
    deliveryType: "Delivery",
    ...SHARED_CONTACT,
    items: [lacocoVodka],
    discount: 0,
    deliveryFee: 2000,
    track: closedTrack("Jul", "30", "01:30 PM", "returned"),
  },
];

/* ------------------------------------------------------------------ */
/* Query helpers                                                       */
/* ------------------------------------------------------------------ */

export type OrdersTab = "orders" | "cancelled";

export function getOrdersByTab(tab: OrdersTab): Order[] {
  return tab === "orders" ? ORDERS : CANCELLED_ORDERS;
}

export function getAllOrders(): Order[] {
  return [...ORDERS, ...CANCELLED_ORDERS];
}

export function getOrderById(id: string): Order | undefined {
  return getAllOrders().find((o) => o.id === id);
}

/** Which tab an order belongs in, for deep-linking to /orders?order=ID. */
export function getTabForOrder(id: string): OrdersTab | undefined {
  if (ORDERS.some((o) => o.id === id)) return "orders";
  if (CANCELLED_ORDERS.some((o) => o.id === id)) return "cancelled";
  return undefined;
}

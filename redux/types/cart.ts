export type CartItem = {
  /** id, or id::variant when the product has variants */
  key: string;
  id: string;
  slug: string;
  name: string;
  /** Price of ONE unit (display only; the server prices the order) */
  price: number;
  image: string;
  quantity: number;
  variant?: string;
};

export type PromoInfo = {
  code: string;
  percentOff: number;
};

export type CartState = {
  items: CartItem[];
  addressId: string;
  phone: string;
  deliveryMethod: string;
  promo: PromoInfo | null;
  /** true once the saved cart has been loaded from localStorage */
  hydrated: boolean;
};

export type ValidatePromoRequest = {
  code: string;
  itemsTotal: number;
};

export type PlaceOrderItem = {
  productId: string;
  quantity: number;
  variant?: string;
};

export type PlaceOrderRequest = {
  items: PlaceOrderItem[];
  addressId: string;
  phone: string;
  deliveryMethod: string;
  promoCode?: string;
};

export type OrderResponse = {
  id: number | string;
  orderNumber: string;
  payment: {
    reference: string,
    authorizationUrl: string,
    amount: number,
    currency: string,
  },
};

/* ------------------------------------------------------------------ */
/* Server-side cart (sync across devices, and for a signed-in user's    */
/* abandoned-cart recovery). Line items reuse PlaceOrderItem's shape —  */
/* the server always re-derives name/price/image from its own catalog. */
/* ------------------------------------------------------------------ */

/**
 * Line items reuse PlaceOrderItem's required fields (productId, quantity,
 * variant). The display fields are optional add-ons: if the backend ever
 * starts returning them (it already has the catalog on hand when building
 * this response), the merge into the local cart can render the item right
 * away instead of only being able to top up a quantity we already know
 * about locally.
 */
export type ServerCartItem = PlaceOrderItem & {
  slug?: string;
  name?: string;
  image?: string;
  price?: number;
};

export type ServerCart = {
  items: ServerCartItem[];
  address: string;
  phone: string;
  deliveryMethod: string;
  promo: PromoInfo | null;
  updatedAt: string;
};

/** PUT /cart — replaces the account's saved cart with the client's. */
export type SyncCartRequest = {
  items: PlaceOrderItem[];
};

/** POST /cart/merge — called right after login to fold a guest cart in. */
export type MergeCartRequest = {
  items: PlaceOrderItem[];
};

/* ------------------------------------------------------------------ */
/* Pre-checkout validation — client prices/stock can be stale by the    */
/* time the person actually checks out.                                */
/* ------------------------------------------------------------------ */

export type ValidateCartRequest = {
  items: PlaceOrderItem[];
};

export type CartIssueCode =
  | "out_of_stock"
  | "price_changed"
  | "quantity_reduced"
  | "removed";

export type CartItemIssue = {
  productId: string;
  variant?: string;
  code: CartIssueCode;
  /** Present for "price_changed": the item's current unit price. */
  newPrice?: number;
  /** Present for "quantity_reduced": the max quantity still available. */
  maxQuantity?: number;
  message: string;
};

export type ValidateCartResponse = {
  valid: boolean;
  issues: CartItemIssue[];
};
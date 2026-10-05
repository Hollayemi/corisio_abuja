/** The store a cart item belongs to. Every item carries one: carts are per store. */
export type StoreRef = {
  storeId: string;
  storeName: string;
  storeSlug?: string;
  storeLogo?: string | null;
};

export type CartItem = StoreRef & {
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

/** Checkout choices that belong to one store's cart. */
export type StoreCartSettings = {
  deliveryMethod: string;
  promo: PromoInfo | null;
};

export type CartState = {
  /** Every item in the cart, across stores; each one knows its store */
  items: CartItem[];
  /** Delivery method and promo per store, keyed by storeId */
  stores: Record<string, StoreCartSettings>;
  /** Shared by every store's checkout */
  addressId: string;
  phone: string;
  /** true once the saved cart has been loaded from localStorage */
  hydrated: boolean;
};

/** One store's slice of the cart, as the drawer shows it. */
export type StoreCartGroup = StoreRef & {
  items: CartItem[];
  count: number;
  itemsTotal: number;
  deliveryMethod: string;
  promo: PromoInfo | null;
};

export type ValidatePromoRequest = {
  storeId: string;
  code: string;
  itemsTotal: number;
};

export type PlaceOrderItem = {
  productId: string;
  quantity: number;
  variant?: string;
};

/** One order is placed per store. */
export type PlaceOrderRequest = {
  storeId: string;
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
/* Server-side cart: one saved cart per store (sync across devices, and  */
/* abandoned-cart recovery). Line items reuse PlaceOrderItem's shape —   */
/* the server always re-derives name/price/image from its own catalog.   */
/* ------------------------------------------------------------------ */

/**
 * Line items reuse PlaceOrderItem's required fields (productId, quantity,
 * variant). The display fields are optional add-ons: when the backend sends
 * them, the merge into the local cart can render an item it has never seen on
 * this device; without them it can only top up quantities of known items.
 */
export type ServerCartItem = PlaceOrderItem & {
  slug?: string;
  name?: string;
  image?: string;
  price?: number;
};

/** GET /cart returns one of these per store the account has a cart with. */
export type ServerStoreCart = {
  storeId: string;
  storeName?: string;
  storeSlug?: string;
  storeLogo?: string | null;
  items: ServerCartItem[];
  updatedAt?: string;
};

/** PUT /cart (SyncCartDto): replaces the account's saved cart for ONE store. */
export type SyncCartRequest = {
  storeId: string;
  items: PlaceOrderItem[];
};

/** POST /cart/merge: folds a guest cart for ONE store in, right after login. */
export type MergeCartRequest = SyncCartRequest;

/* ------------------------------------------------------------------ */
/* Pre-checkout validation — client prices/stock can be stale by the    */
/* time the person actually checks out.                                */
/* ------------------------------------------------------------------ */

export type ValidateCartRequest = {
  storeId: string;
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
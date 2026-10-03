import type { CartItem } from "./cart-store";

/**
 * Checkout settings and PLACEHOLDER backend calls.
 * Replace checkPromo() and placeOrder() with your real API.
 */

export type DeliveryMethod = { id: string; label: string; fee: number };

export const DELIVERY_METHODS: DeliveryMethod[] = [
  { id: "rider", label: "Rider Delivery (Price varies per location)", fee: 2500 },
  { id: "pickup", label: "Store Pickup", fee: 0 },
];

/** Placeholder promo codes: code -> percent off the items total. */
const PROMO_CODES: Record<string, number> = {
  WELCOME10: 10,
};

/** Returns the percent off for a valid code, or null. */
export function checkPromo(code: string): number | null {
  return PROMO_CODES[code.trim().toUpperCase()] ?? null;
}

export type OrderPayload = {
  items: CartItem[];
  address: string;
  phone: string;
  deliveryMethod: string;
  promoCode: string;
  totals: {
    itemsTotal: number;
    discount: number;
    deliveryFee: number;
    total: number;
  };
};

/** PLACEHOLDER: pretends to place an order and returns a fake order number. */
export async function placeOrder(
  payload: OrderPayload,
): Promise<{ orderId: string }> {
  void payload;
  await new Promise((resolve) => setTimeout(resolve, 700));
  return { orderId: `LX-${Math.floor(10000 + Math.random() * 90000)}` };
}

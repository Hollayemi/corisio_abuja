export type DeliveryMethod = { id: string; label: string; fee: number };

/**
 * Delivery methods shown in the cart.
 * Static for now; if your backend serves them, add a query to redux/slices/cartApi.ts.
 */
export const DELIVERY_METHODS: DeliveryMethod[] = [
  { id: "rider", label: "Rider Delivery (Price varies per location)", fee: 2500 },
  { id: "pickup", label: "Store Pickup", fee: 0 },
];

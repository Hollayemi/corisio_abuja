import { useSyncExternalStore } from "react";

/**
 * Cart state that lives outside React, so any component can read it with
 * useCart() and any code can change it with addItem(), removeItem() etc.
 * It is saved in localStorage and stays in sync across browser tabs.
 */

export type CartItem = {
  /** id, or id::variant when the product has variants */
  key: string;
  id: string;
  slug: string;
  name: string;
  /** Price of ONE unit */
  price: number;
  image: string;
  quantity: number;
  variant?: string;
};

export type CartState = {
  items: CartItem[];
  address: string;
  phone: string;
  deliveryMethod: string;
  promoCode: string;
};

const STORAGE_KEY = "luxol:cart:v1";
export const MAX_QUANTITY = 99;

const EMPTY_STATE: CartState = {
  items: [],
  address: "",
  phone: "",
  deliveryMethod: "",
  promoCode: "",
};

let state: CartState = EMPTY_STATE;
let hydrated = false;
let storageBound = false;
const listeners = new Set<() => void>();

/* ------------------------------------------------------------------ */
/* Storage                                                             */
/* ------------------------------------------------------------------ */

const str = (v: unknown) => (typeof v === "string" ? v : "");

function isItem(v: unknown): v is CartItem {
  if (!v || typeof v !== "object") return false;
  const i = v as Record<string, unknown>;
  return (
    typeof i.key === "string" &&
    typeof i.id === "string" &&
    typeof i.slug === "string" &&
    typeof i.name === "string" &&
    typeof i.image === "string" &&
    typeof i.price === "number" &&
    Number.isInteger(i.quantity) &&
    (i.quantity as number) > 0
  );
}

function parse(raw: string | null): CartState {
  if (!raw) return EMPTY_STATE;
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    return {
      items: Array.isArray(data.items) ? data.items.filter(isItem) : [],
      address: str(data.address),
      phone: str(data.phone),
      deliveryMethod: str(data.deliveryMethod),
      promoCode: str(data.promoCode),
    };
  } catch {
    return EMPTY_STATE;
  }
}

function readStorage() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function commit(next: CartState) {
  state = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage can be blocked (private mode); the cart still works in memory.
  }
  emit();
}

/* ------------------------------------------------------------------ */
/* Store plumbing for useSyncExternalStore                             */
/* ------------------------------------------------------------------ */

function subscribe(listener: () => void) {
  listeners.add(listener);

  if (!storageBound && typeof window !== "undefined") {
    storageBound = true;
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY || e.key === null) {
        state = parse(e.newValue);
        emit();
      }
    });
  }

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): CartState {
  if (!hydrated && typeof window !== "undefined") {
    hydrated = true;
    state = parse(readStorage());
  }
  return state;
}

function getServerSnapshot(): CartState {
  return EMPTY_STATE;
}

/* ------------------------------------------------------------------ */
/* Actions                                                             */
/* ------------------------------------------------------------------ */

const clamp = (n: number) =>
  Math.min(MAX_QUANTITY, Math.max(1, Math.floor(n) || 1));

export function addItem(
  input: Omit<CartItem, "key" | "quantity">,
  quantity = 1,
) {
  const current = getSnapshot();
  const key = input.variant ? `${input.id}::${input.variant}` : input.id;
  const qty = clamp(quantity);
  const existing = current.items.find((i) => i.key === key);

  const items = existing
    ? current.items.map((i) =>
        i.key === key ? { ...i, quantity: clamp(i.quantity + qty) } : i,
      )
    : [...current.items, { ...input, key, quantity: qty }];

  commit({ ...current, items });
}

export function removeItem(key: string) {
  const current = getSnapshot();
  commit({ ...current, items: current.items.filter((i) => i.key !== key) });
}

export function setQuantity(key: string, quantity: number) {
  const current = getSnapshot();
  commit({
    ...current,
    items: current.items.map((i) =>
      i.key === key ? { ...i, quantity: clamp(quantity) } : i,
    ),
  });
}

/** Empties the items and promo code, keeps address, phone and delivery method. */
export function clearCart() {
  const current = getSnapshot();
  commit({ ...current, items: [], promoCode: "" });
}

export function setAddress(address: string) {
  commit({ ...getSnapshot(), address });
}

export function setPhone(phone: string) {
  commit({ ...getSnapshot(), phone });
}

export function setDeliveryMethod(deliveryMethod: string) {
  commit({ ...getSnapshot(), deliveryMethod });
}

export function setPromoCode(promoCode: string) {
  commit({ ...getSnapshot(), promoCode });
}

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

export const itemsTotalOf = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0);

/** Full cart state plus the number of cart lines and the items total. */
export function useCart() {
  const cart = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    ...cart,
    count: cart.items.length,
    itemsTotal: itemsTotalOf(cart.items),
  };
}

/** Number of different items in the cart (for the header badge). */
export function useCartCount() {
  return useSyncExternalStore(
    subscribe,
    () => getSnapshot().items.length,
    () => 0,
  );
}

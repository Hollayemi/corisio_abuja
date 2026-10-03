import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type { CartItem, CartState, PromoInfo, ServerCartItem } from "../types";

export const MAX_QUANTITY = 99;

/** The part of the cart that is saved in localStorage */
export type PersistedCart = Omit<CartState, "hydrated">;

const initialState: CartState = {
  items: [],
  addressId: "",
  phone: "",
  deliveryMethod: "",
  promo: null,
  hydrated: false,
};

const clamp = (n: number) =>
  Math.min(MAX_QUANTITY, Math.max(1, Math.floor(n) || 1));

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /** Loads the saved cart (or nothing) and marks the cart as ready */
    hydrateCart(state, action: PayloadAction<PersistedCart | null>) {
      if (action.payload) {
        state.items = action.payload.items;
        state.addressId = action.payload.addressId;
        state.phone = action.payload.phone;
        state.deliveryMethod = action.payload.deliveryMethod;
        state.promo = action.payload.promo;
      }
      state.hydrated = true;
    },

    addItem(
      state,
      action: PayloadAction<{
        item: Omit<CartItem, "key" | "quantity">;
        quantity?: number;
      }>,
    ) {
      const { item, quantity = 1 } = action.payload;
      const key = item.variant ? `${item.id}::${item.variant}` : item.id;
      const qty = clamp(quantity);
      const existing = state.items.find((i) => i.key === key);

      if (existing) existing.quantity = clamp(existing.quantity + qty);
      else state.items.push({ ...item, key, quantity: qty });
    },

    /**
     * Folds the account's saved cart into the local one. Called whenever the
     * server cart is fetched (sign-in, or a fresh load while signed in) —
     * never on every keystroke, and never in a way that can drop something
     * the person just put in their cart on this device:
     *  - an item we already know locally just gets its quantity topped up
     *  - an item we've never seen locally is only added if the server sent
     *    enough to render it (name/image/price); otherwise it's skipped
     *    rather than shown broken.
     */
    mergeServerCart(state, action: PayloadAction<ServerCartItem[]>) {
      for (const server of action.payload) {
        const key = server.variant ? `${server.productId}::${server.variant}` : server.productId;
        const existing = state.items.find((i) => i.key === key);

        if (existing) {
          existing.quantity = clamp(Math.max(existing.quantity, server.quantity));
        } else if (server.name && server.image && typeof server.price === "number") {
          state.items.push({
            key,
            id: server.productId,
            slug: server.slug ?? server.productId,
            name: server.name,
            price: server.price,
            image: server.image,
            quantity: clamp(server.quantity),
            variant: server.variant,
          });
        }
      }
    },

    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.key !== action.payload);
    },

    setQuantity(state, action: PayloadAction<{ key: string; quantity: number }>) {
      const item = state.items.find((i) => i.key === action.payload.key);
      if (item) item.quantity = clamp(action.payload.quantity);
    },

    /** Empties the items and promo, keeps address, phone and delivery method */
    clearCart(state) {
      state.items = [];
      state.promo = null;
    },

    setAddress(state, action: PayloadAction<string>) {
      state.addressId = action.payload;
    },
    setPhone(state, action: PayloadAction<string>) {
      state.phone = action.payload;
    },
    setDeliveryMethod(state, action: PayloadAction<string>) {
      state.deliveryMethod = action.payload;
    },
    setPromo(state, action: PayloadAction<PromoInfo | null>) {
      state.promo = action.payload;
    },
  },
});

export const {
  hydrateCart,
  mergeServerCart,
  addItem,
  removeItem,
  setQuantity,
  clearCart,
  setAddress,
  setPhone,
  setDeliveryMethod,
  setPromo,
} = cartSlice.actions;

export default cartSlice.reducer;

/* Selectors */

export const selectCart = (state: RootState) => state.cart;

/** Number of different items (matches "Your Cart (4)") */
export const selectCartCount = (state: RootState) => state.cart.items.length;

export const selectItemsTotal = (state: RootState) =>
  state.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

/** True once `id` (with this variant, if any) is already in the cart. */
export const makeSelectIsInCart = (id: string, variant?: string) => (state: RootState) => {
  const key = variant ? `${id}::${variant}` : id;
  return state.cart.items.some((i) => i.key === key);
};
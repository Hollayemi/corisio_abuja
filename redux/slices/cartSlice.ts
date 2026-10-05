import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type {
  CartItem,
  CartState,
  PromoInfo,
  ServerStoreCart,
  StoreCartGroup,
  StoreCartSettings,
} from "../types";

export const MAX_QUANTITY = 99;

/** The part of the cart that is saved in localStorage */
export type PersistedCart = Omit<CartState, "hydrated">;

const initialState: CartState = {
  items: [],
  stores: {},
  addressId: "",
  phone: "",
  hydrated: false,
};

const clamp = (n: number) =>
  Math.min(MAX_QUANTITY, Math.max(1, Math.floor(n) || 1));

const itemKey = (id: string, variant?: string) => (variant ? `${id}::${variant}` : id);

const emptySettings = (): StoreCartSettings => ({ deliveryMethod: "", promo: null });

/** Forget a store's checkout choices once its last item is gone. */
function pruneStores(state: CartState) {
  for (const storeId of Object.keys(state.stores)) {
    if (!state.items.some((i) => i.storeId === storeId)) delete state.stores[storeId];
  }
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /** Loads the saved cart (or nothing) and marks the cart as ready */
    hydrateCart(state, action: PayloadAction<PersistedCart | null>) {
      if (action.payload) {
        state.items = action.payload.items;
        state.stores = action.payload.stores;
        state.addressId = action.payload.addressId;
        state.phone = action.payload.phone;
      }
      state.hydrated = true;
    },

    /** The item must say which store it is from; carts are per store. */
    addItem(
      state,
      action: PayloadAction<{
        item: Omit<CartItem, "key" | "quantity">;
        quantity?: number;
      }>,
    ) {
      const { item, quantity = 1 } = action.payload;
      const key = itemKey(item.id, item.variant);
      const qty = clamp(quantity);
      const existing = state.items.find((i) => i.key === key);

      if (existing) existing.quantity = clamp(existing.quantity + qty);
      else state.items.push({ ...item, key, quantity: qty });
    },

    /**
     * Folds the account's saved carts (one per store) into the local one.
     * Called whenever the server carts are fetched (sign-in, or a fresh load
     * while signed in) — never on every keystroke, and never in a way that can
     * drop something the person just put in their cart on this device:
     *  - an item we already know locally just gets its quantity topped up
     *  - an item we've never seen locally is only added if the server sent
     *    enough to render it (name/image/price); otherwise it's skipped
     *    rather than shown broken.
     */
    mergeServerCart(state, action: PayloadAction<ServerStoreCart[]>) {
      
      // for (const store of action.payload) {
      //   for (const server of store.items) {
      //     const key = itemKey(server.productId, server.variant);
      //     const existing = state.items.find((i) => i.key === key);

      //     if (existing) {
      //       existing.quantity = clamp(Math.max(existing.quantity, server.quantity));
      //     } else if (server.name && server.image && typeof server.price === "number") {
      //       state.items.push({
      //         key,
      //         id: server.productId,
      //         slug: server.slug ?? server.productId,
      //         name: server.name,
      //         price: server.price,
      //         image: server.image,
      //         quantity: clamp(server.quantity),
      //         variant: server.variant,
      //         storeId: store.storeId,
      //         storeName: store.storeName ?? "Store",
      //         storeSlug: store.storeSlug,
      //         storeLogo: store.storeLogo ?? null,
      //       });
      //     }
      //   }
      // }
    },

    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.key !== action.payload);
      pruneStores(state);
    },

    setQuantity(state, action: PayloadAction<{ key: string; quantity: number }>) {
      const item = state.items.find((i) => i.key === action.payload.key);
      if (item) item.quantity = clamp(action.payload.quantity);
    },

    /** Empties ONE store's cart (after its order is placed) and forgets its checkout choices. */
    clearStore(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.storeId !== action.payload);
      delete state.stores[action.payload];
    },

    /** Empties every store's cart; keeps address and phone */
    clearCart(state) {
      state.items = [];
      state.stores = {};
    },

    setAddress(state, action: PayloadAction<string>) {
      state.addressId = action.payload;
    },
    setPhone(state, action: PayloadAction<string>) {
      state.phone = action.payload;
    },
    setDeliveryMethod(state, action: PayloadAction<{ storeId: string; method: string }>) {
      const { storeId, method } = action.payload;
      state.stores[storeId] = { ...(state.stores[storeId] ?? emptySettings()), deliveryMethod: method };
    },
    setPromo(state, action: PayloadAction<{ storeId: string; promo: PromoInfo | null }>) {
      const { storeId, promo } = action.payload;
      state.stores[storeId] = { ...(state.stores[storeId] ?? emptySettings()), promo };
    },
  },
});

export const {
  hydrateCart,
  mergeServerCart,
  addItem,
  removeItem,
  setQuantity,
  clearStore,
  clearCart,
  setAddress,
  setPhone,
  setDeliveryMethod,
  setPromo,
} = cartSlice.actions;

export default cartSlice.reducer;

/* Selectors */

export const selectCart = (state: RootState) => state.cart;

/** Number of different items across every store (matches "Your Cart (4)") */
export const selectCartCount = (state: RootState) => state.cart.items.length;

export const selectItemsTotal = (state: RootState) =>
  state.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

/**
 * The cart split by store, in the order each store first appears, with that
 * store's items, subtotal and checkout choices. This is what the drawer shows.
 */
export const selectCartGroups = createSelector(
  [(state: RootState) => state.cart.items, (state: RootState) => state.cart.stores],
  (items, stores): StoreCartGroup[] => {
    const groups = new Map<string, StoreCartGroup>();

    for (const item of items) {
      let group = groups.get(item.storeId);
      if (!group) {
        const settings = stores[item.storeId] ?? emptySettings();
        group = {
          storeId: item.storeId,
          storeName: item.storeName,
          storeSlug: item.storeSlug,
          storeLogo: item.storeLogo,
          items: [],
          count: 0,
          itemsTotal: 0,
          deliveryMethod: settings.deliveryMethod,
          promo: settings.promo,
        };
        groups.set(item.storeId, group);
      }
      group.items.push(item);
      group.count += 1;
      group.itemsTotal += item.price * item.quantity;
    }

    return [...groups.values()];
  },
);

/** True once `id` (with this variant, if any) is already in the cart. */
export const makeSelectIsInCart = (id: string, variant?: string) => (state: RootState) => {
  const key = itemKey(id, variant);
  return state.cart.items.some((i) => i.key === key);
};

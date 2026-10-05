"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { useAuth } from "@/lib/auth/hooks";
import { useAppDispatch, useAppStore } from "./hooks";
import baseApi from "./slices/baseApi";
import { cartApi, useGetServerCartQuery, useSyncCartMutation } from "./slices/cartApi";
import { hydrateCart, mergeServerCart, type PersistedCart } from "./slices/cartSlice";
import { makeStore, type AppStore } from "./store";
import type {
  CartItem,
  PlaceOrderItem,
  ServerStoreCart,
  StoreCartSettings,
} from "./types";

/** How long the cart has to sit still before a signed-in change is saved. */
const SYNC_DEBOUNCE_MS = 1500;

// v3: items carry their store and checkout choices are per store. Carts saved
// by older versions have no store on their items, so they are not carried over.
const CART_STORAGE_KEY = "corisio:cart:v3";


const str = (v: unknown) => (typeof v === "string" ? v : "");

function isItem(v: unknown): v is CartItem {
  if (!v || typeof v !== "object") return false;
  const i = v as Record<string, unknown>;
  return (
    typeof i.key === "string" &&
    typeof i.id === "string" &&
    typeof i.storeId === "string" &&
    i.storeId.length > 0 &&
    typeof i.storeName === "string" &&
    typeof i.slug === "string" &&
    typeof i.name === "string" &&
    typeof i.image === "string" &&
    typeof i.price === "number" &&
    Number.isInteger(i.quantity) &&
    (i.quantity as number) > 0
  );
}

function parseStores(raw: unknown): Record<string, StoreCartSettings> {
  const stores: Record<string, StoreCartSettings> = {};
  if (!raw || typeof raw !== "object") return stores;

  for (const [storeId, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== "object") continue;
    const v = value as Record<string, unknown>;
    const promo = v.promo as Record<string, unknown> | null | undefined;

    stores[storeId] = {
      deliveryMethod: str(v.deliveryMethod),
      promo:
        promo &&
        typeof promo.code === "string" &&
        typeof promo.percentOff === "number"
          ? { code: promo.code, percentOff: promo.percentOff }
          : null,
    };
  }
  return stores;
}

function parseCart(raw: string | null): PersistedCart | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    const items = Array.isArray(data.items) ? data.items.filter(isItem) : [];

    // Only keep checkout choices for stores that still have items
    const stores = parseStores(data.stores);
    for (const storeId of Object.keys(stores)) {
      if (!items.some((i) => i.storeId === storeId)) delete stores[storeId];
    }

    return {
      items,
      stores,
      addressId: str(data.addressId),
      phone: str(data.phone),
    };
  } catch {
    return null;
  }
}

function readStorage() {
  try {
    return window.localStorage.getItem(CART_STORAGE_KEY);
  } catch {
    return null;
  }
}

function CartPersistence() {
  const store = useAppStore();

  useEffect(() => {
    store.dispatch(hydrateCart(parseCart(readStorage())));

    let last = "";
    const unsubscribe = store.subscribe(() => {
      const { cart } = store.getState();
      if (!cart.hydrated) return;

      const persisted: PersistedCart = {
        items: cart.items,
        stores: cart.stores,
        addressId: cart.addressId,
        phone: cart.phone,
      };
      const json = JSON.stringify(persisted);
      if (json === last) return;
      last = json;

      try {
        window.localStorage.setItem(CART_STORAGE_KEY, json);
      } catch {
        // Storage can be blocked (private mode); the cart still works in memory.
      }
    });

    function onStorage(e: StorageEvent) {
      if (e.key === CART_STORAGE_KEY) {
        store.dispatch(hydrateCart(parseCart(e.newValue)));
      }
    }
    window.addEventListener("storage", onStorage);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", onStorage);
    };
  }, [store]);

  return null;
}


/** The cart as the server wants it: SyncCartDto-shaped, one entry per store. */
function groupForServer(items: CartItem[]) {
  const byStore = new Map<string, PlaceOrderItem[]>();

  for (const i of items) {
    const list = byStore.get(i.storeId) ?? [];
    list.push({ productId: i.id, quantity: i.quantity, variant: i.variant });
    byStore.set(i.storeId, list);
  }
  return [...byStore].map(([storeId, items]) => ({ storeId, items }));
}

function AuthSync() {
  const { status } = useAuth();
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      // Signed out: drop anything cached from the previous user
      dispatch(baseApi.util.resetApiState());
      wasAuthenticated.current = false;
      return;
    }

    // Just signed in (credentials, Google or a fresh registration all land
    // here): fold whatever was in the guest cart into the account's saved
    // cart. Best-effort — the local cart already has everything it needs
    // to keep working even if this call fails.
    if (status === "authenticated" && !wasAuthenticated.current) {
      wasAuthenticated.current = true;

      const { cart } = store.getState();
      const stores = groupForServer(cart.items);

      if (stores.length > 0) {
        // One merge call per store (the endpoint takes a single storeId)
        Promise.all(
          stores.map((s) =>
            dispatch(cartApi.endpoints.mergeCart.initiate(s))
              .unwrap()
              .then((res) => res.data)
              // Best-effort — the local cart already has everything it needs
              // to keep working even if one store's merge call fails.
              .catch(() => null),
          ),
        ).then((results) => {
          const merged = results.filter((r): r is ServerStoreCart => !!r);
          if (merged.length > 0) dispatch(mergeServerCart(merged));
        });
      }
    }
  }, [dispatch, status, store]);

  return null;
}

/**
 * Keeps the local cart topped up from the account's saved cart.
 *
 * Fetches GET /cart (one saved cart per store) only while signed in (never for
 * guests) and folds whatever comes back into the local cart via mergeServerCart, which only
 * ever adds/raises quantities — it never removes something already in the
 * cart on this device. Runs once per sign-in (and again whenever "Cart" is
 * invalidated by a sync/merge/order), not on every render.
 */
function ServerCartSync() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const { data } = useGetServerCartQuery(undefined, { skip: !isAuthenticated });
  const lastMerged = useRef<string>("");

  useEffect(() => {
    if (!data?.data) return;
    // Skip re-merging the exact same snapshot (RTK Query re-runs this
    // effect whenever the query result reference changes).
    const stamp = JSON.stringify(data.data);
    if (stamp === lastMerged.current) return;
    lastMerged.current = stamp;
    dispatch(mergeServerCart(data.data));
  }, [data, dispatch]);

  return null;
}

/**
 * Saves the cart to the account in the background — only while signed in,
 * one PUT /cart per store whose items changed (SyncCartDto is per store), and
 * debounced so it fires once after things settle rather than on every
 * add/remove. This is a convenience for cross-device continuity; checkout does
 * its own best-effort sync for the store being bought right before placing the
 * order regardless.
 */
function CartAutoSync() {
  const store = useAppStore();
  const { isAuthenticated } = useAuth();
  const [syncCart] = useSyncCartMutation();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    // What each store's saved cart looked like the last time we sent it
    const sent = new Map<string, string>();

    const flush = () => {
      const { cart } = store.getState();
      if (!cart.hydrated) return;

      const stores = groupForServer(cart.items);
      const current = new Set(stores.map((s) => s.storeId));

      // One PUT per store whose items changed
      for (const { storeId, items } of stores) {
        const json = JSON.stringify(items);
        if (sent.get(storeId) === json) continue;
        sent.set(storeId, json);
        syncCart({ storeId, items }).unwrap().catch(() => {});
      }

      // A store we synced earlier that is now empty (removed, or its order was
      // placed): clear its saved cart too, so it doesn't come back later.
      for (const storeId of [...sent.keys()]) {
        if (current.has(storeId)) continue;
        sent.delete(storeId);
        syncCart({ storeId, items: [] }).unwrap().catch(() => {});
      }
    };

    const unsubscribe = store.subscribe(() => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, SYNC_DEBOUNCE_MS);
    });

    return () => {
      unsubscribe();
      if (timer.current) clearTimeout(timer.current);
    };
  }, [isAuthenticated, store, syncCart]);

  return null;
}


/** Wraps the app in the Redux store; AuthSync below keeps the cart in step with sign in / out. */
export default function ReduxProvider({ children }: { children: ReactNode }) {
  const [store] = useState<AppStore>(makeStore);

  return (
    <Provider store={store}>
      <CartPersistence />
      <AuthSync />
      <ServerCartSync />
      <CartAutoSync />
      {children}
    </Provider>
  );
}
"use client";

import { useEffect, type ReactNode } from "react";
import { DialogProvider } from "@/app/components/dialog/DialogProvider";
import NotificationHost from "@/app/components/notifications/NotificationHost";
import { notify } from "@/lib/notify";
import { useAppDispatch } from "@/redux/hooks";
import ReduxProvider from "@/redux/provider";
import { addItem } from "@/redux/slices/cartSlice";
/**
 * Listens for the "cart:add" event that ProductCard, ProductRow and the
 * product page's Add to Cart button dispatch, and puts the product in the cart.
 * The event says which store the product is from (carts are per store).
 */
function CartEvents() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    function onAdd(e: Event) {
      const d = (e as CustomEvent).detail;
      if (!d || typeof d.id !== "string" || typeof d.price !== "number") return;

      if (typeof d.storeId !== "string" || !d.storeId) {
        // Every product should come with its store; refuse rather than add an
        // item the cart can't group or the server can't sync.
        notify.error("Couldn't add to cart", {
          message: "We couldn't tell which store this product is from. Please refresh and try again.",
        });
        return;
      }

      dispatch(
        addItem({
          item: {
            id: d.id,
            slug: String(d.slug ?? d.id),
            name: String(d.name ?? "Product"),
            storeId: d.storeId,
            storeName: String(d.storeName ?? "Store"),
            storeSlug: typeof d.storeSlug === "string" ? d.storeSlug : undefined,
            storeLogo: typeof d.storeLogo === "string" ? d.storeLogo : null,
            price: d.price,
            image: String(d.image ?? ""),
            variant: typeof d.variant === "string" ? d.variant : undefined,
          },
          quantity:
            Number.isInteger(d.quantity) && d.quantity > 0 ? d.quantity : 1,
        }),
      );
    }

    window.addEventListener("cart:add", onAdd);
    return () => window.removeEventListener("cart:add", onAdd);
  }, [dispatch]);

  return null;
}

/**
 * Order matters:
 *   ReduxProvider    store (RTK Query + cart); also keeps the cart in step with the auth state
 *   DialogProvider   dialogs render CartDrawer/AuthDialog, which use Redux + auth
 *
 * <NotificationHost /> renders whatever notify.success()/error()/... sends (app/lib/notify.ts).
 */
export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider>
      <DialogProvider>
        {children}
        <CartEvents />
        <NotificationHost />
      </DialogProvider>
    </ReduxProvider>
  );
}

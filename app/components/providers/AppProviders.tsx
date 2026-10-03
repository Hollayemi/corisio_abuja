"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect, type ReactNode } from "react";
import { DialogProvider } from "@/app/components/dialog/DialogProvider";
import NotificationHost from "@/app/components/notifications/NotificationHost";
import { useAppDispatch } from "@/redux/hooks";
import ReduxProvider from "@/redux/provider";
import { addItem } from "@/redux/slices/cartSlice";
// app/layout.tsx (server component)
import { getServerSession, Session } from "next-auth";
/**
 * Listens for the "cart:add" event that ProductCard, ProductRow and the
 * product page's Add to Cart button dispatch, and puts the product in the cart.
 */
function CartEvents() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    function onAdd(e: Event) {
      const d = (e as CustomEvent).detail;
      if (!d || typeof d.id !== "string" || typeof d.price !== "number") return;

      dispatch(
        addItem({
          item: {
            id: d.id,
            slug: String(d.slug ?? d.id),
            name: String(d.name ?? "Product"),
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
 *   SessionProvider  next-auth session (useSession)
 *   ReduxProvider    store; reads the session to get the API token
 *   DialogProvider   dialogs render CartDrawer/AuthDialog, which use Redux + the session
 *
 * <NotificationHost /> renders whatever notify.success()/error()/... sends (app/lib/notify.ts).
 */
export default function AppProviders({ children, session }: { children: ReactNode, session: Session | null }) {
  return (
    <SessionProvider session={session}>
      <ReduxProvider>
        <DialogProvider>
          {children}
          <CartEvents />
          <NotificationHost />
        </DialogProvider>
      </ReduxProvider>
    </SessionProvider>
  );
}

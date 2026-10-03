"use client";

import { useCallback } from "react";
import { useDialog } from "@/app/components/dialog/DialogProvider";
import CartDrawer from "./CartDrawer";

/** Returns a function that opens the cart as a dialog stuck to the right. */
export default function useOpenCart() {
  const { openDialog } = useDialog();

  return useCallback(
    () =>
      openDialog(<CartDrawer />, {
        title: "Your cart",
        side: "right",
        width: "md",
      }),
    [openDialog],
  );
}

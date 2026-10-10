"use client";

import { useEffect, useRef } from "react";
import { subscribeUnauthorized } from "@/lib/auth/unauthorized";
import { useDialog } from "../dialog/DialogProvider";
import useOpenAuth from "./useOpenAuth";

/** Failures that arrive together (a page firing several requests at once) open one dialog. */
const BURST_MS = 800;

const GUEST_NOTICE = "Please sign in to continue.";
const EXPIRED_NOTICE = "Your session has expired. Please sign in again.";

/**
 * Opens the sign-in dialog whenever an API call answers 401 (see lib/auth/unauthorized.ts).
 * Renders nothing; mounted once in AppProviders.
 *
 * It never stacks or resets: while its own dialog is still the one on screen, further
 * 401s are ignored, so someone halfway through typing a password isn't thrown back to
 * an empty form. If they close it and another call fails later, it opens again.
 */
export default function UnauthorizedPrompt() {
  const { activeId } = useDialog();
  const openAuth = useOpenAuth();

  // The listener below is set up once; these keep it pointed at the latest values.
  const activeIdRef = useRef(activeId);
  const openAuthRef = useRef(openAuth);
  useEffect(() => {
    activeIdRef.current = activeId;
    openAuthRef.current = openAuth;
  });

  const ownDialogId = useRef<number | null>(null);
  const lastOpenedAt = useRef(0);

  useEffect(
    () =>
      subscribeUnauthorized(({ sessionExpired }) => {
        const now = Date.now();
        if (now - lastOpenedAt.current < BURST_MS) return;
        if (ownDialogId.current !== null && ownDialogId.current === activeIdRef.current) return;

        lastOpenedAt.current = now;
        ownDialogId.current = openAuthRef.current("login", {
          notice: sessionExpired ? EXPIRED_NOTICE : GUEST_NOTICE,
        });
      }),
    [],
  );

  return null;
}

"use client";

import { useCallback } from "react";
import AuthDialog, { type AuthView } from "./AuthDialog";
import { useDialog } from "../dialog/DialogProvider";

const TITLES: Record<AuthView, string> = {
  login: "Sign in",
  register: "Create your account",
  forgot: "Forgot password",
  welcome: "Welcome",
};

/** Returns openAuth(view) which opens the auth dialog on "login", "register" or "forgot". */
export default function useOpenAuth() {
  const { openDialog } = useDialog();

  return useCallback(
    (view: AuthView = "login") =>
      openDialog(<AuthDialog initialView={view} />, {
        title: TITLES[view],
        side: "right",
        width: "md",
      }),
    [openDialog],
  );
}

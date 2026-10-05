"use client";

import { useCallback } from "react";
import type { SignupAccountType } from "@/redux/types";
import AuthDialog, { type AuthView } from "./AuthDialog";
import { useDialog } from "../dialog/DialogProvider";

const TITLES: Record<AuthView, string> = {
  login: "Sign in",
  register: "Create your account",
  forgot: "Forgot password",
  welcome: "Welcome",
};

/**
 * Returns openAuth(view, options) which opens the auth dialog on "login",
 * "register" or "forgot". openAuth("register", { accountType: STORE_OWNER })
 * opens the register form with "I own a store" already picked.
 */
export default function useOpenAuth() {
  const { openDialog } = useDialog();

  return useCallback(
    (view: AuthView = "login", options?: { accountType?: SignupAccountType }) =>
      openDialog(
        <AuthDialog initialView={view} initialAccountType={options?.accountType} />,
        {
          title: TITLES[view],
          side: "right",
          width: "md",
        },
      ),
    [openDialog],
  );
}

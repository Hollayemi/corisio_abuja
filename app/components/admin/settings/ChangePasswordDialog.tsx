"use client";

import { useState } from "react";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import { useChangeAdminPasswordMutation } from "@/redux/slices/adminSettingsApi";
import { PasswordField } from "./Controls";
import { MIN_PASSWORD_LENGTH } from "./formatters";

export type ChangePasswordDialogProps = { close: () => void };

/** Old / New / Confirm password, opened from the Security tab. */
export function ChangePasswordDialog({ close }: ChangePasswordDialogProps) {
  const [changePassword, { isLoading }] = useChangeAdminPasswordMutation();
  const [oldPassword, setOld] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Messages appear once the person has tried to submit, so typing isn't nagged
  const newError =
    newPassword.length > 0 && newPassword.length < MIN_PASSWORD_LENGTH
      ? `Use at least ${MIN_PASSWORD_LENGTH} characters.`
      : newPassword.length > 0 && newPassword === oldPassword
        ? "Choose a password you haven't used here."
        : "";
  const confirmError =
    confirmPassword.length > 0 && confirmPassword !== newPassword ? "The passwords don't match." : "";

  const complete = !!oldPassword && !!newPassword && !!confirmPassword;
  const valid = complete && !newError && !confirmError;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!valid || isLoading) return;
    setError("");

    try {
      await changePassword({ oldPassword, newPassword, confirmPassword }).unwrap();
      notify.success("Password changed", { message: "Your password was updated." });
      close();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5 p-6 sm:p-8">
      <h2 className="sr-only">Change password</h2>

      <PasswordField
        label="Old Password"
        value={oldPassword}
        onChange={setOld}
        autoComplete="current-password"
        autoFocus
      />
      <PasswordField
        label="New Password"
        value={newPassword}
        onChange={setNew}
        autoComplete="new-password"
        error={newError}
      />
      <PasswordField
        label="Confirm New Password"
        value={confirmPassword}
        onChange={setConfirm}
        autoComplete="new-password"
        error={confirmError}
      />

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      {submitted && !complete && (
        <p role="alert" className="text-sm text-red-600">
          Fill in all three fields.
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="h-14 w-full rounded-xl bg-corisio-500 text-base font-medium text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
      >
        {isLoading ? "Changing..." : "Change"}
      </button>
    </form>
  );
}

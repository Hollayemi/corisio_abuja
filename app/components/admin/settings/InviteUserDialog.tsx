"use client";

import { useState } from "react";
import { SelectField, TextField } from "@/app/components/admin/inventory/fields";
import { ModalHeader } from "@/app/components/admin/inventory/ModalHeader";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import { useInviteAdminUserMutation, useListAdminRolesQuery } from "@/redux/slices/adminSettingsApi";
import { EMAIL_PATTERN } from "./formatters";

export type InviteUserDialogProps = { close: () => void };

/** "Add New Admin User": email + role, then an invitation link is emailed. */
export function InviteUserDialog({ close }: InviteUserDialogProps) {
  const roles = useListAdminRolesQuery();
  const [invite, { isLoading }] = useInviteAdminUserMutation();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");

  const emailValid = EMAIL_PATTERN.test(email.trim());
  const valid = emailValid && role !== "";

  async function handleSend() {
    if (!valid || isLoading) return;
    setError("");
    try {
      await invite({ email: email.trim(), role: role.toUpperCase() }).unwrap();
      notify.success("Invite sent", { message: `An invitation link was emailed to ${email.trim()}.` });
      close();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <>
      <ModalHeader title="Settings" onBack={close} />

      <div className="max-h-[calc(90dvh-73px)] overflow-y-auto px-6 py-8 sm:px-12">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-200 pb-6">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">Add New Admin User</h3>
            <p className="mt-1.5 text-sm text-neutral-400">Grant access to the supermarket management portal.</p>
          </div>
          <button
            type="button"
            onClick={handleSend}
            disabled={!valid || isLoading}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-corisio-500 px-5 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" aria-hidden="true">
              <path d="M21 3L3 10.5l7 3 3 7z" />
              <path d="M10 13.5L21 3" />
            </svg>
            {isLoading ? "Sending..." : "Send Invite"}
          </button>
        </div>

        <div className="mt-6 space-y-8">
          <TextField
            label="Email Address"
            hint="An invitation link will be sent to this email address."
            value={email}
            onChange={setEmail}
            placeholder="Enter the email address"
          />
          {email !== "" && !emailValid && (
            <p role="alert" className="-mt-6 text-xs text-red-600">
              Enter a valid email address.
            </p>
          )}

          <SelectField
            label="User's Role"
            value={role}
            onChange={setRole}
            options={roles.data?.data.items ?? []}
            placeholder={roles.isLoading ? "Loading roles..." : "Select the role of the user"}
            disabled={roles.isLoading || !roles.data?.data.items.length}
          />
          {roles.isError && (
            <p role="alert" className="-mt-6 text-xs text-red-600">
              {getErrorMessage(roles.error)}{" "}
              <button type="button" onClick={roles.refetch} className="font-medium underline">
                Try again
              </button>
            </p>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

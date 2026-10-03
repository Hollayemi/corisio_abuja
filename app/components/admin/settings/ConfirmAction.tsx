"use client";

import { useState } from "react";
import { getErrorMessage } from "@/redux/config/errors";

export type ConfirmActionProps = {
  title: string;
  description: string;
  confirmLabel: string;
  /** Throw (or reject) to keep the dialog open and show the message. */
  onConfirm: () => Promise<void>;
  close: () => void;
};

/**
 * A small confirm dialog that stays open and shows the error if the action
 * fails, and only closes when it worked.
 */
export function ConfirmAction({ title, description, confirmLabel, onConfirm, close }: ConfirmActionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    setLoading(true);
    setError("");
    try {
      await onConfirm();
      close();
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
      <p className="mt-2 text-sm text-neutral-500">{description}</p>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={close}
          disabled={loading}
          className="h-10 rounded-lg border border-neutral-300 px-4 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading}
          className="h-10 rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-70"
        >
          {loading ? "Please wait..." : confirmLabel}
        </button>
      </div>
    </div>
  );
}

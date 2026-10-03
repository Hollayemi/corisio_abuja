"use client";

import { useState } from "react";

/**
 * Content for a small centered confirm dialog, for use with useDialog():
 *   openDialog(({ close }) => (
 *     <ConfirmDialog title="Delete product?" ... onConfirm={...} close={close} />
 *   ), { side: "center", width: "sm" });
 */
export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Delete",
  destructive = true,
  onConfirm,
  close,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => Promise<void> | void;
  close: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
      close();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
      <p className="mt-2 text-sm text-neutral-500">{description}</p>

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
          className={`h-10 rounded-lg px-4 text-sm font-medium text-white transition disabled:cursor-wait disabled:opacity-70 ${
            destructive ? "bg-red-600 hover:bg-red-700" : "bg-corisio-blue hover:brightness-110"
          }`}
        >
          {loading ? "Please wait..." : confirmLabel}
        </button>
      </div>
    </div>
  );
}

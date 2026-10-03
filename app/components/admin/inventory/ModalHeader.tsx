import type { ReactNode } from "react";
import AdminIcon from "@/app/components/admin/layout/AdminIcon";

/** The header bar shared by every inventory modal: back/close + title + actions. */
export function ModalHeader({
  title,
  onBack,
  onClose,
  actions,
}: {
  title: string;
  /** Shows a "← Back" control (form screens reached from a list) */
  onBack?: () => void;
  /** Shows an "×" close control (top-level list screens) */
  onClose?: () => void;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-neutral-100 px-6 py-5 sm:px-8">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-md py-1 pr-2 text-sm text-neutral-600 transition hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-corisio-blue"
          >
            <AdminIcon name="arrowLeft" className="size-4" />
            Back
          </button>
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-7 items-center justify-center rounded-md border border-neutral-200 text-neutral-600 transition hover:bg-neutral-50"
          >
            <AdminIcon name="close" className="size-4" />
          </button>
        )}
        <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </div>
  );
}

export function ModalButton({
  children,
  variant = "primary",
  loading,
  ...props
}: {
  children: ReactNode;
  variant?: "primary" | "secondary";
  loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      disabled={loading || props.disabled}
      className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
        variant === "primary"
          ? "bg-corisio-blue text-white hover:brightness-110"
          : "border border-neutral-300 text-neutral-900 hover:bg-neutral-50"
      }`}
      {...props}
    >
      {children}
    </button>
  );
}

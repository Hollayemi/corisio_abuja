"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { EyeIcon, EyeOffIcon, InfoIcon } from "@/app/components/ui/icons";

export const inputClass =
  "h-[52px] w-full rounded-xl border border-neutral-200 bg-neutral-100/70 px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-corisio-blue focus:outline-none focus:ring-2 focus:ring-corisio-blue/30";

export const labelClass = "block text-sm font-semibold text-neutral-900";

function Label({
  htmlFor,
  children,
  hint,
}: {
  htmlFor: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label htmlFor={htmlFor} className={`${labelClass} mb-2 flex items-center gap-1.5`}>
      {children}
      {hint && (
        <span title={hint} className="text-neutral-400">
          <InfoIcon className="size-3.5" />
        </span>
      )}
    </label>
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function TextField({ label, hint, id, className = "", ...props }: FieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div>
      <Label htmlFor={inputId} hint={hint}>
        {label}
      </Label>
      <input id={inputId} className={`${inputClass} ${className}`} {...props} />
    </div>
  );
}

export function PasswordField({ label, id, className = "", ...props }: FieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <Label htmlFor={inputId}>{label}</Label>
      <div className="relative">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          className={`${inputClass} pr-12 ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-neutral-600"
        >
          {visible ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
        </button>
      </div>
    </div>
  );
}

export function PhoneField({
  label,
  id,
  className = "",
  ...props
}: FieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div>
      <Label htmlFor={inputId}>{label}</Label>
      <div className={`${inputClass} flex items-center gap-2 px-4`}>
        <span className="shrink-0 text-sm text-neutral-500">+234</span>
        <span aria-hidden="true" className="h-5 w-px bg-neutral-300" />
        <input
          id={inputId}
          type="tel"
          inputMode="numeric"
          className={`h-full min-w-0 flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}

export function SelectField({
  label,
  id,
  hint,
  className = "",
  children,
  ...props
}: Omit<FieldProps, "value" | "defaultValue"> &
  React.SelectHTMLAttributes<HTMLSelectElement>) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div>
      <Label htmlFor={inputId} hint={hint}>
        {label}
      </Label>
      <select
        id={inputId}
        className={`${inputClass} appearance-none bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10 ${className}`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23737373' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
        }}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

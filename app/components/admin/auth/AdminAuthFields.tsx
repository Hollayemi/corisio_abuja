"use client";

import { useId, type InputHTMLAttributes } from "react";
import { LockIcon } from "@/app/components/ui/icons";

/** A read-only field with a lock icon, for values the user can't change. */
export function LockedField({
  label,
  value,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "id" | "readOnly" | "value"> & {
  label: string;
  value: string;
}) {
  const id = useId();

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-neutral-900">
        {label}
      </label>
      <div className="relative mt-2.5">
        <input
          id={id}
          type="email"
          value={value}
          readOnly
          className="h-[52px] w-full rounded-lg border border-neutral-400 bg-[#e7e5e0] px-4 pr-12 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-corisio-blue/30"
          {...props}
        />
        <LockIcon
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-neutral-700"
        />
      </div>
    </div>
  );
}

export function CheckboxField({
  label,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "id" | "type"> & {
  label: string;
}) {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-2 text-xs text-neutral-800"
    >
      <input
        id={id}
        type="checkbox"
        className="size-4 cursor-pointer rounded accent-corisio-blue"
        {...props}
      />
      {label}
    </label>
  );
}

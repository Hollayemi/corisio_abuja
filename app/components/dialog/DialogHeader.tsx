"use client";

import { CloseIcon } from "@/app/components/ui/icons";
import { useDialog } from "./DialogProvider";

export default function DialogHeader({
  title,
  className = "",
}: {
  title: string;
  className?: string;
}) {
  const { closeDialog } = useDialog();

  return (
    <div className={`shrink-0 px-6 pt-6 ${className}`}>
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
        <button
          type="button"
          onClick={closeDialog}
          aria-label="Close"
          className="rounded-md p-1.5 text-neutral-800 transition hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
        >
          <CloseIcon className="size-5" />
        </button>
      </div>
    </div>
  );
}

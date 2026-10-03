"use client";

import { CheckCircleIcon, MixedMeatIcon } from "@/app/components/ui/icons";
import type { Allocation } from "@/app/data/subscription-checkout-data";
import type { MembershipProtein } from "@/redux/types";

export default function ProteinCard({
  protein,
  allocation,
  onToggle,
  onAdjust,
  canDecrease,
  canIncrease,
}: {
  protein: MembershipProtein;
  allocation: Allocation;
  onToggle: () => void;
  onAdjust: (delta: number) => void;
  canDecrease: boolean;
  canIncrease: boolean;
}) {
  const selected = protein.id in allocation;
  const percent = allocation[protein.id];

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-2xl border transition ${
        selected ? "border-corisio-blue" : "border-neutral-200"
      }`}
    >
      {selected && (
        <span className="absolute left-3 top-3 z-10 flex size-6 items-center justify-center rounded-full bg-corisio-blue text-white">
          <CheckCircleIcon className="size-4" />
        </span>
      )}

      <div className="flex h-28 items-center justify-center bg-neutral-100 text-neutral-400">
        {protein.image ? (
          // Uploaded by staff on the admin Membership page (any host, so not next/image)
          // eslint-disable-next-line @next/next/no-img-element
          <img src={protein.image} alt={protein.label} className="size-full object-cover" />
        ) : (
          <MixedMeatIcon className="size-12" />
        )}
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div>
          <p className="text-sm font-bold text-neutral-900">{protein.label}</p>
          {protein.description && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-500">
              {protein.description}
            </p>
          )}
        </div>

        {selected ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggle}
              className="h-9 flex-1 rounded-lg border border-neutral-300 px-2 text-xs font-semibold text-neutral-700 transition hover:border-corisio-blue hover:text-corisio-blue"
            >
              Unselect
            </button>
            <div className="flex h-9 shrink-0 items-center gap-1 rounded-full border border-neutral-200 px-1">
              <button
                type="button"
                onClick={() => onAdjust(-1)}
                disabled={!canDecrease}
                aria-label={`Decrease ${protein.label} share`}
                className="flex size-7 items-center justify-center rounded-full text-sm leading-none text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-30"
              >
                −
              </button>
              <span className="min-w-9 text-center text-xs font-semibold text-neutral-900">
                {percent}%
              </span>
              <button
                type="button"
                onClick={() => onAdjust(1)}
                disabled={!canIncrease}
                aria-label={`Increase ${protein.label} share`}
                className="flex size-7 items-center justify-center rounded-full text-sm leading-none text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onToggle}
            className="h-9 w-full rounded-lg bg-corisio-blue text-xs font-semibold text-white transition hover:brightness-110"
          >
            Select
          </button>
        )}
      </div>
    </div>
  );
}

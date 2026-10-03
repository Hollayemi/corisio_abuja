"use client";

import { useState } from "react";
import DialogHeader from "@/app/components/dialog/DialogHeader";
import {
  ALLOCATION_STEP,
  adjustAllocation,
  canDecrease as canDecreaseShare,
  canIncrease as canIncreaseShare,
  toMix,
  toggleProtein,
  type Allocation,
} from "@/app/data/subscription-checkout-data";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import {
  MEMBERSHIP_CATALOGUE_REFETCH,
  useListMembershipProteinsQuery,
  useUpdateMembershipMixMutation,
} from "@/redux/slices/membershipApi";
import type { MembershipProtein, MySubscription } from "@/redux/types";
import ProteinCard from "../checkout/components/ProteinCard";

/** The mix as it stands now, ignoring proteins staff have since switched off. */
function initialAllocation(sub: MySubscription, proteins: MembershipProtein[]): Allocation {
  const active = new Set(proteins.map((p) => p.id));
  const kept = sub.mix.filter((m) => active.has(m.protein.id));
  const total = kept.reduce((sum, m) => sum + m.percentage, 0);

  if (kept.length > 0 && kept.length === sub.mix.length && total === 100) {
    return Object.fromEntries(kept.map((m) => [m.protein.id, m.percentage]));
  }
  // A protein was removed (or shares don't add up): start from an even split.
  return kept.reduce<Allocation>((acc, m) => toggleProtein(acc, m.protein.id), {});
}

function sameAllocation(a: Allocation, b: Allocation) {
  const ak = Object.keys(a);
  return ak.length === Object.keys(b).length && ak.every((k) => a[k] === b[k]);
}

export default function UpdateMixDialog({
  sub,
  close,
}: {
  sub: MySubscription;
  close: () => void;
}) {
  const proteinsQuery = useListMembershipProteinsQuery(undefined, MEMBERSHIP_CATALOGUE_REFETCH);
  const proteins = proteinsQuery.data?.data.items;

  return (
    <div>
      <DialogHeader title="Update protein mix" />
      <div className="p-6">
        {proteinsQuery.isError ? (
          <div role="alert" className="py-8 text-center">
            <p className="text-sm text-neutral-600">{getErrorMessage(proteinsQuery.error)}</p>
            <button
              type="button"
              onClick={() => void proteinsQuery.refetch()}
              className="mt-4 h-10 rounded-lg border border-neutral-300 px-4 text-sm font-medium hover:bg-neutral-50"
            >
              Try again
            </button>
          </div>
        ) : !proteins ? (
          <div aria-hidden="true" className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl bg-neutral-100" />
            ))}
          </div>
        ) : (
          <MixEditor sub={sub} proteins={proteins} close={close} />
        )}
      </div>
    </div>
  );
}

function MixEditor({
  sub,
  proteins,
  close,
}: {
  sub: MySubscription;
  proteins: MembershipProtein[];
  close: () => void;
}) {
  const [updateMix] = useUpdateMembershipMixMutation();
  const [original] = useState(() => initialAllocation(sub, proteins));
  const [allocation, setAllocation] = useState<Allocation>(original);
  const [step, setStep] = useState<"edit" | "confirm">("edit");
  const [saving, setSaving] = useState(false);

  const selected = proteins.filter((p) => p.id in allocation);
  const changed = !sameAllocation(allocation, original);
  const canReview = selected.length > 0 && changed;

  async function handleConfirm() {
    setSaving(true);
    try {
      // { proteinId, percentage }[]: whole numbers adding up to 100
      await updateMix({ id: sub.id, mix: toMix(allocation) }).unwrap();
      notify.success("Protein mix updated", { message: "It applies from your next delivery." });
      close();
    } catch (err) {
      notify.error("Couldn't update your mix", { message: getErrorMessage(err) });
      setSaving(false);
    }
  }

  if (step === "confirm") {
    return (
      <div>
        <h3 className="text-base font-semibold text-neutral-900">Save this protein mix?</h3>
        <p className="mt-2 text-sm text-neutral-500">
          Your upcoming deliveries will use these shares instead of your current ones.
        </p>
        <ul className="mt-4 divide-y divide-neutral-200 rounded-2xl bg-neutral-50 px-5">
          {selected.map((p) => (
            <li key={p.id} className="flex justify-between py-3 text-sm">
              <span className="text-neutral-700">{p.label}</span>
              <span className="font-semibold text-neutral-900">{allocation[p.id]}%</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setStep("edit")}
            disabled={saving}
            className="h-10 rounded-lg border border-neutral-300 px-4 text-sm font-medium transition hover:bg-neutral-50 disabled:opacity-60"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving}
            className="h-10 rounded-lg bg-corisio-blue px-4 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
          >
            {saving ? "Saving…" : "Confirm update"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm leading-relaxed text-neutral-600">
        Choose the proteins you want and set each one&apos;s share. Shares always add up to 100%.
      </p>

      {proteins.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-neutral-50 p-5 text-sm text-neutral-500">
          No proteins are available right now. Please check back shortly.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {proteins.map((protein) => (
            <ProteinCard
              key={protein.id}
              protein={protein}
              allocation={allocation}
              onToggle={() => setAllocation(toggleProtein(allocation, protein.id))}
              onAdjust={(dir) =>
                setAllocation(adjustAllocation(allocation, protein.id, dir * ALLOCATION_STEP))
              }
              canDecrease={canDecreaseShare(allocation, protein.id)}
              canIncrease={canIncreaseShare(allocation, protein.id)}
            />
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={close}
          className="h-10 rounded-lg border border-neutral-300 px-4 text-sm font-medium transition hover:bg-neutral-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => setStep("confirm")}
          disabled={!canReview}
          className="h-10 rounded-lg bg-corisio-blue px-4 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
        >
          Review changes
        </button>
      </div>
    </div>
  );
}

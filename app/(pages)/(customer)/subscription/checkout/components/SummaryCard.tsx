import { CheckCircleIcon, TruckIcon } from "@/app/components/ui/icons";
import {
  INTERVAL_ADJECTIVE,
  INTERVAL_UNIT,
  formatPlanPrice,
} from "@/app/data/subscription-data";
import type { MembershipPlan } from "@/redux/types";

export default function SummaryCard({
  plan,
  selectedProteinNames,
  isValid,
  submitting,
  onSubmit,
}: {
  plan: MembershipPlan;
  selectedProteinNames: string[];
  isValid: boolean;
  submitting: boolean;
  onSubmit: () => void;
}) {
  return (
    <aside className="rounded-2xl bg-neutral-50 p-6 lg:sticky lg:top-24">
      <h2 className="text-lg font-bold text-neutral-900">Summary</h2>

      <div className="mt-4 rounded-2xl border border-corisio-yellow/50 bg-[#faf1e6] p-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-base font-bold text-corisio-blue">{plan.name} Membership</p>
          <p className="text-lg font-bold text-neutral-900">{formatPlanPrice(plan.price)}</p>
        </div>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Recurring {INTERVAL_ADJECTIVE[plan.interval]} subscription
        </p>

        <hr className="my-4 border-neutral-200/70" />

        <p className="text-sm text-neutral-600">
          Weekly supply of:{" "}
          <span className="font-semibold text-neutral-900">
            {selectedProteinNames.length > 0 ? selectedProteinNames.join(", ") : "—"}
          </span>
        </p>
        <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-corisio-blue">
          <TruckIcon className="size-4" />
          Free Priority Delivery Included
        </p>
      </div>

      <dl className="mt-5 flex flex-col divide-y divide-neutral-200">
        <div className="flex items-center justify-between py-3 text-sm">
          <dt className="text-neutral-500 capitalize">{INTERVAL_ADJECTIVE[plan.interval]} Plan Fee</dt>
          <dd className="font-semibold text-neutral-900">{formatPlanPrice(plan.price)}</dd>
        </div>
        <div className="flex items-center justify-between py-3 text-sm">
          <dt className="text-neutral-500">Delivery Cost</dt>
          <dd className="font-semibold text-corisio-blue">FREE</dd>
        </div>
        <div className="flex items-center justify-between py-3 text-base">
          <dt className="font-semibold text-neutral-900">Total Due Today</dt>
          <dd className="font-bold text-neutral-900">{formatPlanPrice(plan.price)}</dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={onSubmit}
        disabled={!isValid || submitting}
        className="mt-2 inline-flex h-[52px] w-full items-center justify-center rounded-xl bg-corisio-yellow px-6 text-sm font-semibold text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
      >
        {submitting ? "Processing…" : "Continue to Payment"}
      </button>

      <p className="mt-4 flex items-start gap-2 rounded-xl bg-white p-3 text-xs leading-relaxed text-neutral-500">
        <CheckCircleIcon className="mt-0.5 size-3.5 shrink-0 text-neutral-300" />
        Your next automated billing date will be exactly one {INTERVAL_UNIT[plan.interval]} from today.
        To be confirmed upon successful payment.
      </p>
    </aside>
  );
}

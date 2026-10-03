"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { CheckCircleIcon } from "@/app/components/ui/icons";
import { INTERVAL_UNIT, formatPlanPrice } from "@/app/data/subscription-data";
import { useGetMySubscriptionQuery } from "@/redux/slices/membershipApi";

export function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

/**
 * Where the payment provider sends the customer back to:
 * /subscription/checkout?subscription=<id>. While the payment webhook is still
 * landing the subscription is "pending_payment", so we poll until it flips.
 */
export default function ConfirmationClient({ subscriptionId }: { subscriptionId: string }) {
  const { status: sessionStatus } = useSession();
  const { data, isLoading, isError, refetch } = useGetMySubscriptionQuery(undefined, {
    pollingInterval: 4000,
    skip: sessionStatus !== "authenticated",
  });

  const sub = data?.data;
  const mismatch = !!sub && sub.id !== subscriptionId;

  if (sessionStatus === "loading" || (sessionStatus === "authenticated" && isLoading)) {
    return <div aria-hidden="true" className="mx-auto h-96 max-w-3xl animate-pulse rounded-2xl bg-neutral-100" />;
  }

  if (sessionStatus !== "authenticated") {
    return (
      <Notice
        title="Sign in to see your membership"
        body="Log in with the account you subscribed with to view this confirmation."
      />
    );
  }

  if (isError || !sub || mismatch) {
    return (
      <Notice
        title="We couldn't find that subscription"
        body="The link may be wrong, or it belongs to another account."
        action={
          <button
            type="button"
            onClick={() => void refetch()}
            className="inline-flex h-11 items-center rounded-lg border border-neutral-300 px-5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
          >
            Try again
          </button>
        }
      />
    );
  }

  if (sub.status === "pending_payment") {
    return (
      <Notice
        title="Confirming your payment…"
        body="This usually takes a few seconds. You can stay on this page, it will update on its own."
      />
    );
  }

  const rows: [string, string][] = [
    ["Selected Tier", `${sub.plan.name} Plan`],
    ["Billing Rate", `${formatPlanPrice(sub.plan.price)} / ${INTERVAL_UNIT[sub.plan.interval]}`],
    ["First Delivery", formatDate(sub.nextDeliveryAt)],
    ["Delivery Window", sub.deliveryWindow],
  ];

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center py-6 text-center sm:py-12">
      <span className="flex size-[72px] items-center justify-center rounded-2xl bg-corisio-blue text-white">
        <CheckCircleIcon className="size-10" />
      </span>
      <h2 className="mt-6 text-3xl font-bold text-neutral-900">You&apos;re all set!</h2>
      <p className="mt-2 text-sm text-neutral-500">Welcome to Luxol {sub.plan.name} Membership.</p>

      <h3 className="mt-14 text-base font-semibold text-neutral-900">Membership Confirmation</h3>
      <dl className="mt-5 w-full space-y-5 rounded-2xl bg-neutral-50 p-8 text-left">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 text-sm">
            <dt className="text-neutral-500">{label}</dt>
            <dd className="font-medium text-neutral-900">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-12 min-w-40 items-center justify-center rounded-lg bg-corisio-blue px-6 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Go to Home
        </Link>
        <Link
          href="/subscription/membership"
          className="inline-flex h-12 min-w-40 items-center justify-center rounded-lg border border-neutral-300 px-6 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
        >
          View Membership
        </Link>
      </div>
    </div>
  );
}

function Notice({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div role="status" className="flex flex-col items-center py-16 text-center">
      <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-neutral-500">{body}</p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/subscription"
          className="inline-flex h-11 items-center rounded-lg bg-corisio-blue px-5 text-sm font-semibold text-white transition hover:brightness-110"
        >
          See all plans
        </Link>
        {action}
      </div>
    </div>
  );
}

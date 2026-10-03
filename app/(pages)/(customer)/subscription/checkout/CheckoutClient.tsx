"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import useOpenAuth from "@/app/components/auth/useOpenAuth";
import { CheckCircleIcon } from "@/app/components/ui/icons";
import { SelectField } from "@/app/components/ui/form-fields";
import {
  ALLOCATION_STEP,
  adjustAllocation,
  canDecrease as canDecreaseShare,
  canIncrease as canIncreaseShare,
  toMix,
  toggleProtein,
  type Allocation,
} from "@/app/data/subscription-checkout-data";
import { INTERVAL_UNIT, formatPlanPrice } from "@/app/data/subscription-data";
import { getErrorMessage, isApiError } from "@/redux/config/errors";
import {
  MEMBERSHIP_CATALOGUE_REFETCH,
  useGetMembershipOptionsQuery,
  useGetMembershipPlanQuery,
  useListMembershipProteinsQuery,
  useSubscribeMutation,
} from "@/redux/slices/membershipApi";
import type {
  MembershipDeliveryFrequency,
  MembershipOptions,
  MembershipPlan,
  MembershipProtein,
} from "@/redux/types";

import ProteinCard from "./components/ProteinCard";
import SummaryCard from "./components/SummaryCard";
import { AddressSection } from "@/app/components/cart/CartDrawer";
import { useCart } from "@/redux/hooks";

/**
 * Loads the plan, proteins and delivery options from the API (the same data
 * staff manage on the admin Membership page), then hands them to the form.
 */
export default function CheckoutClient({ planSlug }: { planSlug: string }) {
  const planQuery = useGetMembershipPlanQuery(planSlug, MEMBERSHIP_CATALOGUE_REFETCH);
  const proteinsQuery = useListMembershipProteinsQuery(undefined, MEMBERSHIP_CATALOGUE_REFETCH);
  const optionsQuery = useGetMembershipOptionsQuery(undefined, MEMBERSHIP_CATALOGUE_REFETCH);

  const plan = planQuery.data?.data;
  const proteins = proteinsQuery.data?.data.items;
  const options = optionsQuery.data?.data;

  const failed = planQuery.isError || proteinsQuery.isError || optionsQuery.isError;
  const loading =
    !failed && (planQuery.isLoading || proteinsQuery.isLoading || optionsQuery.isLoading);

  // Staff may change a plan or protein while someone is on this page, so a
  // failed subscribe re-reads all three.
  function refresh() {
    void planQuery.refetch();
    void proteinsQuery.refetch();
    void optionsQuery.refetch();
  }

  if (loading) return <CheckoutSkeleton />;

  if (failed || !plan || !proteins || !options) {
    const planGone = isApiError(planQuery.error) && planQuery.error.status === 404;
    return (
      <div role="alert" className="flex flex-col items-center py-16 text-center">
        <h2 className="text-xl font-bold text-neutral-900">
          {planGone ? "That plan isn't available" : "We couldn't load this plan"}
        </h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-500">
          {planGone
            ? "It may have been updated or taken off sale. Pick from the current plans instead."
            : getErrorMessage(planQuery.error ?? proteinsQuery.error ?? optionsQuery.error)}
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/subscription"
            className="inline-flex h-11 items-center rounded-lg bg-corisio-blue px-5 text-sm font-semibold text-white transition hover:brightness-110"
          >
            See all plans
          </Link>
          {!planGone && (
            <button
              type="button"
              onClick={refresh}
              className="inline-flex h-11 items-center rounded-lg border border-neutral-300 px-5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <CheckoutForm
      key={plan.id}
      plan={plan}
      proteins={proteins}
      options={options}
      onRefresh={refresh}
    />
  );
}

function CheckoutForm({
  plan,
  proteins,
  options,
  onRefresh,
}: {
  plan: MembershipPlan;
  proteins: MembershipProtein[];
  options: MembershipOptions;
  onRefresh: () => void;
}) {
  const cart = useCart();
  const { status: sessionStatus } = useSession();
  const openAuth = useOpenAuth();
  const [subscribe, { isLoading: submitting }] = useSubscribeMutation();

  const [allocation, setAllocation] = useState<Allocation>({});
  // Start on the plan's usual schedule when it is one of the offered options
  const [frequencyId, setFrequencyId] = useState<MembershipDeliveryFrequency | "">(
    options.deliveryFrequencies.some((f) => f.id === plan.deliveryFrequency)
      ? plan.deliveryFrequency
      : "",
  );
  const [day, setDay] = useState("");
  const [deliveryWindow, setDeliveryWindow] = useState("");
  const [addressId, setAddressId] = useState(cart.addressId ?? "");

  const [redirecting, setRedirecting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // A protein staff switched off after a refresh can't stay in the mix: drop it
  // and rebalance the rest, without waiting for an effect.
  const activeAllocation = useMemo(() => {
    const gone = Object.keys(allocation).filter((id) => !proteins.some((p) => p.id === id));
    return gone.length > 0 ? gone.reduce(toggleProtein, allocation) : allocation;
  }, [allocation, proteins]);

  const selectedProteins = proteins.filter((p) => p.id in activeAllocation);
  const frequency = options.deliveryFrequencies.find((f) => f.id === frequencyId);
  const weeklyAmount = Math.round(plan.price / (frequency?.deliveriesPerMonth ?? 4));

  const isValid =
    selectedProteins.length > 0 &&
    !!frequency &&
    !!day &&
    !!deliveryWindow &&
    !!addressId

  async function handleSubmit() {
    if (!isValid || !frequency || submitting) return;

    // Subscribing needs an account
    if (sessionStatus !== "authenticated") {
      openAuth("login");
      return;
    }

    setSubmitError("");
    try {
      const res = await subscribe({
        planId: plan.id,
        mix: toMix(activeAllocation),
        deliveryFrequency: frequency.id,
        deliveryDay: day,
        deliveryWindow,
        addressId
      }).unwrap();

      setRedirecting(true);
      window.location.assign(res.data.payment.authorizationUrl);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
      onRefresh();
    }
  }

  if (redirecting) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-corisio-blue/10 text-corisio-blue">
          <CheckCircleIcon className="size-8" />
        </span>
        <h2 className="mt-6 text-xl font-bold text-neutral-900">Taking you to payment…</h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-500">
          Your {plan.name} membership is ready — {formatPlanPrice(plan.price)}/
          {INTERVAL_UNIT[plan.interval]}, {frequency?.label.toLowerCase()} on {day}s,{" "}
          {deliveryWindow}.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div>
        <h2 className="text-lg font-bold text-neutral-900">Review Your Membership Plan</h2>

        <p className="mt-4 rounded-2xl bg-[#f8f1e6] p-5 text-sm leading-relaxed text-neutral-700">
          <span className="font-semibold text-corisio-yellow">
            Customize your weekly protein mix:
          </span>{" "}
          Your {formatPlanPrice(plan.price)} membership is divided across your selected
          weekly deliveries. Choose the proteins you want from the list below — you can
          select one, several, or all of them — then set the percentage you&apos;d like
          for each. Each delivery, we&apos;ll use your selected percentages to prepare a{" "}
          {formatPlanPrice(weeklyAmount)} worth of protein mix for you.
        </p>

        <h3 className="mt-8 text-base font-semibold text-neutral-900">
          Select your preferred Protein Supply
        </h3>
        {proteins.length === 0 ? (
          <p className="mt-4 rounded-2xl bg-neutral-50 p-5 text-sm text-neutral-500">
            No proteins are available to choose right now. Please check back shortly.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {proteins.map((protein) => (
              <ProteinCard
                key={protein.id}
                protein={protein}
                allocation={activeAllocation}
                onToggle={() => setAllocation(toggleProtein(activeAllocation, protein.id))}
                onAdjust={(dir) =>
                  setAllocation(adjustAllocation(activeAllocation, protein.id, dir * ALLOCATION_STEP))
                }
                canDecrease={canDecreaseShare(activeAllocation, protein.id)}
                canIncrease={canIncreaseShare(activeAllocation, protein.id)}
              />
            ))}
          </div>
        )}

        <div className="mt-8">
          <SelectField
            label="Delivery frequency"
            value={frequencyId}
            onChange={(e) => setFrequencyId(e.target.value as MembershipDeliveryFrequency)}
          >
            <option value="" disabled>
              Select delivery frequency
            </option>
            {options.deliveryFrequencies.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <SelectField label="Delivery Day" value={day} onChange={(e) => setDay(e.target.value)}>
            <option value="" disabled>
              Select delivery day
            </option>
            {options.deliveryDays.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Delivery Window"
            value={deliveryWindow}
            onChange={(e) => setDeliveryWindow(e.target.value)}
          >
            <option value="" disabled>
              Select delivery window
            </option>
            {options.deliveryWindows.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </SelectField>
        </div>

        <hr className="my-8 border-neutral-200" />

        <AddressSection
          selectedId={addressId}
          onSelect={(id) => {
              setAddressId(id);
              // setErrors((e) => ({ ...e, address: undefined }));
            }}
            />
      </div>

      <SummaryCard
        plan={plan}
        selectedProteinNames={selectedProteins.map((p) => p.label)}
        isValid={isValid}
        submitting={submitting}
        onSubmit={handleSubmit}
      />

      {submitError && (
        <p role="alert" className="text-sm font-medium text-red-600 lg:col-span-2">
          {submitError}
        </p>
      )}
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div aria-hidden="true" className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        <div className="h-6 w-64 animate-pulse rounded bg-neutral-100" />
        <div className="h-28 animate-pulse rounded-2xl bg-neutral-100" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-neutral-100" />
          ))}
        </div>
        <div className="h-12 animate-pulse rounded-lg bg-neutral-100" />
      </div>
      <div className="h-96 animate-pulse rounded-2xl bg-neutral-100" />
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { ConfirmDialog } from "@/app/components/admin/ConfirmDialog";
import useOpenAuth from "@/app/components/auth/useOpenAuth";
import { useDialog } from "@/app/components/dialog/DialogProvider";
import { ChevronRightIcon } from "@/app/components/ui/icons";
import { INTERVAL_UNIT, formatPlanPrice } from "@/app/data/subscription-data";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import {
  useCancelMembershipMutation,
  useChangeMembershipPlanMutation,
  useGetMySubscriptionQuery,
  useListMembershipPlansQuery,
  usePauseMembershipMutation,
  useResumeMembershipMutation,
  useSkipNextDeliveryMutation,
} from "@/redux/slices/membershipApi";
import type { MySubscription } from "@/redux/types";
import { formatDate } from "../checkout/ConfirmationClient";
import UpdateMixDialog from "./UpdateMixDialog";

type Panel = "plan" | "delivery" | "billing" | null;

export default function ManageClient() {
  const { status: sessionStatus } = useSession();
  const openAuth = useOpenAuth();
  const { data, isLoading, isError, error, refetch } = useGetMySubscriptionQuery(undefined, {
    skip: sessionStatus !== "authenticated",
  });

  if (sessionStatus === "loading" || (sessionStatus === "authenticated" && isLoading)) {
    return <div aria-hidden="true" className="h-96 animate-pulse rounded-2xl bg-neutral-100" />;
  }

  if (sessionStatus !== "authenticated") {
    return (
      <Empty title="Sign in to manage your membership" body="Log in to see your plan and deliveries.">
        <button
          type="button"
          onClick={() => openAuth("login")}
          className="inline-flex h-11 items-center rounded-lg bg-corisio-blue px-5 text-sm font-semibold text-white"
        >
          Sign in
        </button>
      </Empty>
    );
  }

  if (isError) {
    return (
      <Empty title="We couldn't load your membership" body={getErrorMessage(error)}>
        <button
          type="button"
          onClick={() => void refetch()}
          className="inline-flex h-11 items-center rounded-lg border border-neutral-300 px-5 text-sm font-semibold"
        >
          Try again
        </button>
      </Empty>
    );
  }

  const sub = data?.data;
  if (!sub || sub.status === "cancelled" || sub.status === "expired") {
    return (
      <Empty
        title={sub ? "Your membership has ended" : "You don't have a membership yet"}
        body="Pick a plan to get a protein supply delivered on schedule."
      >
        <Link
          href="/subscription"
          className="inline-flex h-11 items-center rounded-lg bg-corisio-blue px-5 text-sm font-semibold text-white"
        >
          See all plans
        </Link>
      </Empty>
    );
  }

  return <Manage sub={sub} />;
}

function Manage({ sub }: { sub: MySubscription }) {
  const { openDialog } = useDialog();
  const [panel, setPanel] = useState<Panel>(null);

  const [pause] = usePauseMembershipMutation();
  const [resume] = useResumeMembershipMutation();
  const [skip] = useSkipNextDeliveryMutation();
  const [cancel] = useCancelMembershipMutation();

  const paused = sub.status === "paused";

  /**
   * Every action goes through a confirmation dialog. `run` does the request;
   * on failure it shows the error and rethrows so the dialog stays open.
   */
  function confirmAction({
    title,
    description,
    confirmLabel,
    destructive = false,
    run,
    success,
    failure,
  }: {
    title: string;
    description: string;
    confirmLabel: string;
    destructive?: boolean;
    run: () => Promise<unknown>;
    success: string;
    failure: string;
  }) {
    openDialog(
      ({ close }) => (
        <ConfirmDialog
          title={title}
          description={description}
          confirmLabel={confirmLabel}
          destructive={destructive}
          close={close}
          onConfirm={async () => {
            try {
              await run();
              notify.success(success);
            } catch (err) {
              notify.error(failure, { message: getErrorMessage(err) });
              throw err;
            }
          }}
        />
      ),
      { side: "center", width: "sm", title },
    );
  }

  const toggle = (p: Exclude<Panel, null>) => setPanel(panel === p ? null : p);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <div>
        <h2 className="text-xl font-bold text-neutral-900">Manage Your Subscription</h2>

        <div className="mt-6 rounded-3xl bg-corisio-blue p-6 text-white">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xl font-semibold">{sub.plan.name} Membership</p>
            <span className="rounded-md bg-corisio-yellow px-3 py-1 text-[11px] font-semibold uppercase text-black">
              {paused ? "Paused" : "Active"}
            </span>
          </div>
          <p className="mt-4 text-4xl font-bold">
            {formatPlanPrice(sub.plan.price)}{" "}
            <span className="text-sm font-normal text-white/80">/ {INTERVAL_UNIT[sub.plan.interval]}</span>
          </p>
          <hr className="my-5 border-white/15" />
          <p className="text-xs text-white/80">Next delivery scheduled for:</p>
          <p className="mt-2 font-semibold">{paused ? "Paused" : formatDate(sub.nextDeliveryAt)}</p>
        </div>

        <div className="mt-5 rounded-2xl bg-neutral-50 p-6">
          <h3 className="text-sm font-semibold text-neutral-900">Need a clean break?</h3>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            You can cancel your subscription permanently. Future scheduled allocations and deliveries will
            stop instantly.
          </p>
          <button
            type="button"
            onClick={() =>
              confirmAction({
                title: "Cancel your membership?",
                description:
                  "This is permanent. Future scheduled allocations and deliveries will stop instantly.",
                confirmLabel: "Yes, cancel membership",
                destructive: true,
                run: () => cancel({ id: sub.id }).unwrap(),
                success: "Your membership has been cancelled",
                failure: "Couldn't cancel your membership",
              })
            }
            className="mt-4 h-11 w-full rounded-lg border border-neutral-300 bg-white text-sm font-medium text-neutral-900 transition hover:bg-neutral-100"
          >
            Cancel Membership
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-neutral-900">Actions &amp; Preferences</h2>

        <ul className="mt-6 space-y-4">
          <Action
            title={paused ? "Resume Membership" : "Pause Membership"}
            hint={paused ? "Restart your scheduled deliveries" : "Temporarily stop scheduled deliveries"}
            onClick={() =>
              paused
                ? confirmAction({
                    title: "Resume your membership?",
                    description: "Your scheduled deliveries will start again.",
                    confirmLabel: "Resume",
                    destructive: false,
                    run: () => resume(sub.id).unwrap(),
                    success: "Your membership is active again",
                    failure: "Couldn't resume your membership",
                  })
                : confirmAction({
                    title: "Pause your membership?",
                    description:
                      "Scheduled deliveries will stop until you resume. You can resume any time.",
                    confirmLabel: "Pause",
                    destructive: false,
                    run: () => pause(sub.id).unwrap(),
                    success: "Your membership is paused",
                    failure: "Couldn't pause your membership",
                  })
            }
          />
          <Action
            title="Skip Next Delivery"
            hint="Skip the upcoming delivery cycle only"
            disabled={paused || !sub.nextDeliveryAt}
            onClick={() =>
              confirmAction({
                title: "Skip your next delivery?",
                description: `The delivery scheduled for ${formatDate(sub.nextDeliveryAt)} will be skipped. Deliveries continue after that.`,
                confirmLabel: "Skip delivery",
                destructive: false,
                run: () => skip(sub.id).unwrap(),
                success: "Your next delivery has been skipped",
                failure: "Couldn't skip your delivery",
              })
            }
          />
          <Action
            title="Update Mix"
            hint="Change which proteins you get and their shares"
            onClick={() =>
              openDialog(({ close }) => <UpdateMixDialog sub={sub} close={close} />, {
                side: "center",
                width: "xl",
                title: "Update protein mix",
              })
            }
          />
          <Action
            title="Change Plan"
            hint="Switch seamlessly to Silver, Family or Business"
            open={panel === "plan"}
            onClick={() => toggle("plan")}
          >
            <ChangePlan sub={sub} confirmAction={confirmAction} />
          </Action>
          <Action
            title="Delivery Details"
            hint="Edit addresses and preferred day windows"
            open={panel === "delivery"}
            onClick={() => toggle("delivery")}
          >
            <dl className="space-y-2 text-sm">
              <Row label="Address" value={sub.address} />
              <Row label="Day" value={sub.deliveryDay} />
              <Row label="Window" value={sub.deliveryWindow} />
              <Row label="Mix" value={sub.mix.map((m) => `${m.protein.label} ${m.percentage}%`).join(", ")} />
            </dl>
          </Action>
          <Action
            title="Billing History"
            hint="Download past invoices & receipts"
            open={panel === "billing"}
            onClick={() => toggle("billing")}
          >
            <dl className="space-y-2 text-sm">
              <Row label="Member since" value={formatDate(sub.startedAt)} />
              <Row label="Next billing" value={formatDate(sub.nextBillingAt)} />
            </dl>
          </Action>
        </ul>
      </div>
    </div>
  );
}

type ConfirmAction = (opts: {
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  run: () => Promise<unknown>;
  success: string;
  failure: string;
}) => void;

function ChangePlan({
  sub,
  confirmAction,
}: {
  sub: MySubscription;
  confirmAction: ConfirmAction;
}) {
  const { data } = useListMembershipPlansQuery();
  const [change] = useChangeMembershipPlanMutation();
  const plans = data?.data.items.filter((p) => p.id !== sub.plan.id) ?? [];

  if (plans.length === 0) return <p className="text-sm text-neutral-500">No other plans available.</p>;
  return (
    <ul className="space-y-2">
      {plans.map((p) => (
        <li key={p.id} className="flex items-center justify-between gap-3 text-sm">
          <span>
            <span className="font-semibold text-neutral-900">{p.name}</span>{" "}
            <span className="text-neutral-500">
              {formatPlanPrice(p.price)} / {INTERVAL_UNIT[p.interval]}
            </span>
          </span>
          <button
            type="button"
            onClick={() =>
              confirmAction({
                title: `Switch to ${p.name}?`,
                description: `You'll move from ${sub.plan.name} (${formatPlanPrice(sub.plan.price)}) to ${p.name} (${formatPlanPrice(p.price)} / ${INTERVAL_UNIT[p.interval]}). The change applies from your next billing date.`,
                confirmLabel: `Switch to ${p.name}`,
                destructive: false,
                run: () => change({ id: sub.id, planId: p.id }).unwrap(),
                success: `Switched to ${p.name}`,
                failure: "Couldn't change your plan",
              })
            }
            className="h-9 rounded-lg border border-neutral-300 px-4 text-xs font-semibold hover:bg-neutral-50"
          >
            Switch
          </button>
        </li>
      ))}
    </ul>
  );
}

function Action({
  title,
  hint,
  onClick,
  disabled,
  open,
  children,
}: {
  title: string;
  hint: string;
  onClick: () => void;
  disabled?: boolean;
  open?: boolean;
  children?: ReactNode;
}) {
  return (
    <li className="rounded-2xl border border-neutral-200 bg-white">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-expanded={children ? !!open : undefined}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left disabled:opacity-50"
      >
        <span>
          <span className="block text-base font-semibold text-neutral-900">{title}</span>
          <span className="mt-1 block text-sm text-neutral-500">{hint}</span>
        </span>
        <ChevronRightIcon className={`size-5 shrink-0 text-neutral-700 transition ${open ? "rotate-90" : ""}`} />
      </button>
      {open && children && <div className="border-t border-neutral-100 px-6 py-4">{children}</div>}
    </li>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="text-right font-medium text-neutral-900">{value}</dd>
    </div>
  );
}

function Empty({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-neutral-500">{body}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}
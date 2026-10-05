import Link from "next/link";
import { formatNaira } from "@/app/utils/product";
import type { AdminCustomerMembership } from "@/redux/types";
import { MembershipStatusPill } from "./CustomerPills";
import { formatDate, INTERVAL_LABELS, MEMBERSHIP_STATUS_LABELS } from "./formatters";

export type CustomerMembershipCardProps = {
  membership: AdminCustomerMembership;
};

/** The Membership section: plan header plus a Detail / Value table. */
export function CustomerMembershipCard({ membership }: CustomerMembershipCardProps) {
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Started", value: formatDate(membership.startedAt) },
    { label: "Next billing", value: formatDate(membership.nextBillingAt) },
    { label: "Next delivery", value: formatDate(membership.nextDeliveryAt) },
    { label: "Delivery frequency", value: membership.deliveryFrequency },
    {
      label: "Status",
      value: <MembershipStatusPill status={membership.status} />,
    },
  ];

  return (
    <section aria-labelledby="membership-heading">
      <h2 id="membership-heading" className="text-base font-semibold text-neutral-900">
        Membership
      </h2>

      <div className="mt-4 rounded-2xl border border-neutral-100 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 text-sm">
          <div className="flex flex-wrap gap-x-10 gap-y-3">
            <div>
              <p className="text-neutral-400">Membership Type</p>
              <p className="mt-2 font-medium text-neutral-900">{membership.planName}</p>
            </div>
            <div>
              <p className="text-neutral-400">Payment</p>
              <p className="mt-1.5">
                <span className="inline-flex rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-800">
                  {formatNaira(membership.amount)} / {INTERVAL_LABELS[membership.interval]}
                </span>
              </p>
            </div>
          </div>
          <div>
            <p className="text-neutral-400">Status</p>
            <p className="mt-1.5">
              <MembershipStatusPill status={membership.status} withDot />
            </p>
          </div>
        </div>

        <table className="mt-6 w-full text-left text-sm">
          <caption className="sr-only">
            Membership details, status {MEMBERSHIP_STATUS_LABELS[membership.status]}
          </caption>
          <thead>
            <tr className="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-500">
              <th className="px-4 pb-3 font-medium">Detail</th>
              <th className="pb-3 font-medium">Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} className={i % 2 === 1 ? "bg-neutral-50" : undefined}>
                <td className="rounded-l-lg px-4 py-4 text-neutral-500">{row.label}</td>
                <td className="rounded-r-lg py-4 font-medium text-neutral-900">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <Link
          href="/dashboard/membership"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#e7f4e4] px-4 py-2.5 text-sm font-medium text-corisio-blue transition hover:brightness-95"
        >
          View Membership
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}

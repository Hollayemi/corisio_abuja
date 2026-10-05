import Link from "next/link";
import type { AdminSubscriber } from "@/redux/types";
import { formatNextDelivery, formatPlanPrice, formatRenewal } from "./formatters";
import { SubscriptionStatusPill } from "./MembershipPills";

const COLUMNS = ["Customer", "Membership", "Billing", "Next Delivery", "Renewal", "Status"];

export type SubscriberTableProps = { subscribers: AdminSubscriber[] };

export function SubscriberTable({ subscribers }: SubscriberTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-left">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-neutral-500">
            {COLUMNS.map((col) => (
              <th key={col} className="pb-4 pr-4 font-medium">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {subscribers.map((s) => (
            <tr key={s.id} className="border-t border-neutral-100">
              <td className="py-4 pr-4">
                <Link
                  href={`/d/customers/${s.customer.id}`}
                  className="rounded text-sm font-medium text-neutral-900 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-corisio-blue"
                >
                  {s.customer.fullName}
                </Link>
              </td>
              <td className="py-4 pr-4 text-sm text-neutral-900">{s.planName}</td>
              <td className="py-4 pr-4 text-sm text-neutral-900">{formatPlanPrice(s.price, s.interval)}</td>
              <td className="py-4 pr-4 text-sm text-neutral-900">
                {formatNextDelivery(s.nextDeliveryAt, s.nextDeliverySlot)}
              </td>
              <td className="py-4 pr-4 text-sm text-neutral-900">{formatRenewal(s.renewalAt)}</td>
              <td className="py-4">
                <SubscriptionStatusPill status={s.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

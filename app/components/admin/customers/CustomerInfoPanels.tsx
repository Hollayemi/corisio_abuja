import type { AdminCustomerActivity, AdminCustomerDetail } from "@/redux/types";
import { CUSTOMER_STATUS_LABELS, formatDateTimeLong } from "./formatters";

export type CustomerPersonalInfoProps = {
  customer: Pick<AdminCustomerDetail, "fullName" | "email" | "phone" | "status" | "addresses">;
};

/** Right column, top card. */
export function CustomerPersonalInfo({ customer }: CustomerPersonalInfoProps) {
  const rows: { label: string; value: string }[] = [
    { label: "Full name:", value: customer.fullName },
    { label: "Email:", value: customer.email },
    { label: "Phone Number:", value: customer.phone },
    { label: "Account status:", value: CUSTOMER_STATUS_LABELS[customer.status] },
    ...customer.addresses.map((a, i) => ({
      label: `${a.isDefault ? "Default Address" : "Shipping Address"} ${i + 1}:`,
      value: a.address,
    })),
  ];

  return (
    <section aria-labelledby="personal-info-heading" className="rounded-2xl border border-neutral-100 bg-white p-6">
      <h2 id="personal-info-heading" className="text-base font-semibold text-neutral-900">
        Personal Information
      </h2>
      <dl className="mt-5">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[8.5rem_1fr] gap-4 border-t border-neutral-100 py-4 text-sm first:border-t-0"
          >
            <dt className="text-neutral-400">{row.label}</dt>
            <dd className="font-medium text-neutral-900">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export type CustomerActivityListProps = {
  /** Newest first, as the API sends them. */
  activity: AdminCustomerActivity[];
};

/** Right column, bottom card. */
export function CustomerActivityList({ activity }: CustomerActivityListProps) {
  return (
    <section aria-labelledby="activity-heading" className="rounded-2xl border border-neutral-100 bg-white p-6">
      <h2 id="activity-heading" className="text-base font-semibold text-neutral-900">
        Activity
      </h2>

      {activity.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">No activity yet.</p>
      ) : (
        <ol className="mt-5">
          {activity.map((item, i) => {
            const isLast = i === activity.length - 1;
            return (
              <li key={item.id} className="flex gap-4">
                <div className="flex w-[18px] shrink-0 flex-col items-center">
                  <span aria-hidden="true" className="mt-0.5 size-[18px] rounded-full border-[3px] border-neutral-300" />
                  {!isLast && <span aria-hidden="true" className="my-1 w-0.5 flex-1 rounded bg-neutral-200" />}
                </div>
                <div className={`min-w-0 flex-1 ${isLast ? "" : "pb-6"}`}>
                  <p className="text-sm font-medium text-neutral-900">{item.title}</p>
                  <p className="mt-1 text-xs text-neutral-400">{formatDateTimeLong(item.occurredAt)}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

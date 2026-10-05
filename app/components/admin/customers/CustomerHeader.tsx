"use client";

import Link from "next/link";
import AdminIcon from "@/app/components/admin/layout/AdminIcon";
import { ConfirmDialog } from "@/app/components/admin/ConfirmDialog";
import { CustomerAvatar } from "@/app/components/admin/orders/CustomerAvatar";
import { useDialog } from "@/app/components/dialog/DialogProvider";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import { useUpdateAdminCustomerStatusMutation } from "@/redux/slices/adminCustomersApi";
import type { AdminCustomerDetail } from "@/redux/types";

export type CustomerHeaderProps = {
  customer: AdminCustomerDetail;
};

/** Back link, avatar, name, email and the Suspend / Reactivate button. */
export function CustomerHeader({ customer }: CustomerHeaderProps) {
  const { openDialog } = useDialog();
  const [updateStatus] = useUpdateAdminCustomerStatusMutation();
  const suspended = customer.status === "suspended";

  function handleToggle() {
    const next = suspended ? "active" : "suspended";

    openDialog(
      ({ close }) => (
        <ConfirmDialog
          title={suspended ? "Reactivate this account?" : "Suspend this account?"}
          description={
            suspended
              ? `${customer.fullName} will be able to sign in and place orders again.`
              : `${customer.fullName} won't be able to sign in or place orders until you reactivate the account.`
          }
          confirmLabel={suspended ? "Reactivate" : "Suspend"}
          destructive={!suspended}
          onConfirm={async () => {
            try {
              await updateStatus({ id: customer.id, status: next }).unwrap();
              notify.success(suspended ? "Account reactivated" : "Account suspended");
            } catch (err) {
              notify.error("Couldn't update account", { message: getErrorMessage(err) });
              throw err;
            }
          }}
          close={close}
        />
      ),
      { title: suspended ? "Reactivate account" : "Suspend account", side: "center", width: "sm" },
    );
  }

  return (
    <div>
      <Link
        href="/dashboard/customers"
        className="inline-flex items-center gap-2 rounded text-sm text-neutral-700 transition hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-corisio-blue"
      >
        <AdminIcon name="arrowLeft" className="size-4" />
        Back to customer
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <CustomerAvatar name={customer.fullName} src={customer.avatar} className="size-14 text-base" />
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">{customer.fullName}</h1>
            <p className="text-sm text-neutral-500">{customer.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          className="h-11 rounded-xl border border-neutral-200 bg-white px-5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-corisio-blue"
        >
          {suspended ? "Reactivate Account" : "Suspend Account"}
        </button>
      </div>
    </div>
  );
}

"use client";

import AdminIcon from "@/app/components/admin/layout/AdminIcon";
import { ConfirmDialog } from "@/app/components/admin/ConfirmDialog";
import { useDialog } from "@/app/components/dialog/DialogProvider";
import { notify } from "@/lib/notify";
import { formatNaira } from "@/app/utils/product";
import { getErrorMessage } from "@/redux/config/errors";
import {
  useDeletePromotionMutation,
  useGetPromotionQuery,
  usePausePromotionMutation,
  useResumePromotionMutation,
} from "@/redux/slices/promotionsApi";
import {
  formatDateTime,
  formatDiscount,
} from "./formatters";
import { PromotionFormDialog } from "./PromotionFormDialog";
import { PromotionStatusPill } from "./StatusPill";

function activeDaysLabel(startAt: string, endAt?: string | null) {
  if (!endAt) return "No end date";
  const days = Math.round(
    (new Date(endAt).getTime() - new Date(startAt).getTime()) / 86_400_000,
  );
  if (days <= 0) return "Less than a day";
  return `${days} Day${days === 1 ? "" : "s"}`;
}

/** The "Promotion Details" drawer (design image 2), opened by clicking a table row. */
export function PromotionDetailDrawer({
  promotionId,
  close,
}: {
  promotionId: string;
  close: () => void;
}) {
  const { openDialog } = useDialog();
  const { data, isLoading, isError, error, refetch } = useGetPromotionQuery(promotionId);
  const [pausePromotion, { isLoading: pausing }] = usePausePromotionMutation();
  const [resumePromotion, { isLoading: resuming }] = useResumePromotionMutation();
  const [deletePromotion] = useDeletePromotionMutation();
  const promotion = data?.data;

  async function handleTogglePause() {
    if (!promotion) return;
    try {
      if (promotion.status === "PAUSED") {
        await resumePromotion(promotion.id).unwrap();
        notify.success("Promotion resumed");
      } else {
        await pausePromotion(promotion.id).unwrap();
        notify.success("Promotion paused");
      }
    } catch (err) {
      notify.error("Couldn't update promotion", { message: getErrorMessage(err) });
    }
  }

  function handleEdit() {
    if (!promotion) return;
    openDialog(() => <PromotionFormDialog promotion={promotion} close={close} />, {
      title: "Edit Promotion",
      side: "center",
      width: "xl",
    });
  }

  function handleDelete() {
    if (!promotion) return;
    openDialog(
      ({ close: closeConfirm }) => (
        <ConfirmDialog
          title="Delete this promotion?"
          description={`"${promotion.name}" will be removed and stop applying immediately. This can't be undone.`}
          onConfirm={async () => {
            try {
              await deletePromotion(promotion.id).unwrap();
              notify.success("Promotion deleted");
              close();
            } catch (err) {
              notify.error("Couldn't delete promotion", { message: getErrorMessage(err) });
              throw err;
            }
          }}
          close={closeConfirm}
        />
      ),
      { title: "Delete promotion", side: "center", width: "sm" },
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-4 border-b border-neutral-100 px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">
            {promotion?.name ?? (isLoading ? "Loading..." : "Promotion")}
          </h2>
          <p className="text-sm text-neutral-500">Promotion Details</p>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="flex size-7 items-center justify-center rounded-md border border-neutral-200 text-neutral-600 transition hover:bg-neutral-50"
        >
          <AdminIcon name="close" className="size-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        {isLoading ? (
          <DrawerSkeleton />
        ) : isError || !promotion ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm text-neutral-600">{getErrorMessage(error)}</p>
            <button
              type="button"
              onClick={refetch}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-neutral-400">Created at</p>
                <p className="mt-1 font-medium text-neutral-900">{formatDateTime(promotion.createdAt)}</p>
              </div>
              <div>
                <p className="text-neutral-400">Payment</p>
                <p className="mt-1">
                  <PromotionStatusPill status={promotion.status} />
                </p>
              </div>
              <div>
                <p className="text-neutral-400">Active days</p>
                <p className="mt-1 font-medium text-neutral-900">
                  {activeDaysLabel(promotion.startAt, promotion.endAt)}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <StatBox label="Total product affected" value={`${promotion.totalProductsAffected} Products`} />
              <StatBox label="Total discount given" value={formatNaira(promotion.totalDiscountGiven)} />
              <StatBox label="Total orders affected" value={String(promotion.totalOrdersAffected)} />
              <StatBox label="Total sales made" value={formatNaira(promotion.totalSalesMade)} />
            </div>

            <div className="mt-6 border-t border-neutral-100 pt-6">
              <h3 className="text-sm font-semibold text-neutral-900">Promotion Information</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <InfoRow label="Type" value={promotion.type === "COUPON_CODE" ? "Coupon Code" : "Promotions"} />
                <InfoRow label="Discount" value={formatDiscount(promotion)} />
                <InfoRow
                  label="Applies to"
                  value={
                    promotion.appliesTo === "ALL_ORDERS"
                      ? "All orders"
                      : promotion.appliesTo === "CATEGORY"
                        ? promotion.category?.name ?? "Selected category"
                        : "Selected products"
                  }
                />
                {promotion.minimumOrderAmount != null && (
                  <InfoRow label="Minimum order" value={formatNaira(promotion.minimumOrderAmount)} />
                )}
                {promotion.maximumDiscount != null && (
                  <InfoRow label="Maximum discount" value={formatNaira(promotion.maximumDiscount)} />
                )}
                {promotion.usageLimit != null && (
                  <InfoRow label="Usage limit" value={String(promotion.usageLimit)} />
                )}
                {promotion.limitPerCustomer != null && (
                  <InfoRow label="Per customer" value={`${promotion.limitPerCustomer} use`} />
                )}
                {promotion.code && <InfoRow label="Coupon code" value={promotion.code} />}
              </dl>
            </div>

            {promotion.products.length > 0 && (
              <div className="mt-6 border-t border-neutral-100 pt-6">
                <h3 className="text-sm font-semibold text-neutral-900">Products Included</h3>
                <table className="mt-4 w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-wide text-neutral-400">
                      <th className="pb-2 font-normal">Product Details</th>
                      <th className="pb-2 font-normal">Regular Price</th>
                      <th className="pb-2 font-normal">Price</th>
                      <th className="pb-2 font-normal">Sold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promotion.products.map((product) => (
                      <tr key={product.id} className="border-t border-neutral-100">
                        <td className="py-3 pr-2">
                          <div className="flex items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-100">
                              {product.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={product.image} alt="" className="size-full object-cover" />
                              ) : (
                                <AdminIcon name="package" className="size-4 text-neutral-400" />
                              )}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-neutral-900">{product.name}</p>
                              <p className="text-xs text-neutral-400">{product.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-2 text-neutral-500 line-through">
                          {formatNaira(product.regularPrice)}/{product.unitType}
                        </td>
                        <td className="py-3 pr-2 text-neutral-900">
                          {formatNaira(product.promoPrice)}/{product.unitType}
                        </td>
                        <td className="py-3 text-neutral-900">{product.unitsSold}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {promotion && (
        <div className="flex items-center gap-3 border-t border-neutral-100 px-6 py-4">
          <button
            type="button"
            onClick={handleEdit}
            className="h-10 flex-1 rounded-lg border border-neutral-300 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleTogglePause}
            disabled={pausing || resuming || promotion.status === "EXPIRED"}
            className="h-10 flex-1 rounded-lg bg-[#fdf0da] text-sm font-medium text-amber-700 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {promotion.status === "PAUSED" ? "Resume" : "Pause"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-10 flex-1 rounded-lg bg-red-600 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-neutral-50 p-4">
      <p className="text-xs text-neutral-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-neutral-900">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="font-medium text-neutral-900">{value}</dd>
    </div>
  );
}

function DrawerSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-neutral-100" />
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-4 animate-pulse rounded bg-neutral-100" />
      ))}
    </div>
  );
}

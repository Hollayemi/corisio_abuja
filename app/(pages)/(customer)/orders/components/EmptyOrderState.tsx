import { EmptyBasketIcon } from "@/app/components/ui/icons";

export default function EmptyOrderState() {
  return (
    <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-neutral-200 px-6 py-20 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-300">
        <EmptyBasketIcon className="size-8" />
      </span>
      <p className="max-w-[220px] text-sm text-neutral-500">
        Open an order page to view the details of the order.
      </p>
    </div>
  );
}

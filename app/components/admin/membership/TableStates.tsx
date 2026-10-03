import AdminIcon, { type AdminIconName } from "@/app/components/admin/layout/AdminIcon";

export type TableSkeletonProps = { rows?: number };

export function TableSkeleton({ rows = 6 }: TableSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-lg bg-neutral-100" />
      ))}
    </div>
  );
}

export type TableErrorProps = { message: string; onRetry: () => void };

export function TableError({ message, onRetry }: TableErrorProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <p className="text-sm text-neutral-600">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
      >
        Try again
      </button>
    </div>
  );
}

export type TableEmptyProps = {
  icon: AdminIconName;
  title: string;
  description: string;
  /** Optional call to action, e.g. "New Plan". */
  actionLabel?: string;
  onAction?: () => void;
};

export function TableEmpty({ icon, title, description, actionLabel, onAction }: TableEmptyProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
        <AdminIcon name={icon} className="size-7" />
      </span>
      <p className="text-sm font-medium text-neutral-900">{title}</p>
      <p className="max-w-sm text-sm text-neutral-500">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 rounded-lg bg-corisio-blue px-4 py-2 text-sm font-medium text-white hover:brightness-110"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

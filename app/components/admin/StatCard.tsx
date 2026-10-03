/** One number in the stat strip at the top of a page ("486 / Total Products / +12.4% this month"). */
export function StatCard({
  value,
  label,
  change,
  trend = "up",
  loading,
}: {
  value: string;
  label: string;
  /** e.g. "+12.4% this month" or "+23 this month" — omit if there's nothing to compare to */
  change?: string;
  /** Direction of `change`. "down" turns the arrow red. Default "up". */
  trend?: "up" | "down";
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="flex-1 space-y-2 px-6 py-1 first:pl-0 last:pr-0">
        <div className="h-7 w-16 animate-pulse rounded bg-neutral-100" />
        <div className="h-4 w-24 animate-pulse rounded bg-neutral-100" />
      </div>
    );
  }

  return (
    <div className="flex-1 px-6 text-center first:pl-0 last:pr-0 sm:text-left">
      <p className="text-2xl font-bold text-neutral-900 sm:text-[28px]">{value}</p>
      <p className="mt-1 text-sm text-neutral-500">{label}</p>
      {change && (
        <p
          className={`mt-1.5 flex items-center justify-center gap-1 text-xs font-medium sm:justify-start ${
            trend === "down" ? "text-red-600" : "text-emerald-600"
          }`}
        >
          <span aria-hidden="true">{trend === "down" ? "↓" : "↑"}</span>
          {change}
        </p>
      )}
    </div>
  );
}

/** The white card that holds a row of StatCards, divided by vertical rules. */
export function StatCardRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col divide-y divide-neutral-100 rounded-2xl border border-neutral-100 bg-white sm:flex-row sm:divide-x sm:divide-y-0">
      {children}
    </div>
  );
}

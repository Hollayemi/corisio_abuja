/** Same footprint as the loaded page, so nothing jumps when the data arrives. */
export default function OverviewSkeleton() {
  const block = "animate-pulse rounded-3xl bg-white";
  return (
    <div role="status" aria-label="Loading overview" className="space-y-6">
      <div className={`${block} h-[240px]`} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div className={`${block} h-[420px]`} />
        <div className={`${block} h-[420px]`} />
      </div>
      <div className={`${block} h-[150px]`} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div className={`${block} h-[560px]`} />
        <div className={`${block} h-[560px]`} />
      </div>
    </div>
  );
}

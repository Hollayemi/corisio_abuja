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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={`${block} h-[338px]`} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div className={`${block} h-[560px]`} />
        <div className={`${block} h-[560px]`} />
      </div>
    </div>
  );
}

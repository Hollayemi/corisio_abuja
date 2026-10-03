export default function OrderDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-5 w-32 rounded bg-neutral-200" />

      <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 rounded-2xl bg-neutral-100/70 p-5 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-4 w-3/4 rounded bg-neutral-200" />
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="size-14 shrink-0 rounded-xl bg-neutral-200" />
            <div className="flex-1">
              <div className="h-3.5 w-2/3 rounded bg-neutral-200" />
              <div className="mt-2 h-3 w-1/3 rounded bg-neutral-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export function PanelSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="max-w-[560px] animate-pulse">
      <div className="mx-auto size-[160px] rounded-full bg-neutral-100" />
      <div className="mt-8 flex flex-col gap-5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="h-3.5 w-24 rounded bg-neutral-100" />
            <div className="h-[52px] rounded-xl bg-neutral-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PanelError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="max-w-[560px] rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
      <p>{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 font-semibold underline underline-offset-2"
      >
        Try again
      </button>
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return <p className="text-sm font-medium text-red-600">{message}</p>;
}

export function SavedNote({ show }: { show: boolean }) {
  if (!show) return null;
  return <p className="text-sm font-medium text-corisio-blue">Changes saved.</p>;
}

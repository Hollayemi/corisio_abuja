import type { AdminOrderTimelineEvent, AdminOrderTimelineState } from "@/redux/types";
import { formatTimelineTime } from "./formatters";

function StateIcon({ state }: { state: AdminOrderTimelineState }) {
  if (state === "done") {
    return (
      <svg viewBox="0 0 24 24" className="size-[18px] text-corisio-blue" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 12.4l2.6 2.6L16 9.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (state === "active") {
    // Ring with a bright arc, like the "Out for delivery" spinner in the design
    return (
      <svg viewBox="0 0 24 24" className="size-[18px] text-corisio-yellow" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.4" />
        <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="size-[18px] text-neutral-300" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export type OrderTimelineProps = {
  /** Oldest first, as the API sends them. The newest event is shown on top. */
  events: AdminOrderTimelineEvent[];
};

export function OrderTimeline({ events }: OrderTimelineProps) {
  const ordered = [...events].reverse();

  if (ordered.length === 0) {
    return <p className="mt-4 text-sm text-neutral-500">No activity yet.</p>;
  }

  return (
    <ol className="mt-5">
      {ordered.map((event, i) => {
        const isLast = i === ordered.length - 1;
        return (
          <li key={event.id} className="flex gap-3">
            <div className="flex w-[18px] shrink-0 flex-col items-center">
              <StateIcon state={event.state} />
              {!isLast && <span aria-hidden="true" className="my-1 w-0.5 flex-1 rounded bg-neutral-200" />}
            </div>

            <div className={`min-w-0 flex-1 ${isLast ? "" : "pb-5"}`}>
              <div className="flex items-start justify-between gap-3">
                <p
                  className={`text-sm font-medium ${
                    event.state === "pending" ? "text-neutral-400" : "text-neutral-900"
                  }`}
                >
                  {event.title}
                </p>
                {event.occurredAt && (
                  <span className="shrink-0 text-xs text-neutral-500">
                    {formatTimelineTime(event.occurredAt)}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-neutral-400">{event.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

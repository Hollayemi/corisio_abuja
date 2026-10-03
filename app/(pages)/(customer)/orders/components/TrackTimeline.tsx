"use client";

import { useState } from "react";
import type { OrderDetail, TrackStep } from "@/redux/types";
import { formatStepDay, formatStepMonth, formatStepTime, isRatable } from "@/app/utils/order";
import RatingStars from "./RatingStars";

const DOT_STYLES = {
  done: "border-neutral-900 bg-neutral-900",
  active: "border-corisio-yellow bg-corisio-yellow",
  pending: "border-neutral-300 bg-white",
} as const;

const TITLE_STYLES = {
  done: "text-neutral-900",
  active: "text-corisio-yellow",
  pending: "text-neutral-400",
} as const;

const DESC_STYLES = {
  done: "text-neutral-500",
  active: "text-corisio-yellow/80",
  pending: "text-neutral-400",
} as const;

function RatingBlock({
  order,
  onSubmitRating,
  isRating = false,
}: {
  order: OrderDetail;
  onSubmitRating: (stars: number, comment: string) => void;
  isRating?: boolean;
}) {
  console.log({isRating})
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");

  if (order.rating) {
    return (
      <div className="mt-2.5">
        <RatingStars value={order.rating.stars} readOnly />
        {order.rating.comment && (
          <p className="mt-2 max-w-sm rounded-lg bg-neutral-100 px-3 py-2 text-xs leading-relaxed text-neutral-600">
            {order.rating.comment}
          </p>
        )}
      </div>
    );
  }

  if (!isRatable(order)) {
    return (
      <div className="mt-2.5">
        <RatingStars value={0} readOnly size="size-5 opacity-40" />
      </div>
    );
  }

  return (
    <div className="mt-2.5 flex flex-col gap-2.5">
      <RatingStars value={stars} onChange={setStars} />
      {stars > 0 && (
        <div className="flex max-w-sm flex-col gap-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us about your experience (optional)"
            rows={2}
            className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2 text-xs text-neutral-700 placeholder:text-neutral-400 focus:border-corisio-yellow focus:outline-none focus:ring-2 focus:ring-corisio-yellow/30"
          />
          <button
            type="button"
            disabled={isRating}
            onClick={() => onSubmitRating(stars, comment.trim())}
            className="self-start rounded-lg bg-corisio-yellow px-4 py-1.5 text-xs font-semibold text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRating ? "Submitting…" : "Submit review"}
          </button>
        </div>
      )}
    </div>
  );
}

function Step({
  step,
  isLast,
  order,
  onSubmitRating,
  isRating,
}: {
  step: TrackStep;
  isLast: boolean;
  order: OrderDetail;
  onSubmitRating: (stars: number, comment: string) => void;
  isRating?: boolean;
}) {
  console.log({step})
  const month = formatStepMonth(step.occurredAt);
  const day = formatStepDay(step.occurredAt);
  const time = formatStepTime(step.occurredAt);

  return (
    <li className="flex gap-4">
      {/* Date column */}
      <div className="w-10 shrink-0 pt-0.5 text-right text-[11px] font-medium leading-tight text-neutral-400">
        <span className="block">{month ?? "-"}</span>
        <span className="block">{day ?? "-"}</span>
      </div>

      {/* Dot + connecting line */}
      <div className="flex w-3 shrink-0 flex-col items-center">
        <span
          aria-hidden="true"
          className={`mt-1.5 size-3 shrink-0 rounded-full border-2 ${DOT_STYLES[step.state]}`}
        />
        {!isLast && <span aria-hidden="true" className="mt-1 w-px flex-1 bg-neutral-200" />}
      </div>

      {/* Content */}
      <div className={`min-w-0 flex-1 ${isLast ? "pb-1" : "pb-7"}`}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
          <p className={`text-sm font-semibold ${TITLE_STYLES[step.state]}`}>{step.title}</p>
          {time && (
            <span className={`text-xs font-medium ${TITLE_STYLES[step.state]}`}>{time}</span>
          )}
        </div>
        <p className={`mt-0.5 text-xs ${DESC_STYLES[step.state]}`}>{step.description}</p>

        {step.id.toLowerCase() === "rate" && (
          <RatingBlock order={order} onSubmitRating={onSubmitRating} isRating={isRating} />
        )}
      </div>
    </li>
  );
}

export default function TrackTimeline({
  order,
  onSubmitRating,
  isRating = false,
}: {
  order: OrderDetail;
  onSubmitRating: (stars: number, comment: string) => void;
  isRating?: boolean;
}) {
  return (
    <section aria-labelledby="track-details-heading">
      <h2 id="track-details-heading" className="text-base font-semibold text-neutral-900">
        Track Details
      </h2>
      <ol className="mt-5">
        {order.timeline.map((step, i) => (
          <Step
            key={step.id}
            step={step}
            isLast={i === order.timeline.length - 1}
            order={order}
            onSubmitRating={onSubmitRating}
            isRating={isRating}
          />
        ))}
      </ol>
    </section>
  );
}
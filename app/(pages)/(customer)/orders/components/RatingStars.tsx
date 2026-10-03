"use client";

import { useState } from "react";
import { StarIcon } from "@/app/components/ui/icons";

export default function RatingStars({
  value,
  onChange,
  readOnly = false,
  size = "size-5",
}: {
  value: number;
  onChange?: (stars: number) => void;
  readOnly?: boolean;
  size?: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value;

  if (readOnly) {
    return (
      <div className="flex items-center gap-1 text-corisio-yellow" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon key={star} filled={star <= value} className={size} />
        ))}
      </div>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Rate this order"
      className="flex items-center gap-1 text-corisio-yellow"
      onMouseLeave={() => setHovered(null)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          onMouseEnter={() => setHovered(star)}
          onFocus={() => setHovered(star)}
          onClick={() => onChange?.(star)}
          className="rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
        >
          <StarIcon filled={star <= display} className={size} />
        </button>
      ))}
    </div>
  );
}

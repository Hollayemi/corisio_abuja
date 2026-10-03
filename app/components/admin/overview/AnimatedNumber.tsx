"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { useEffect } from "react";

/**
 * A number that counts up to `value` when it first shows, and eases to the new
 * value when a refetch changes it. Pass a module-level `format` (not an inline
 * arrow) so it stays stable between renders.
 */
export default function AnimatedNumber({
  value,
  format,
  duration = 0.9,
}: {
  value: number;
  format: (n: number) => string;
  duration?: number;
}) {
  const reduce = useReducedMotion();
  const motionValue = useMotionValue(reduce ? value : 0);
  const text = useTransform(motionValue, (n) => format(Math.round(n)));

  useEffect(() => {
    if (reduce) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, { duration, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [value, reduce, duration, motionValue]);

  return <motion.span>{text}</motion.span>;
}

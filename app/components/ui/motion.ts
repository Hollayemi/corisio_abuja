// app/components/ui/motion.ts
"use client";

import type { Variants } from "framer-motion";

// Smooth, mature easing — no bounce, no overshoot
export const EASE = [0.22, 1, 0.36, 1] as const;

// Fade + rise for a single element
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

// Subtle scale-in for cards / banners
export const fadeScale: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: EASE },
  },
};

// Parent that staggers its children
export const stagger = (staggerChildren = 0.08, delayChildren = 0.05): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
});

// Standard viewport config — animate once, when 20% visible
export const viewportOnce = { once: true, amount: 0.2 } as const;

// Shorthand for reduced motion — replaces a variant with a plain fade
export const reduced = (fallback: Variants): Variants => fallback;
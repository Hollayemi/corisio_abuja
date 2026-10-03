import type { Variants } from "framer-motion";

/** The page and each section share these, so everything rises in on one rhythm. */
export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

export const rise: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

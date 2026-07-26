import type { Transition } from "framer-motion";

export const SPRING: Transition = { type: "spring", stiffness: 220, damping: 28 };

/** Staggered enter/exit preset for items inside the expanded pill. */
export const enter = (delay = 0) => ({
  initial: { opacity: 0, x: -12 },
  animate: { opacity: 1, x: 0, transition: { ...SPRING, delay } },
  exit: { opacity: 0, x: -6, transition: { duration: 0.12 } },
});
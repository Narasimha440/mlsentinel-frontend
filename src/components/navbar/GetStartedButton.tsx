import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SPRING } from "../../lib/motion";
import { cn } from "../../lib/cn";

type Props = {
  /** Compact sizing + arrow, used inside the floating pill. */
  floating?: boolean;
  className?: string;
};

export function GetStartedButton({ floating = false, className }: Props) {
  return (
    <motion.a
      href="/signup"
      layout
      transition={SPRING}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink font-medium text-white transition-colors duration-200 hover:bg-black",
        floating ? "px-6 py-3 text-[15px]" : "px-6 py-3.5 text-[15px]",
        className
      )}
    >
      <motion.span layout="position">Get Started</motion.span>
      <motion.span
        animate={{ width: floating ? 24 : 0, opacity: floating ? 1 : 0 }}
        transition={SPRING}
        className="flex justify-end"
      >
        <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
      </motion.span>
    </motion.a>
  );
}
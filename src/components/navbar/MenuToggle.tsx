import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { SPRING } from "../../lib/motion";
import { cn } from "../../lib/cn";

export function MenuToggle({
  open,
  onClick,
  className,
}: {
  open: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-label={open ? "Close menu" : "Open menu"}
      className={cn(
        "grid h-12 w-12 shrink-0 place-items-center rounded-full text-ink transition-colors duration-200 hover:bg-gray-100",
        className
      )}
    >
      <motion.span
        className="col-start-1 row-start-1"
        animate={{ rotate: open ? 90 : 0, scale: open ? 0.5 : 1, opacity: open ? 0 : 1 }}
        transition={SPRING}
      >
        <Menu className="h-6 w-6" />
      </motion.span>
      <motion.span
        className="col-start-1 row-start-1"
        animate={{ rotate: open ? 0 : -90, scale: open ? 1 : 0.5, opacity: open ? 1 : 0 }}
        transition={SPRING}
      >
        <X className="h-6 w-6" />
      </motion.span>
    </button>
  );
}
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export function AlertCard() {
  return (
    <motion.div
      animate={{ y: [0, -5, 0] }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute right-2 top-[52%] z-10 w-[220px] max-lg:w-[200px]"
      style={{ rotate: -2, z: -40, transformStyle: "preserve-3d" }}
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_12px_40px_-8px_rgba(17,24,39,0.12),0_4px_12px_-2px_rgba(17,24,39,0.06)]">
        <div className="flex items-center gap-2.5">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.9, type: "spring", stiffness: 400, damping: 18 }}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-green-50"
          >
            <Check className="h-3.5 w-3.5 text-green-500" strokeWidth={2.5} />
          </motion.div>
          <span className="rounded-full border border-gray-100 bg-gray-50 px-2.5 py-0.5 text-[11px] font-semibold text-gray-900">
            Monitoring
          </span>
        </div>

        <p className="mt-3 text-[12px] leading-relaxed text-gray-500">
          No anomalies detected
        </p>

        <div className="mt-4 border-t border-gray-100 pt-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
            Last Scan
          </p>
          <p className="mt-0.5 text-[12px] font-medium text-gray-700">2 seconds ago</p>
        </div>
      </div>
    </motion.div>
  );
}

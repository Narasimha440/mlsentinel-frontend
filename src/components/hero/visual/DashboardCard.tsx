import { animate, motion } from "framer-motion";
import { useEffect, useState } from "react";

function useCountUp(target: number, delay = 0.4) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, target, {
      delay,
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return controls.stop;
  }, [target, delay]);

  return value;
}

function LineChart() {
  return (
    <div className="mt-4 h-12 overflow-hidden">
      <motion.svg
        viewBox="0 0 280 48"
        fill="none"
        className="h-full w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <motion.path
          d="M0 38 L40 34 L80 30 L120 28 L160 24 L200 22 L240 18 L280 14"
          stroke="#2563EB"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.8, duration: 1.4, ease: "easeOut" }}
        />
        <motion.path
          d="M0 38 L40 34 L80 30 L120 28 L160 24 L200 22 L240 18 L280 14 L280 48 L0 48 Z"
          fill="#2563EB"
          fillOpacity="0.06"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        />
        <motion.g
          animate={{ x: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        >
          <motion.path
            d="M280 38 L320 34 L360 30 L400 28 L440 24 L480 22 L520 18 L560 14"
            stroke="#2563EB"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.35"
          />
        </motion.g>
      </motion.svg>
    </div>
  );
}

export function DashboardCard() {
  const healthCount = useCountUp(94, 0.5);

  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute left-0 top-[6%] z-30 w-[380px] max-lg:w-[340px]"
      style={{ rotate: -4, z: 20, transformStyle: "preserve-3d" }}
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_20px_60px_-12px_rgba(17,24,39,0.16),0_8px_20px_-4px_rgba(17,24,39,0.08)]">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-gray-900">MLSentinel</span>
          <div className="flex items-center gap-1.5 rounded-full border border-gray-100 bg-gray-50 px-2.5 py-1">
            <motion.span
              animate={{ opacity: [1, 0.35, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="h-1.5 w-1.5 rounded-full bg-green-500"
            />
            <span className="text-[10px] font-medium text-gray-600">Live</span>
          </div>
        </div>

        <div className="mt-6 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-medium text-gray-500">Model Health</p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-[36px] font-semibold leading-none tracking-tight text-gray-900">
                {healthCount}
              </span>
              <span className="text-lg font-semibold text-gray-400">%</span>
            </div>
          </div>
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-semibold text-green-600"
          >
            Healthy
          </motion.span>
        </div>

        <div className="mt-5">
          <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
            <motion.div
              className="h-full rounded-full bg-blue-600"
              initial={{ width: "0%" }}
              animate={{ width: "94%" }}
              transition={{ delay: 0.6, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>

        <LineChart />

        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-gray-100 pt-5">
          <Metric label="Accuracy" value="94.2%" highlight />
          <Metric label="Latency" value="42ms" />
          <Metric label="Data Drift" value="Low" />
          <Metric label="Version" value="ResNet50" />
        </div>
      </div>
    </motion.div>
  );
}

function Metric({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-medium text-gray-400">{label}</p>
      <p
        className={`mt-0.5 text-[13px] font-semibold ${highlight ? "text-blue-600" : "text-gray-900"}`}
      >
        {value}
      </p>
    </div>
  );
}

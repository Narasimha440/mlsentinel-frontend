import { motion } from "framer-motion";

const lines = [
  { parts: [{ t: "from ", c: "text-gray-500" }, { t: "mlsentinel", c: "text-blue-600" }, { t: " import ", c: "text-gray-500" }, { t: "MLSentinel", c: "text-gray-900" }] },
  { parts: [] },
  { parts: [{ t: "client = ", c: "text-gray-500" }, { t: "MLSentinel", c: "text-gray-900" }, { t: "(", c: "text-gray-400" }, { t: "API_KEY", c: "text-blue-600" }, { t: ")", c: "text-gray-400" }] },
  { parts: [] },
  { parts: [{ t: "client.", c: "text-gray-500" }, { t: "report", c: "text-blue-600" }, { t: "(", c: "text-gray-400" }] },
  { parts: [{ t: '    model=', c: "text-gray-500" }, { t: '"ResNet50"', c: "text-gray-700" }, { t: ",", c: "text-gray-400" }] },
  { parts: [{ t: "    accuracy=", c: "text-gray-500" }, { t: "94.2", c: "text-blue-600" }] },
  { parts: [{ t: ")", c: "text-gray-400" }] },
];

export function SDKCard() {
  return (
    <motion.div
      animate={{ y: [0, 8, 0] }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute bottom-[14%] right-0 z-20 w-[300px] max-lg:w-[270px]"
      style={{ rotate: 5, z: -20, transformStyle: "preserve-3d" }}
    >
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_16px_48px_-12px_rgba(17,24,39,0.14),0_6px_16px_-4px_rgba(17,24,39,0.08)]">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
          <span className="text-[11px] font-semibold tracking-wide text-gray-900">
            Python SDK
          </span>
          <span className="rounded-md bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-500">
            .py
          </span>
        </div>

        <div className="space-y-0.5 px-4 py-3.5 font-mono text-[11px] leading-[1.65]">
          {lines.map((line, i) => (
            <div key={i} className="min-h-[18px]">
              {line.parts.map((part, j) => (
                <span key={j} className={part.c}>
                  {part.t}
                </span>
              ))}
              {i === lines.length - 1 && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1.1, repeat: Infinity }}
                  className="ml-0.5 inline-block h-[14px] w-[7px] translate-y-[2px] bg-blue-600"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

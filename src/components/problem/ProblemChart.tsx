import { motion, useTransform, type MotionValue } from "framer-motion";

export function ProblemChart({ progress }: { progress: MotionValue<number> }) {
  const rising = useTransform(progress, [0, 0.38, 0.55], [1, 0.65, 0]);
  const flat = useTransform(progress, [0.25, 0.45, 0.68], [0, 1, 0]);
  const falling = useTransform(progress, [0.48, 0.7, 1], [0, 0.8, 1]);

  return (
    <div className="mt-5 h-28 rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-3">
      <div className="mb-2 flex justify-between text-[10px] font-medium uppercase tracking-[0.12em] text-gray-400"><span>Accuracy trend</span><span>Live</span></div>
      <svg viewBox="0 0 300 70" className="h-[68px] w-full overflow-visible" preserveAspectRatio="none" aria-label="Accuracy chart">
        <path d="M0 57H300M0 34H300M0 11H300" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3 5" />
        <motion.path d="M0 56 C43 53 52 48 88 43 S142 35 175 26 S237 14 300 8" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" style={{ opacity: rising, pathLength: rising }} />
        <motion.path d="M0 31 C45 28 72 29 108 29 S170 32 210 30 S265 29 300 31" fill="none" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" style={{ opacity: flat, pathLength: flat }} />
        <motion.path d="M0 13 C38 16 61 18 95 22 S148 30 181 38 S245 50 300 62" fill="none" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" style={{ opacity: falling, pathLength: falling }} />
      </svg>
    </div>
  );
}

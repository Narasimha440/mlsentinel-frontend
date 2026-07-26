import { ArrowRight, Check, ShieldAlert } from "lucide-react";
import { motion, useTransform, type MotionValue } from "framer-motion";

export function ProblemNotification({ progress }: { progress: MotionValue<number> }) {
  const y = useTransform(progress, [0.82, 1], [42, 0]);
  const opacity = useTransform(progress, [0.82, 0.92], [0, 1]);
  return (
    <motion.div style={{ y, opacity }} className="absolute inset-x-5 -bottom-28 z-20 rounded-2xl border border-blue-200 bg-blue-600 p-4 text-white shadow-[0_18px_45px_rgba(37,99,235,0.28)] sm:inset-x-8">
      <div className="flex items-center gap-2 text-sm font-semibold"><span className="grid h-5 w-5 place-items-center rounded-full bg-white/20"><Check className="h-3 w-3" strokeWidth={3} /></span> Drift Detected <ShieldAlert className="ml-auto h-4 w-4" /></div>
      <p className="mt-2 text-xs text-blue-100">Accuracy dropped from 98% → 84%</p>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-blue-200">Recommendation generated</p>
      <p className="mt-1 text-xs leading-5 text-white/90">Investigate feature distribution shift.<br />Review latest predictions. Run validation report.</p>
      <button className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-blue-600 transition-transform hover:scale-[1.02]">View Report <ArrowRight className="h-3.5 w-3.5" /></button>
    </motion.div>
  );
}

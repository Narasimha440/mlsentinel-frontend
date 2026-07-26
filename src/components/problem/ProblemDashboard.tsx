import { AlertTriangle, Activity } from "lucide-react";
import { motion, useMotionValueEvent, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useState } from "react";
import { ProblemChart } from "./ProblemChart";
import { ProblemNotification } from "./ProblemNotification";

const healthFor = (p: number) => p < 0.38 ? "Healthy" : p < 0.6 ? "Warning" : "Critical";
const healthColors = { Healthy: "#22C55E", Warning: "#F59E0B", Critical: "#EF4444" };

export function ProblemDashboard({ progress }: { progress: MotionValue<number> }) {
  const accuracy = useSpring(useTransform(progress, [0, 1], [98, 84]), { stiffness: 90, damping: 24 });
  const bar = useTransform(progress, [0, 1], ["98%", "84%"]);
  const tone = useTransform(progress, [0, 0.38, 0.6], ["#22C55E", "#F59E0B", "#EF4444"]);
  const dim = useTransform(progress, [0.86, 1], [0, 0.08]);
  const shadow = useTransform(progress, [0, 1], ["0 20px 50px rgba(17,24,39,0.08)", "0 28px 70px rgba(17,24,39,0.18)"]);
  const alertScale = useTransform(progress, [0.72, 0.84], [0, 1]);
  const [value, setValue] = useState(98);
  const [health, setHealth] = useState("Healthy");
  useMotionValueEvent(accuracy, "change", (latest) => setValue(Math.round(latest)));
  useMotionValueEvent(progress, "change", (latest) => setHealth(healthFor(latest)));

  const latency = value > 93 ? 38 + (98 - value) : 42 + (93 - value) * 4;
  const drift = value > 93 ? "None" : value > 89 ? "Low" : value > 85 ? "Medium" : "High";

  return (
    <motion.div animate={health === "Critical" && value <= 85 ? { x: [0, -4, 4, -2, 0] } : { x: 0 }} transition={{ duration: 0.34 }} style={{ boxShadow: shadow }} className="relative w-full max-w-[590px] overflow-visible rounded-[24px] border border-gray-200 bg-white p-5 sm:p-7">
      <motion.div style={{ opacity: dim }} className="pointer-events-none absolute inset-0 z-10 rounded-[24px] bg-gray-950" />
      <div className="flex items-center justify-between"><div><p className="font-display text-lg font-semibold tracking-tight text-gray-900">MLSentinel</p><p className="mt-0.5 text-xs font-medium text-gray-400">Production overview</p></div><div className="flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" /></span>Live</div></div>
      <div className="mt-6 flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Model Health</p><div className="mt-2 flex items-center gap-2"><motion.span style={{ backgroundColor: tone }} className="h-2.5 w-2.5 rounded-full" /><motion.span style={{ color: tone }} className="text-xl font-semibold">{health}</motion.span></div></div><motion.div style={{ scale: alertScale }} className="grid h-9 w-9 place-items-center rounded-xl bg-red-50 text-red-500"><AlertTriangle className="h-4 w-4" /></motion.div></div>
      <div className="mt-6"><div className="flex items-baseline justify-between"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Accuracy</p><p className="font-display text-3xl font-semibold text-gray-900 tabular-nums">{value}%</p></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100"><motion.div style={{ width: bar, backgroundColor: tone }} className="h-full rounded-full" /></div></div>
      <ProblemChart progress={progress} />
      <div className="mt-5 grid grid-cols-2 gap-3"><Metric label="Latency" value={`${latency}ms`} icon={<Activity className="h-3.5 w-3.5" />} /><Metric label="Data drift" value={drift} tone={healthColors[health as keyof typeof healthColors]} /></div>
      <ProblemNotification progress={progress} />
    </motion.div>
  );
}

function Metric({ label, value, icon, tone }: { label: string; value: string; icon?: React.ReactNode; tone?: string }) {
  return <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3"><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">{label}</p><p style={{ color: tone }} className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-gray-800">{icon}{value}</p></div>;
}

import { Check } from "lucide-react";
import { motion, useTransform, type MotionValue } from "framer-motion";

const steps = [
  "Model trained",
  "Deployed",
  "Real-world data changes",
  "Accuracy slowly drops",
  "Users notice problems",
  "MLSentinel detects the issue",
];

export function ProblemTimeline({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="mt-10 space-y-0" aria-label="Model drift timeline">
      {steps.map((step, index) => <TimelineItem key={step} step={step} index={index} progress={progress} />)}
    </div>
  );
}

function TimelineItem({ step, index, progress }: { step: string; index: number; progress: MotionValue<number> }) {
  const threshold = index / (steps.length - 1);
  const color = useTransform(progress, [Math.max(0, threshold - 0.08), threshold, Math.min(1, threshold + 0.08)], ["#9CA3AF", "#2563EB", "#2563EB"]);
  const opacity = useTransform(progress, [0, Math.max(0, threshold - 0.08), threshold, 1], [0.48, 0.48, 1, index === steps.length - 1 ? 1 : 0.68]);
  return <div className="flex min-h-10 gap-3"><div className="flex w-4 flex-col items-center"><motion.span style={{ color, opacity }} className="grid h-4 w-4 shrink-0 place-items-center rounded-full border border-current bg-white">{index < 2 || index === steps.length - 1 ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}</motion.span>{index !== steps.length - 1 && <div className="my-1 w-px flex-1 bg-gray-200" />}</div><motion.p style={{ color, opacity }} className="-mt-0.5 text-sm font-medium leading-4">{step}</motion.p></div>;
}

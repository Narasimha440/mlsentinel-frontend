import { useTransform, motion, type MotionValue } from "framer-motion";
import { Check, Cloud, Database, Ticket, UserRound, ScanSearch, ArrowRight } from "lucide-react";

type StoryProps = { progress: MotionValue<number> };

export function ProblemStory({ progress }: StoryProps) {
  return (
    <div className="relative mx-auto flex h-[min(580px,66vh)] w-full max-w-[720px] items-center justify-center overflow-hidden rounded-[28px] border border-gray-100 bg-white p-5 shadow-[0_24px_70px_rgba(17,24,39,0.08)] sm:p-10">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 opacity-[0.035] blur-3xl" />
      <Training progress={progress} />
      <Deployment progress={progress} />
      <ProductionChanges progress={progress} />
      <QualityDrop progress={progress} />
      <UsersProblem progress={progress} />
      <DeveloperScene progress={progress} />
      <SentinelScene progress={progress} />
    </div>
  );
}

function Scene({ progress, range, children }: StoryProps & { range: [number, number, number, number]; children: React.ReactNode }) {
  const opacity = useTransform(progress, range, [0, 1, 1, 0]);
  const scale = useTransform(progress, range, [0.96, 1, 1, 1.02]);
  const blur = useTransform(progress, range, [8, 0, 0, 8]);
  return <motion.div style={{ opacity, scale, filter: useTransform(blur, (value) => `blur(${value}px)`) }} className="absolute inset-0 flex items-center justify-center p-5 sm:p-10">{children}</motion.div>;
}

function SceneLabel({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return <div className="w-full"><p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-600">{eyebrow}</p><h3 className="mt-2 text-center font-display text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">{title}</h3>{children}</div>;
}

function Training({ progress }: StoryProps) {
  return <Scene progress={progress} range={[0, 0.025, 0.12, 0.17]}><SceneLabel eyebrow="Scene 01" title="Training"><div className="mx-auto mt-10 flex max-w-md items-center justify-between gap-2 text-center text-xs font-semibold text-blue-700 sm:text-sm"><PipelineIcon icon={<Database />} label="Dataset" /><Line /><PipelineIcon icon={<ScanSearch />} label="Training" /><Line /><PipelineIcon icon={<Check />} label="Model ready" /></div><div className="relative mx-auto mt-10 max-w-sm rounded-2xl border border-blue-100 bg-blue-50/60 p-5 text-left shadow-sm"><span className="absolute -left-1 top-1/2 h-2 w-2 rounded-full bg-blue-500 motion-safe:animate-ping" /><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Model accuracy</p><div className="mt-2 flex items-end justify-between"><strong className="font-display text-5xl tracking-tight text-gray-900">98%</strong><span className="mb-1 rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white">Healthy</span></div></div></SceneLabel></Scene>;
}

function Deployment({ progress }: StoryProps) {
  return <Scene progress={progress} range={[0.12, 0.17, 0.25, 0.3]}><SceneLabel eyebrow="Scene 02" title="Deployment"><div className="relative mx-auto mt-12 h-56 max-w-md"><div className="absolute left-1/2 top-4 grid h-28 w-40 -translate-x-1/2 place-items-center rounded-[42px] border border-blue-100 bg-blue-50 text-blue-600"><Cloud className="h-12 w-12" /><span className="-mt-8 text-xs font-semibold">Production model</span></div>{[0, 1, 2, 3].map((packet) => <motion.span key={packet} animate={{ y: [-8, 105], opacity: [0, 1, 1, 0] }} transition={{ duration: 1.8, repeat: Infinity, delay: packet * 0.38, ease: "easeInOut" }} className="absolute left-[calc(50%_-_4px)] top-0 h-2 w-2 rounded-sm bg-blue-500" />)}<div className="absolute bottom-0 flex w-full justify-between text-xs font-semibold text-gray-500"><span>Incoming requests</span><span className="text-blue-600">All systems normal</span></div></div></SceneLabel></Scene>;
}

function ProductionChanges({ progress }: StoryProps) {
  return <Scene progress={progress} range={[0.25, 0.3, 0.4, 0.46]}><SceneLabel eyebrow="Scene 03" title="Production changes"><p className="mt-3 text-center text-sm text-gray-500">The incoming data no longer looks quite the same.</p><div className="mx-auto mt-10 grid max-w-md grid-cols-2 gap-5"><DataGroup label="Training data" colors={["bg-blue-500", "bg-blue-400", "bg-blue-300", "bg-blue-500"]} /><DataGroup label="Production data" colors={["bg-blue-500", "bg-violet-300", "bg-amber-300", "bg-blue-400"]} /></div><div className="mx-auto mt-8 h-px max-w-xs bg-gray-200" /><p className="mt-4 text-center text-xs font-medium text-gray-400">No alert has been raised.</p></SceneLabel></Scene>;
}

function QualityDrop({ progress }: StoryProps) {
  const width = useTransform(progress, [0.4, 0.56], ["98%", "91%"]);
  return <Scene progress={progress} range={[0.4, 0.46, 0.54, 0.61]}><SceneLabel eyebrow="Scene 04" title="Prediction quality drops"><div className="mx-auto mt-11 max-w-sm"><div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-gray-400"><span>Model confidence</span><span>Quietly declining</span></div><div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-100"><motion.div style={{ width }} className="h-full rounded-full bg-blue-600" /></div><div className="mt-6 flex items-center justify-between font-display text-3xl font-semibold text-gray-900"><span>98%</span><span className="text-gray-300">↓</span><span>96%</span><span className="text-gray-300">↓</span><span className="text-amber-600">94%</span><span className="text-gray-300">↓</span><span className="text-red-500">91%</span></div></div><p className="mt-9 text-center text-sm text-gray-500">Everything still appears normal.</p></SceneLabel></Scene>;
}

function UsersProblem({ progress }: StoryProps) {
  return <Scene progress={progress} range={[0.54, 0.61, 0.68, 0.75]}><SceneLabel eyebrow="Scene 05" title="Users feel it first"><div className="mx-auto mt-10 flex max-w-sm justify-center gap-5"><UserMood confused={false} /><UserMood confused /><UserMood confused /></div><div className="mx-auto mt-9 max-w-sm rounded-2xl border border-gray-100 bg-gray-50 p-5"><div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm font-semibold text-gray-700"><Ticket className="h-4 w-4 text-red-500" />Support tickets</span><span className="text-xs font-semibold text-red-500">Increasing</span></div><div className="mt-4 flex items-baseline justify-between font-display text-3xl font-semibold text-gray-900"><span>0</span><span className="text-gray-300">→</span><span>2</span><span className="text-gray-300">→</span><span>11</span><span className="text-gray-300">→</span><span className="text-red-500">34</span></div></div></SceneLabel></Scene>;
}

function DeveloperScene({ progress }: StoryProps) {
  return <Scene progress={progress} range={[0.68, 0.75, 0.81, 0.87]}><SceneLabel eyebrow="Scene 06" title="Still looks normal"><div className="mx-auto mt-10 flex max-w-md items-center justify-center gap-8"><div className="relative"><div className="grid h-28 w-24 place-items-center rounded-t-[40px] rounded-b-2xl bg-gray-900"><UserRound className="h-12 w-12 text-white" /></div><div className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-blue-600 text-xs font-bold text-white">✓</div></div><div className="w-40 rounded-2xl border border-gray-100 bg-gray-50 p-4"><p className="text-xs font-semibold text-gray-500">Developer</p><p className="mt-2 text-sm font-semibold text-gray-900">“Everything looks normal.”</p></div></div><div className="mx-auto mt-10 max-w-xs border-l-2 border-red-400 pl-4 text-sm text-gray-500"><span className="font-semibold text-red-500">Behind the scenes:</span><br />prediction quality keeps degrading.</div></SceneLabel></Scene>;
}

function SentinelScene({ progress }: StoryProps) {
  const scanY = useTransform(progress, [0.82, 0.9], ["-15%", "115%"]);
  return <Scene progress={progress} range={[0.81, 0.87, 0.96, 1]}><SceneLabel eyebrow="Scene 07" title="MLSentinel sees the drift"><div className="relative mx-auto mt-8 max-w-lg overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/35 p-5"><motion.div style={{ top: scanY }} className="absolute left-0 right-0 h-px bg-blue-500 shadow-[0_0_16px_3px_rgba(37,99,235,0.35)]" /><div className="flex items-center justify-center gap-2 text-sm font-semibold text-blue-600"><ScanSearch className="h-4 w-4" />Scanning production signals…</div><div className="mt-5 flex justify-center"><span className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white"><Check className="h-4 w-4" />Drift detected</span></div></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><OutcomeCard title="Root cause" text="Feature distribution drift detected." /><OutcomeCard title="Impact" text="Accuracy 98% → 84%" /><OutcomeCard title="Recommendation" text="Retrain on the latest production data." /></div><button className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]">View Full Report <ArrowRight className="h-4 w-4" /></button></SceneLabel></Scene>;
}

function PipelineIcon({ icon, label }: { icon: React.ReactNode; label: string }) { return <div className="grid gap-2 place-items-center text-blue-600"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50">{icon}</span><span>{label}</span></div>; }
function Line() { return <div className="mb-5 h-px flex-1 bg-blue-200" />; }
function DataGroup({ label, colors }: { label: string; colors: string[] }) { return <div className="rounded-2xl border border-gray-100 p-4"><p className="text-xs font-semibold text-gray-500">{label}</p><div className="mt-4 grid grid-cols-4 gap-2">{colors.map((color, i) => <span className={`h-7 rounded-md ${color}`} key={`${color}-${i}`} />)}</div></div>; }
function UserMood({ confused }: { confused?: boolean }) { return <div className="grid h-16 w-16 place-items-center rounded-full border border-gray-100 bg-white"><UserRound className={confused ? "h-7 w-7 text-amber-500" : "h-7 w-7 text-blue-600"} /><span className="sr-only">{confused ? "Confused user" : "Happy user"}</span></div>; }
function OutcomeCard({ title, text }: { title: string; text: string }) { return <div className="rounded-xl border border-blue-100 bg-white p-3 text-left shadow-sm"><p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">{title}</p><p className="mt-1 text-xs font-medium leading-5 text-gray-700">{text}</p></div>; }

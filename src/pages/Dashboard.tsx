import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, ArrowUpRight, Bell, ChevronRight, CircleAlert, Clock3, LogOut, Plus, ShieldCheck } from "lucide-react";
import { SPRING } from "../lib/motion";

type Status = "Healthy" | "Warning" | "Critical";

type Model = {
  name: string;
  version: string;
  accuracy: string;
  latency: string;
  status: Status;
};

const models: Model[] = [
  { name: "Fraud detection", version: "v2.4.1", accuracy: "96.8%", latency: "42 ms", status: "Healthy" },
  { name: "Demand forecasting", version: "v1.8.0", accuracy: "91.2%", latency: "68 ms", status: "Warning" },
  { name: "Document classifier", version: "v3.1.2", accuracy: "98.4%", latency: "31 ms", status: "Healthy" },
];

const activity = [
  { title: "Fraud detection completed a health check", time: "2 minutes ago", status: "Healthy" as Status },
  { title: "Feature drift detected in demand forecasting", time: "18 minutes ago", status: "Warning" as Status },
  { title: "Document classifier was deployed", time: "1 hour ago", status: "Healthy" as Status },
];

const statusClass: Record<Status, string> = {
  Healthy: "border-green-200 bg-green-50 text-green-700",
  Warning: "border-amber-200 bg-amber-50 text-amber-700",
  Critical: "border-red-200 bg-red-50 text-red-600",
};

const statusDot: Record<Status, string> = {
  Healthy: "bg-green-500",
  Warning: "bg-amber-500",
  Critical: "bg-red-500",
};

const enter = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { ...SPRING, delay },
});

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  if (isLoading) {
    return <main className="flex min-h-screen items-center justify-center bg-white text-sm text-gray-500">Loading dashboard…</main>;
  }

  const displayName = user?.displayName?.split(" ")[0] || "there";
  const initials = user?.displayName?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "MS";

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-200">
        <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-6 sm:px-8">
          <a href="/" className="text-[19px] font-medium tracking-tight text-ink">MLSentinel</a>
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Notifications" className="grid h-10 w-10 place-items-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10">
              <Bell className="h-4 w-4" />
            </button>
            <div className="hidden items-center gap-3 sm:flex">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-sm font-medium text-blue-600">{initials}</span>
              <div className="leading-tight">
                <p className="text-sm font-medium text-gray-900">{user?.displayName || "MLSentinel user"}</p>
                <p className="mt-1 text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button type="button" onClick={handleLogout} className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10" aria-label="Log out">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] px-6 py-12 sm:px-8 lg:py-16">
        <motion.section {...enter(0)} className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-blue-600">Production overview</p>
            <h1 className="mt-3 text-4xl font-medium tracking-tight text-gray-900 sm:text-5xl">Good morning, {displayName}.</h1>
            <p className="mt-4 text-base leading-relaxed text-gray-600">Your production models are being monitored continuously.</p>
          </div>
          <button type="button" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gray-900 px-5 text-sm font-medium text-white transition-colors hover:bg-black focus:outline-none focus:ring-4 focus:ring-gray-900/20">
            <Plus className="h-4 w-4" />
            Add model
          </button>
        </motion.section>

        <section aria-label="Monitoring summary" className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard delay={0.05} label="Models monitored" value="12" detail="3 added this month" icon={<Activity className="h-4 w-4" />} />
          <SummaryCard delay={0.1} label="Average health" value="94.6%" detail="Up 1.8% this week" icon={<ShieldCheck className="h-4 w-4" />} tone="text-green-600" />
          <SummaryCard delay={0.15} label="Open alerts" value="2" detail="1 needs attention" icon={<CircleAlert className="h-4 w-4" />} tone="text-amber-600" />
          <SummaryCard delay={0.2} label="Predictions today" value="48.2k" detail="Across all production models" icon={<Clock3 className="h-4 w-4" />} />
        </section>

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
          <motion.section {...enter(0.25)} className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8" aria-labelledby="health-heading">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-blue-600">System health</p>
                <h2 id="health-heading" className="mt-2 text-2xl font-medium tracking-tight text-gray-900">Healthy across production</h2>
              </div>
              <StatusBadge status="Healthy" />
            </div>
            <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1fr)_180px] md:items-end">
              <HealthChart />
              <div className="grid grid-cols-2 gap-4 md:grid-cols-1">
                <Metric label="Accuracy" value="94.6%" />
                <Metric label="Latency" value="38 ms" />
                <Metric label="Data drift" value="Low" />
              </div>
            </div>
          </motion.section>

          <motion.section {...enter(0.3)} className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8" aria-labelledby="activity-heading">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Recent activity</p>
                <h2 id="activity-heading" className="mt-2 text-2xl font-medium tracking-tight text-gray-900">What changed</h2>
              </div>
              <button type="button" aria-label="View all activity" className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10"><ArrowUpRight className="h-4 w-4" /></button>
            </div>
            <ol className="mt-7 divide-y divide-gray-100">
              {activity.map((item) => (
                <li key={item.title} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${statusDot[item.status]}`} aria-hidden="true" />
                  <div>
                    <p className="text-sm leading-5 text-gray-800">{item.title}</p>
                    <p className="mt-1 text-xs text-gray-500">{item.time}</p>
                  </div>
                </li>
              ))}
            </ol>
          </motion.section>
        </div>

        <motion.section {...enter(0.35)} className="mt-12" aria-labelledby="models-heading">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-blue-600">Your models</p>
              <h2 id="models-heading" className="mt-2 text-2xl font-medium tracking-tight text-gray-900">Production models</h2>
            </div>
            <button type="button" className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700">View all</button>
          </div>
          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="hidden grid-cols-[minmax(180px,1.6fr)_0.8fr_0.8fr_0.8fr_auto] gap-4 border-b border-gray-100 px-6 py-4 text-xs font-medium text-gray-500 md:grid">
              <span>Model</span><span>Accuracy</span><span>Latency</span><span>Status</span><span className="sr-only">Open</span>
            </div>
            <ul>
              {models.map((model) => <ModelRow key={model.name} model={model} />)}
            </ul>
          </div>
        </motion.section>
      </div>
    </main>
  );
}

function SummaryCard({ delay, label, value, detail, icon, tone = "text-blue-600" }: { delay: number; label: string; value: string; detail: string; icon: React.ReactNode; tone?: string }) {
  return (
    <motion.article {...enter(delay)} className="rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300 hover:bg-gray-50/50">
      <div className="flex items-center justify-between"><p className="text-sm text-gray-600">{label}</p><span className={tone}>{icon}</span></div>
      <p className="mt-5 text-3xl font-medium tracking-tight text-gray-900">{value}</p>
      <p className="mt-2 text-xs text-gray-500">{detail}</p>
    </motion.article>
  );
}

function StatusBadge({ status }: { status: Status }) {
  return <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${statusClass[status]}`}><span className={`h-1.5 w-1.5 rounded-full ${statusDot[status]}`} />{status}</span>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4"><p className="text-xs text-gray-500">{label}</p><p className="mt-2 text-lg font-medium tracking-tight text-gray-900">{value}</p></div>;
}

function HealthChart() {
  return (
    <div>
      <div className="flex items-baseline justify-between"><div><p className="text-sm text-gray-600">Average health score</p><p className="mt-2 text-4xl font-medium tracking-tight text-gray-900">94.6%</p></div><p className="text-sm font-medium text-green-600">+1.8%</p></div>
      <svg viewBox="0 0 620 190" fill="none" className="mt-6 h-auto w-full" role="img" aria-label="Model health trend for the last seven days">
        <path d="M0 150H620M0 95H620M0 40H620" stroke="#F3F4F6" strokeWidth="1" />
        <path d="M0 145C38 138 61 132 94 137C129 142 149 111 189 116C226 121 254 97 286 100C324 104 349 81 381 85C418 89 445 58 478 66C518 76 545 35 620 25" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
        <circle cx="620" cy="25" r="5" fill="#2563EB" /><circle cx="620" cy="25" r="9" stroke="#DBEAFE" strokeWidth="6" />
      </svg>
      <div className="mt-2 flex justify-between text-xs text-gray-400"><span>7 days ago</span><span>Today</span></div>
    </div>
  );
}

function ModelRow({ model }: { model: Model }) {
  return (
    <li className="grid gap-3 border-b border-gray-100 px-6 py-5 last:border-b-0 md:grid-cols-[minmax(180px,1.6fr)_0.8fr_0.8fr_0.8fr_auto] md:items-center md:gap-4">
      <div><p className="text-sm font-medium text-gray-900">{model.name}</p><p className="mt-1 text-xs text-gray-500">{model.version}</p></div>
      <div className="flex justify-between text-sm md:block"><span className="text-gray-500 md:hidden">Accuracy</span><span>{model.accuracy}</span></div>
      <div className="flex justify-between text-sm md:block"><span className="text-gray-500 md:hidden">Latency</span><span>{model.latency}</span></div>
      <div className="flex justify-between md:block"><span className="text-sm text-gray-500 md:hidden">Status</span><StatusBadge status={model.status} /></div>
      <button type="button" aria-label={`Open ${model.name}`} className="hidden rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 md:inline-flex"><ChevronRight className="h-4 w-4" /></button>
    </li>
  );
}

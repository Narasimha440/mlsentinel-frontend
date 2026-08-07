import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { Sidebar } from "../components/dashboard/Sidebar";
import { auth } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowUpRight, Bell, ChevronRight, CircleAlert, LogOut, Plus, ShieldCheck } from "lucide-react";
import { SPRING } from "../lib/motion";
import { AddModelModal } from "../components/dashboard/AddModelModal";
import { WhatsNewModal } from "../components/dashboard/WhatsNewModal";

type Status = "Healthy" | "Warning" | "Critical";

interface DashboardData {
  summary: {
    overall_health_score: number | null;
    active_models: number;
    healthy_models: number;
    warning_models: number;
    critical_models: number;
  };
  health_trend: { date: string; health_score: number }[];
  model_performance: {
    model_id: number;
    project: string;
    name: string;
    health_score: number;
    metrics: Record<string, number>;
    status: Status;
    last_updated: string;
  }[];
  available_models: { model_id: number; name: string; project: string }[];
  findings: { model: string; issue: string; severity: string; detected_at: string }[];
  recommendations: { model: string; recommendation: string; severity: string }[];
  recent_reports: { project: string; model: string; health_score: number; issues: number; timestamp: string }[];
}

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

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export default function Dashboard() {
  interface DataQualitySummary {
    model_id: number;
    model_name: string;
    project_name: string;
    row_count: number;
    duplicate_row_percentage: number;
    findings: { severity: string }[];
    checked_at: string;
  }

  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [dataQuality, setDataQuality] = useState<DataQualitySummary[]>([]);
  const [showAddModelModal, setShowAddModelModal] = useState(false);


  const refetchDashboard = async () => {
    if (!user) return;
    const token = await user.getIdToken();
    const url = selectedModelId
      ? `${API_BASE}/api/dashboard?model_id=${selectedModelId}`
      : `${API_BASE}/api/dashboard`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setData(await res.json());
  };

  useEffect(() => {
    if (!user) return;


    const fetchDashboard = async () => {
      setLoadingData(true);
      try {
        const token = await user.getIdToken();
        const url = selectedModelId
          ? `${API_BASE}/api/dashboard?model_id=${selectedModelId}`
          : `${API_BASE}/api/dashboard`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError("Couldn't load dashboard data. Please try again.");
      } finally {
        setLoadingData(false);
      }
    };

    fetchDashboard();
  }, [user, selectedModelId]);

  useEffect(() => {
    if (!user) return;

    (async () => {
      const token = await user.getIdToken();
      const res = await fetch(`${API_BASE}/api/dashboard/data-quality`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const json = await res.json();
        setDataQuality(json.reports);
      }
    })();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  if (isLoading || (!data && loadingData)) {
    return <main className="flex min-h-screen items-center justify-center bg-white text-sm text-gray-500">Loading dashboard…</main>;
  }

  if (error) {
    return <main className="flex min-h-screen items-center justify-center bg-white text-sm text-red-500">{error}</main>;
  }

  const displayName = user?.displayName?.split(" ")[0] || "there";
  const initials = user?.displayName?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "MS";

  const summary = data?.summary;
  const hasModels = (summary?.active_models ?? 0) > 0;

  return (
    <div className="min-h-screen bg-white">
      <Sidebar
        userName={user?.displayName || "MLSentinel user"}
        userEmail={user?.email || ""}
        userPhotoUrl={user?.photoURL || undefined}
      />
      <main className="ml-64 min-h-screen bg-white">
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
                <p className="mt-4 text-base leading-relaxed text-gray-600">
                  {hasModels ? "Your production models are being monitored continuously." : "No models tracked yet — send your first report to get started."}
                </p>
              </div>
              <button type="button" onClick={() => setShowAddModelModal(true)} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gray-900 px-5 text-sm font-medium text-white transition-colors hover:bg-black focus:outline-none focus:ring-4 focus:ring-gray-900/20">
                <Plus className="h-4 w-4" />
                Add model
              </button>
            </motion.section>

            {hasModels && (
              <>
                <section aria-label="Monitoring summary" className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <SummaryCard delay={0.05} label="Active models" value={String(summary!.active_models)} detail="" icon={<Activity className="h-4 w-4" />} />
                  <SummaryCard delay={0.1} label="Overall health" value={summary!.overall_health_score !== null ? `${summary!.overall_health_score}%` : "—"} detail="" icon={<ShieldCheck className="h-4 w-4" />} tone="text-green-600" />
                  <SummaryCard delay={0.15} label="Healthy models" value={String(summary!.healthy_models)} detail="" icon={<ShieldCheck className="h-4 w-4" />} tone="text-green-600" />
                  <SummaryCard delay={0.2} label="Critical models" value={String(summary!.critical_models)} detail="" icon={<CircleAlert className="h-4 w-4" />} tone="text-red-600" />
                </section>

                <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
                  <motion.section {...enter(0.25)} className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8" aria-labelledby="health-heading">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-blue-600">System health</p>
                        <h2 id="health-heading" className="mt-2 text-2xl font-medium tracking-tight text-gray-900">Health score over time</h2>
                      </div>
                      <div className="flex items-center gap-3">
                        {data && data.available_models.length > 0 && (
                          <select
                            value={selectedModelId ?? "all"}
                            onChange={(e) => setSelectedModelId(e.target.value === "all" ? null : Number(e.target.value))}
                            className="h-9 rounded-full border border-gray-200 px-4 text-sm font-medium text-gray-700 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                          >
                            <option value="all">All models</option>
                            {data.available_models.map((m) => (
                              <option key={m.model_id} value={m.model_id}>
                                {m.project} / {m.name}
                              </option>
                            ))}
                          </select>
                        )}
                      <StatusBadge status={summary!.critical_models > 0 ? "Critical" : summary!.warning_models > 0 ? "Warning" : "Healthy"} />
                    </div>
                  </div>
                    <div className={`mt-8 transition-opacity duration-200 ${loadingData ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
                      <HealthChart trend={data!.health_trend} current={summary!.overall_health_score} />
                    </div>
                  </motion.section>

                  <motion.section {...enter(0.3)} className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8" aria-labelledby="activity-heading">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">Recent reports</p>
                        <h2 id="activity-heading" className="mt-2 text-2xl font-medium tracking-tight text-gray-900">Latest runs</h2>
                      </div>
                      <button type="button" aria-label="View all activity" className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10"><ArrowUpRight className="h-4 w-4" /></button>
                    </div>
                    <div className="mt-7 max-h-[350px] overflow-y-auto pr-2">
                      <ol className="divide-y divide-gray-100">
                          {data!.recent_reports.map((item, i) => (
                            <li key={i} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                              <span
                                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                                  item.issues === 0 ? statusDot.Healthy : statusDot.Warning
                                }`}
                              />
                              <div>
                                <p className="text-sm leading-5 text-gray-800">
                                  {item.model} — {item.health_score}% ({item.issues} issue{item.issues !== 1 ? "s" : ""})
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  {new Date(item.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ol>
                    </div>
                  </motion.section>
                </div>

                <motion.section {...enter(0.35)} className="mt-12" aria-labelledby="models-heading">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Your models</p>
                      <h2 id="models-heading" className="mt-2 text-2xl font-medium tracking-tight text-gray-900">Production models</h2>
                    </div>
                  </div>
                  <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <div className="hidden grid-cols-[minmax(180px,1.6fr)_0.8fr_0.8fr_0.8fr_auto] gap-4 border-b border-gray-100 px-6 py-4 text-xs font-medium text-gray-500 md:grid">
                      <span>Model</span><span>Accuracy</span><span>Recall</span><span>Status</span><span className="sr-only">Open</span>
                    </div>
                    <ul>
                      {data!.model_performance.map((model) => <ModelRow key={model.model_id} model={model} />)}
                    </ul>
                  </div>
                </motion.section>

                {dataQuality.length > 0 && (
                  <motion.section {...enter(0.4)} className="mt-12" aria-labelledby="quality-heading">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-blue-600">Data Health</p>
                        <h2 id="quality-heading" className="mt-2 text-2xl font-medium tracking-tight text-gray-900">Data Quality</h2>
                      </div>
                      <a href="/dashboard/data-quality" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                        View all →
                      </a>
                    </div>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {dataQuality.map((dq) => {
                        const criticalCount = dq.findings.filter((f) => f.severity === "critical").length;
                        const warningCount = dq.findings.filter((f) => f.severity === "warning").length;

                        return (
                          <div key={dq.model_id} className="rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300 hover:bg-gray-50/50">
                            <p className="text-sm font-medium text-gray-900">{dq.model_name}</p>
                            <p className="text-xs text-gray-500">{dq.project_name}</p>
                            <div className="mt-4 flex items-baseline gap-2">
                              <span className="text-2xl font-medium tracking-tight text-gray-900">
                                {dq.row_count.toLocaleString()}
                              </span>
                              <span className="text-xs text-gray-500">Rows checked</span>
                            </div>
                            <div className="mt-3 flex items-center gap-3 text-xs">
                              <span className="text-gray-500">{dq.duplicate_row_percentage}% duplicates</span>
                              {criticalCount > 0 && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 font-medium text-red-700">
                                  {criticalCount} critical
                                </span>
                              )}
                              {warningCount > 0 && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700">
                                  {warningCount} warning{warningCount !== 1 ? "s" : ""}
                                </span>
                              )}
                              {criticalCount === 0 && warningCount === 0 && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 font-medium text-green0700">
                                  No issues
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.section>
                )}
              </>
            )}
          </div>
      </main>
      <AddModelModal
        open={showAddModelModal}
        onClose={() => setShowAddModelModal(false)}
        onCreated={refetchDashboard}
        user={user}
        apiBase={API_BASE}
      />
      <WhatsNewModal userId={user?.uid} />
    </div>
  );
}

function SummaryCard({ delay, label, value, detail, icon, tone = "text-blue-600" }: { delay: number; label: string; value: string; detail: string; icon: React.ReactNode; tone?: string }) {
  return (
    <motion.article {...enter(delay)} className="rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300 hover:bg-gray-50/50">
      <div className="flex items-center justify-between"><p className="text-sm text-gray-600">{label}</p><span className={tone}>{icon}</span></div>
      <p className="mt-5 text-3xl font-medium tracking-tight text-gray-900">{value}</p>
      {detail && <p className="mt-2 text-xs text-gray-500">{detail}</p>}
    </motion.article>
  );
}

function StatusBadge({ status }: { status: Status }) {
  return <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${statusClass[status]}`}><span className={`h-1.5 w-1.5 rounded-full ${statusDot[status]}`} />{status}</span>;
}


function HealthChart({ trend, current }: { trend: { date: string; health_score: number }[]; current: number | null }) {
  const width = 620;
  const height = 190;

  const topPadding = 20;
  const bottomPadding = 25;

  const chartHeight = height - topPadding - bottomPadding;

  const max = trend.length
    ? Math.max(...trend.map((p) => p.health_score), 100)
    : 100;
  
  const min = trend.length
    ? Math.min(...trend.map((p) => p.health_score), 0)
    : 0;

  const getX = (i: number) =>
    trend.length > 1
    ? (i * width) / (trend.length - 1)
    : width / 2;
  
  const getY = (score: number) =>
    topPadding +
    chartHeight -
    ((score - min) / (max - min || 1)) * chartHeight;
  
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const formatLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const formatFull = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
  };


  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (trend.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = ((e.clientX - rect.left) / rect.width) * width;

    if (trend.length === 1) {
      setHoverIndex(0);
      return;
    }

    const step = width / (trend.length - 1);
    const index = Math.round(relativeX / step);
    setHoverIndex(Math.max(0, Math.min(trend.length - 1, index)));
  };

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-sm text-gray-600">Average health score</p>
          <p className="mt-2 text-4xl font-medium tracking-tight text-gray-900">{current !== null ? `${current}%` : "—"}</p>
        </div>
      </div>

      {trend.length === 0 ? (
        <p className="mt-8 text-sm text-gray-500">No trend data yet — run more checks to see history.</p>
      ) : (
        <div className="relative mt-6">
          {hoverIndex !== null && (
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg"
              style={{
                left: `${(getX(hoverIndex) / width) * 100}%`,
                top: `${(getY(trend[hoverIndex].health_score) / height) * 100}%`,
                marginTop: "-8px",
              }}
            >
              <p className="font-medium text-gray-900">{formatFull(trend[hoverIndex].date)}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-gray-600">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                Health score <span className="font-medium text-gray-900">{trend[hoverIndex].health_score}%</span>
              </p>
            </div>
          )}

          <svg
            viewBox={`0 0 ${width} ${height}`}
            fill="none"
            className="h-auto w-full cursor-crosshair"
            role="img"
            aria-label="Model health trend"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <path d={`M0 150H${width}M0 95H${width}M0 40H${width}`} stroke="#F3F4F6" strokeWidth="1" />

            {trend.length > 1 && (
              <path
                d={trend
                  .map((t, i) => `${i === 0 ? "M" : "L"}${getX(i)} ${getY(t.health_score)}`)
                  .join(" ")}
                stroke="#2563EB"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
            )}

            {trend.map((t, i) => (
              <circle
                key={i}
                cx={getX(i)}
                cy={getY(t.health_score)}
                r={hoverIndex === i ? 6 : trend.length === 1 ? 5 : 0}
                fill="#2563EB"
                className="transition-all"
              />
            ))}

            {hoverIndex !== null && (
              <line
                x1={getX(hoverIndex)}
                y1={0}
                x2={getX(hoverIndex)}
                y2={height}
                stroke="#2563EB"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.3"
              />
            )}
          </svg>

          {trend.length > 1 && (
            <div className="mt-2 flex justify-between text-xs text-gray-400">
              <span>{formatLabel(trend[0].date)}</span>
              <span>{formatLabel(trend[trend.length - 1].date)}</span>
            </div>
          )}
          {trend.length === 1 && (
            <p className="mt-3 text-center text-xs text-gray-400">
              One report so far — the trend line will appear once you have more runs.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ModelRow({ model }: { model: DashboardData["model_performance"][0] }) {
  return (
    <li className="grid gap-3 border-b border-gray-100 px-6 py-5 last:border-b-0 md:grid-cols-[minmax(180px,1.6fr)_0.8fr_0.8fr_0.8fr_auto] md:items-center md:gap-4">
      <div><p className="text-sm font-medium text-gray-900">{model.name}</p><p className="mt-1 text-xs text-gray-500">{model.project}</p></div>
      <div className="flex justify-between text-sm md:block"><span className="text-gray-500 md:hidden">Accuracy</span><span>{model.metrics.accuracy ?? "—"}</span></div>
      <div className="flex justify-between text-sm md:block"><span className="text-gray-500 md:hidden">Recall</span><span>{model.metrics.recall ?? "—"}</span></div>
      <div className="flex justify-between md:block"><span className="text-sm text-gray-500 md:hidden">Status</span><StatusBadge status={model.status} /></div>
      <button type="button" aria-label={`Open ${model.name}`} className="hidden rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 md:inline-flex"><ChevronRight className="h-4 w-4" /></button>
    </li>
  );
}
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Sidebar } from "../components/dashboard/Sidebar";
import { Activity } from "lucide-react";

interface RunPoint {
  id: number;
  created_at: string;
  health_score: number | null;
  status: "Healthy" | "Warning" | "Critical";
  metrics: Record<string, number>;
}

interface ModelMonitoring {
  model_id: number;
  model_name: string;
  project_name: string;
  trend: RunPoint[];
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const statusDot: Record<string, string> = {
  Healthy: "#22c55e",
  Warning: "#f59e0b",
  Critical: "#ef4444",
};

export default function MonitoringPage() {
  const { user } = useAuth();
  const [data, setData] = useState<ModelMonitoring[]>([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<{ modelId: number; index: number } | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const token = await user.getIdToken();
      const res = await fetch(`${API_BASE}/api/monitoring`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setData(json.monitoring);
      setLoading(false);
    })();
  }, [user]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  const formatFull = (dateStr: string) =>
    new Date(dateStr).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  return (
    <div className="flex min-h-screen">
      <Sidebar
        userName={user?.displayName || "MLSentinel user"}
        userEmail={user?.email || ""}
        userPhotoUrl={user?.photoURL || undefined}
      />

      <main className="min-h-screen flex-1 bg-white text-gray-900">
        <div className="mx-auto max-w-[1280px] px-12 py-16 sm:px-16">
          <p className="text-sm font-medium text-blue-600">Live tracking</p>
          <h1 className="mt-3 text-4xl font-medium tracking-tight text-gray-900 sm:text-5xl">Monitoring</h1>
          <p className="mt-4 text-base text-gray-600">Recent health score history for each of your models.</p>

          {loading ? (
            <p className="mt-12 text-sm text-gray-500">Loading...</p>
          ) : data.length === 0 ? (
            <div className="mt-12 flex flex-col items-center gap-3 rounded-2xl border border-gray-200 px-8 py-24 text-center">
              <Activity className="h-8 w-8 text-gray-400" />
              <p className="text-base font-medium text-gray-900">No models yet</p>
              <p className="text-sm text-gray-500">Once you send reports, their trend will show up here.</p>
            </div>
          ) : (
            <div className="mt-12 space-y-6">
              {data.map((model) => {
                const width = 620;
                const height = 140;
                const trend = model.trend;
                const scores = trend.map((t) => t.health_score ?? 0);
                const max = Math.max(...scores, 100);
                const min = Math.min(...scores, 0);

                const getX = (i: number) => (trend.length > 1 ? (i * width) / (trend.length - 1) : width / 2);
                const getY = (score: number) => height - ((score - min) / (max - min || 1)) * height;

                const path = trend
                  .map((t, i) => `${i === 0 ? "M" : "L"}${getX(i)} ${getY(t.health_score ?? 0)}`)
                  .join(" ");

                const isHovered = (i: number) => hovered?.modelId === model.model_id && hovered?.index === i;
                const hoveredPoint = hovered?.modelId === model.model_id ? trend[hovered.index] : null;

                return (
                  <div key={model.model_id} className="rounded-2xl border border-gray-200 p-6 sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-blue-600">{model.project_name}</p>
                        <h2 className="mt-1 text-xl font-medium tracking-tight text-gray-900">{model.model_name}</h2>
                      </div>
                      {trend.length > 0 && (
                        <p className="text-2xl font-medium tracking-tight text-gray-900">
                          {trend[trend.length - 1].health_score !== null
                            ? `${trend[trend.length - 1].health_score}%`
                            : "—"}
                        </p>
                      )}
                    </div>

                    {trend.length === 0 ? (
                      <p className="mt-6 text-sm text-gray-500">No runs yet for this model.</p>
                    ) : (
                      <div className="relative mt-6">
                        {hoveredPoint && (
                          <div
                            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg"
                            style={{
                              left: `${(getX(hovered!.index) / width) * 100}%`,
                              top: `${(getY(hoveredPoint.health_score ?? 0) / height) * 100}%`,
                              marginTop: "-8px",
                            }}
                          >
                            <p className="font-medium text-gray-900">{formatFull(hoveredPoint.created_at)}</p>
                            <p className="mt-0.5 text-gray-600">
                              {hoveredPoint.health_score !== null ? `${hoveredPoint.health_score}%` : "—"} · {hoveredPoint.status}
                            </p>
                          </div>
                        )}

                        <svg
                          viewBox={`0 0 ${width} ${height}`}
                          className="h-auto w-full cursor-crosshair"
                          onMouseMove={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const relX = ((e.clientX - rect.left) / rect.width) * width;
                            const step = trend.length > 1 ? width / (trend.length - 1) : width;
                            const index = Math.round(relX / step);
                            setHovered({ modelId: model.model_id, index: Math.max(0, Math.min(trend.length - 1, index)) });
                          }}
                          onMouseLeave={() => setHovered(null)}
                        >
                          <path d={`M0 ${height * 0.75}H${width}M0 ${height * 0.4}H${width}`} stroke="#F3F4F6" strokeWidth="1" />
                          {trend.length > 1 && <path d={path} stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" fill="none" />}
                          {trend.map((t, i) => (
                            <circle
                              key={t.id}
                              cx={getX(i)}
                              cy={getY(t.health_score ?? 0)}
                              r={isHovered(i) ? 5 : 3}
                              fill={statusDot[t.status] || "#2563EB"}
                            />
                          ))}
                        </svg>

                        <div className="mt-2 flex justify-between text-xs text-gray-400">
                          <span>{formatDate(trend[0].created_at)}</span>
                          <span>{formatDate(trend[trend.length - 1].created_at)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
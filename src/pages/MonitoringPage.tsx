import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Sidebar } from "../components/dashboard/Sidebar";
import {
  Activity,
} from "lucide-react";

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

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

const statusDot: Record<string, string> = {
  Healthy: "#22c55e",
  Warning: "#f59e0b",
  Critical: "#ef4444",
};

// CHANGE: Added status background styles for the model status badge.
const statusBadge: Record<string, string> = {
  Healthy: "border-green-200 bg-green-50 text-green-700",
  Warning: "border-amber-200 bg-amber-50 text-amber-700",
  Critical: "border-red-200 bg-red-50 text-red-700",
};

// CHANGE: Added helper for formatting health-score changes.
const formatChange = (current: number | null, previous: number | null) => {
  if (current === null || previous === null) {
    return null;
  }

  return Number((current - previous).toFixed(1));
};

export default function MonitoringPage() {
  const { user } = useAuth();

  const [data, setData] = useState<ModelMonitoring[]>([]);
  const [loading, setLoading] = useState(true);

  const [hovered, setHovered] = useState<{
    modelId: number;
    index: number;
  } | null>(null);

  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const token = await user.getIdToken();

        const res = await fetch(
          `${API_BASE}/api/monitoring`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error(
            `Failed to fetch monitoring data: ${res.status}`
          );
        }

        const json = await res.json();

        setData(
          Array.isArray(json.monitoring)
            ? json.monitoring
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load monitoring data:",
          error
        );

        setData([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // const formatDate = (dateStr: string) =>
  //   new Date(dateStr).toLocaleDateString(
  //     undefined,
  //     {
  //       month: "short",
  //       day: "numeric",
  //     }
  //   );

  const formatFull = (dateStr: string) =>
    new Date(dateStr).toLocaleString(
      undefined,
      {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );

  // CHANGE: Added summary counts for the monitoring overview.
  const totalModels = data.length;

  const healthyModels = data.filter((model) => {
    const latest =
      model.trend[model.trend.length - 1];

    return latest?.status === "Healthy";
  }).length;

  const warningModels = data.filter((model) => {
    const latest =
      model.trend[model.trend.length - 1];

    return latest?.status === "Warning";
  }).length;

  const criticalModels = data.filter((model) => {
    const latest =
      model.trend[model.trend.length - 1];

    return latest?.status === "Critical";
  }).length;

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar
        userName={
          user?.displayName ||
          "MLSentinel user"
        }
        userEmail={user?.email || ""}
        userPhotoUrl={
          user?.photoURL || undefined
        }
      />

      <main className="min-h-screen min-w-0 flex-1 bg-white text-gray-900">

        {/* CHANGE: Increased the page width from 1280px to 1500px. */}
        <div className="mx-auto w-full max-w-[1500px] px-6 py-12 sm:px-10 lg:px-12 lg:py-16">

          <p className="text-sm font-medium text-blue-600">
            Live tracking
          </p>

          <h1 className="mt-3 text-4xl font-medium tracking-tight text-gray-900 sm:text-5xl">
            Monitoring
          </h1>

          <p className="mt-4 max-w-2xl text-base text-gray-600">
            Recent health score history for each of
            your models.
          </p>

          {loading ? (
            <p className="mt-12 text-sm text-gray-500">
              Loading...
            </p>
          ) : data.length === 0 ? (
            <div className="mt-12 flex flex-col items-center gap-3 rounded-2xl border border-gray-200 px-8 py-24 text-center">
              <Activity className="h-8 w-8 text-gray-400" />

              <p className="text-base font-medium text-gray-900">
                No models yet
              </p>

              <p className="text-sm text-gray-500">
                Once you send reports, their trend will
                show up here.
              </p>
            </div>
          ) : (
            <>
              {/* CHANGE: Added monitoring summary cards. */}
              <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <div className="rounded-xl border border-gray-200 bg-white px-5 py-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Models monitored
                  </p>

                  <p className="mt-2 text-2xl font-medium tracking-tight text-gray-900">
                    {totalModels}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Models with monitoring data
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white px-5 py-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Healthy
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />

                    <p className="text-2xl font-medium tracking-tight text-gray-900">
                      {healthyModels}
                    </p>
                  </div>

                  <p className="mt-1 text-sm text-gray-500">
                    Models currently healthy
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white px-5 py-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Warning
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />

                    <p className="text-2xl font-medium tracking-tight text-gray-900">
                      {warningModels}
                    </p>
                  </div>

                  <p className="mt-1 text-sm text-gray-500">
                    Models requiring attention
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white px-5 py-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Critical
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500" />

                    <p className="text-2xl font-medium tracking-tight text-gray-900">
                      {criticalModels}
                    </p>
                  </div>

                  <p className="mt-1 text-sm text-gray-500">
                    Models requiring immediate attention
                  </p>
                </div>
              </div>

              {/* CHANGE: Increased spacing between monitoring cards. */}
              <div className="mt-8 space-y-6">

                {data.map((model) => {
                  // CHANGE: Increased chart dimensions significantly.
                  const width = 1000;
                  const height = 280;

                  const trend = model.trend;

                  const scores = trend.map(
                    (t) => t.health_score ?? 0
                  );

                  const max = Math.max(
                    ...scores,
                    100
                  );

                  const min = Math.min(
                    ...scores,
                    0
                  );

                  const getX = (i: number) =>
                    trend.length > 1
                      ? (i * width) /
                        (trend.length - 1)
                      : width / 2;

                  const getY = (score: number) =>
                    height -
                    ((score - min) /
                      (max - min || 1)) *
                      height;

                  const path = trend
                    .map(
                      (t, i) =>
                        `${i === 0 ? "M" : "L"}${getX(
                          i
                        )} ${getY(
                          t.health_score ?? 0
                        )}`
                    )
                    .join(" ");

                  // CHANGE: Added area path underneath the line.
                  const areaPath =
                    trend.length > 1
                      ? `${path} L${width} ${height} L0 ${height} Z`
                      : "";

                  const isHovered = (i: number) =>
                    hovered?.modelId ===
                      model.model_id &&
                    hovered?.index === i;

                  const hoveredPoint =
                    hovered?.modelId ===
                    model.model_id
                      ? trend[hovered.index]
                      : null;

                  const latest =
                    trend.length > 0
                      ? trend[trend.length - 1]
                      : null;

                  const previous =
                    trend.length > 1
                      ? trend[trend.length - 2]
                      : null;

                  const change = formatChange(
                    latest?.health_score ?? null,
                    previous?.health_score ?? null
                  );

                  return (
                    <div
                      key={model.model_id}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
                    >
                      {/* CHANGE: Larger card header with current health information. */}
                      <div className="flex flex-wrap items-start justify-between gap-6 px-6 py-6 sm:px-8 sm:py-7">

                        <div>
                          <p className="text-sm font-medium text-blue-600">
                            {model.project_name}
                          </p>

                          <h2 className="mt-1 text-xl font-medium tracking-tight text-gray-900">
                            {model.model_name}
                          </h2>

                          {latest && (
                            <div className="mt-3 flex flex-wrap items-center gap-3">

                              <span
                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${statusBadge[latest.status]}`}
                              >
                                <span
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{
                                    backgroundColor:
                                      statusDot[
                                        latest.status
                                      ],
                                  }}
                                />

                                {latest.status}
                              </span>

                              <span className="text-xs text-gray-400">
                                Last run{" "}
                                {formatFull(
                                  latest.created_at
                                )}
                              </span>
                            </div>
                          )}
                        </div>

                        {latest && (
                          <div className="text-right">

                            <p className="text-3xl font-medium tracking-tight text-gray-900">
                              {latest.health_score !==
                              null
                                ? `${latest.health_score}%`
                                : "—"}
                            </p>

                            {change !== null && (
                              <p
                                className={`mt-1 text-sm font-medium ${
                                  change > 0
                                    ? "text-green-600"
                                    : change < 0
                                    ? "text-red-600"
                                    : "text-gray-400"
                                }`}
                              >
                                {change > 0
                                  ? "+"
                                  : ""}
                                {change}%
                                <span className="ml-1 font-normal text-gray-400">
                                  vs previous
                                </span>
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {trend.length === 0 ? (
                        <div className="border-t border-gray-100 px-8 py-12">
                          <p className="text-sm text-gray-500">
                            No runs yet for this model.
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* CHANGE: Added a larger chart area with health zones. */}
                          <div className="border-t border-gray-100 px-6 py-6 sm:px-8">

                            <div className="relative">

                              {/* CHANGE: Added health-zone background. */}
                              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">

                                <div
                                  className="absolute inset-x-0 top-0 bg-green-50/50"
                                  style={{
                                    height: "20%",
                                  }}
                                />

                                <div
                                  className="absolute inset-x-0 bg-amber-50/40"
                                  style={{
                                    top: "20%",
                                    height: "20%",
                                  }}
                                />

                                <div
                                  className="absolute inset-x-0 bottom-0 bg-red-50/30"
                                  style={{
                                    height: "40%",
                                  }}
                                />

                              </div>

                              {hoveredPoint && (
                                <div
                                  className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg"
                                  style={{
                                    left: `${
                                      (getX(
                                        hovered!.index
                                      ) /
                                        width) *
                                      100
                                    }%`,
                                    top: `${
                                      (getY(
                                        hoveredPoint.health_score ??
                                          0
                                      ) /
                                        height) *
                                      100
                                    }%`,
                                    marginTop: "-12px",
                                  }}
                                >
                                  <p className="whitespace-nowrap text-xs font-medium text-gray-900">
                                    {formatFull(
                                      hoveredPoint.created_at
                                    )}
                                  </p>

                                  <p className="mt-1 text-sm font-medium text-gray-900">
                                    Health{" "}
                                    {hoveredPoint.health_score !==
                                    null
                                      ? `${hoveredPoint.health_score}%`
                                      : "—"}
                                  </p>

                                  <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                                    <span
                                      className="h-1.5 w-1.5 rounded-full"
                                      style={{
                                        backgroundColor:
                                          statusDot[
                                            hoveredPoint
                                              .status
                                          ],
                                      }}
                                    />

                                    {hoveredPoint.status}
                                  </p>
                                </div>
                              )}

                              <svg
                                viewBox={`0 0 ${width} ${height}`}
                                preserveAspectRatio="none"
                                className="relative z-10 h-[280px] w-full cursor-crosshair"
                                onMouseMove={(e) => {
                                  const rect =
                                    e.currentTarget.getBoundingClientRect();

                                  const relX =
                                    ((e.clientX -
                                      rect.left) /
                                      rect.width) *
                                    width;

                                  const step =
                                    trend.length > 1
                                      ? width /
                                        (trend.length -
                                          1)
                                      : width;

                                  const index =
                                    Math.round(
                                      relX / step
                                    );

                                  setHovered({
                                    modelId:
                                      model.model_id,
                                    index: Math.max(
                                      0,
                                      Math.min(
                                        trend.length -
                                          1,
                                        index
                                      )
                                    ),
                                  });
                                }}
                                onMouseLeave={() =>
                                  setHovered(null)
                                }
                              >
                                {/* CHANGE: Added cleaner horizontal grid lines. */}
                                <line
                                  x1="0"
                                  y1={getY(100)}
                                  x2={width}
                                  y2={getY(100)}
                                  stroke="#E5E7EB"
                                  strokeWidth="1"
                                />

                                <line
                                  x1="0"
                                  y1={getY(80)}
                                  x2={width}
                                  y2={getY(80)}
                                  stroke="#E5E7EB"
                                  strokeWidth="1"
                                  strokeDasharray="4 6"
                                />

                                <line
                                  x1="0"
                                  y1={getY(60)}
                                  x2={width}
                                  y2={getY(60)}
                                  stroke="#E5E7EB"
                                  strokeWidth="1"
                                  strokeDasharray="4 6"
                                />

                                <line
                                  x1="0"
                                  y1={getY(0)}
                                  x2={width}
                                  y2={getY(0)}
                                  stroke="#E5E7EB"
                                  strokeWidth="1"
                                />

                                {/* CHANGE: Added subtle area underneath the trend line. */}
                                {trend.length > 1 && (
                                  <path
                                    d={areaPath}
                                    fill="#2563EB"
                                    fillOpacity="0.05"
                                  />
                                )}

                                {trend.length > 1 && (
                                  <path
                                    d={path}
                                    stroke="#2563EB"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    fill="none"
                                  />
                                )}

                                {trend.map(
                                  (t, i) => (
                                    <circle
                                      key={t.id}
                                      cx={getX(i)}
                                      cy={getY(
                                        t.health_score ??
                                          0
                                      )}
                                      r={
                                        isHovered(i)
                                          ? 6
                                          : 3.5
                                      }
                                      fill={
                                        statusDot[
                                          t.status
                                        ] ||
                                        "#2563EB"
                                      }
                                      stroke="white"
                                      strokeWidth="2"
                                    />
                                  )
                                )}
                              </svg>

                              {/* CHANGE: Added chart scale labels. */}
                              <div className="pointer-events-none absolute right-0 top-0 flex h-[280px] flex-col justify-between py-1 text-[10px] text-gray-400">
                                <span>100</span>
                                <span>80</span>
                                <span>60</span>
                                <span>0</span>
                              </div>
                            </div>

                            {/* CHANGE: Improved date axis. */}
                            <div className="mt-3 flex justify-between text-xs text-gray-400">
                              <span>
                                {formatFull(
                                  trend[0]
                                    .created_at
                                )}
                              </span>

                              <span>
                                {formatFull(
                                  trend[
                                    trend.length -
                                      1
                                  ].created_at
                                )}
                              </span>
                            </div>
                          </div>

                          {/* CHANGE: Added run summary below each chart. */}
                          {latest && (
                            <div className="grid grid-cols-1 border-t border-gray-100 sm:grid-cols-3">

                              <div className="px-6 py-5 sm:px-8">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                  Last run
                                </p>

                                <p className="mt-1 text-sm font-medium text-gray-900">
                                  {formatFull(
                                    latest.created_at
                                  )}
                                </p>
                              </div>

                              <div className="border-t border-gray-100 px-6 py-5 sm:border-l sm:border-t-0 sm:px-8">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                  Previous score
                                </p>

                                <p className="mt-1 text-sm font-medium text-gray-900">
                                  {previous?.health_score !==
                                  null &&
                                  previous?.health_score !==
                                    undefined
                                    ? `${previous.health_score}%`
                                    : "—"}
                                </p>
                              </div>

                              <div className="border-t border-gray-100 px-6 py-5 sm:border-l sm:border-t-0 sm:px-8">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                  Change
                                </p>

                                <p
                                  className={`mt-1 text-sm font-medium ${
                                    change !== null &&
                                    change > 0
                                      ? "text-green-600"
                                      : change !== null &&
                                        change < 0
                                      ? "text-red-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {change !== null
                                    ? `${
                                        change > 0
                                          ? "+"
                                          : ""
                                      }${change}%`
                                    : "—"}
                                </p>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
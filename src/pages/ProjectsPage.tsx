import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sidebar } from "../components/dashboard/Sidebar";
import {
  FolderKanban,
  ChevronRight,
  ChevronDown,
  Search,
  Layers3,
  Activity,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  CircleAlert,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface ModelSummary {
  model_id: number;
  name: string;
  project: string;
}

type Status = "Healthy" | "Warning" | "Critical";

interface ModelPerformance {
  model_id: number;
  project: string;
  name: string;
  health_score: number;
  metrics: Record<string, number>;
  status: Status;
  last_updated: string;
}

interface HealthTrend {
  date: string;
  health_score: number;
}

interface RecentReport {
  project: string;
  model: string;
  health_score: number;
  issues: number;
  timestamp: string;
}

/*
 * This is the actual response structure already used
 * by your Dashboard page.
 */
interface ModelDashboardData {
  summary: {
    overall_health_score: number | null;
    active_models: number;
    healthy_models: number;
    warning_models: number;
    critical_models: number;
  };

  health_trend: HealthTrend[];

  model_performance: ModelPerformance[];

  available_models: ModelSummary[];

  findings: {
    model: string;
    issue: string;
    severity: string;
    detected_at: string;
  }[];

  recommendations: {
    model: string;
    recommendation: string;
    severity: string;
  }[];

  recent_reports: RecentReport[];
}

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

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

export default function ProjectsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [models, setModels] = useState<ModelSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /*
   * Only one model is expanded at a time.
   */
  const [expandedModelId, setExpandedModelId] =
    useState<number | null>(null);

  /*
   * Real API data for the expanded model.
   */
  const [preview, setPreview] =
    useState<ModelDashboardData | null>(null);

  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  // ============================================================
  // GET ALL PROJECTS / MODELS
  // ============================================================

  useEffect(() => {
    if (!user) return;

    const fetchModels = async () => {
      try {
        setLoading(true);

        const token = await user.getIdToken();

        const res = await fetch(`${API_BASE}/api/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(
            `Failed to load projects: ${res.status}`
          );
        }

        const data: ModelDashboardData = await res.json();

        setModels(data.available_models ?? []);
      } catch (error) {
        console.error("Failed to load projects:", error);
        setModels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, [user]);

  // ============================================================
  // GROUP MODELS BY PROJECT
  // ============================================================

  const grouped = useMemo(() => {
    return models.reduce<Record<string, ModelSummary[]>>(
      (acc, model) => {
        const projectName = model.project || "Ungrouped";

        if (!acc[projectName]) {
          acc[projectName] = [];
        }

        acc[projectName].push(model);

        return acc;
      },
      {}
    );
  }, [models]);

  // ============================================================
  // SEARCH
  // ============================================================

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return Object.entries(grouped);
    }

    return Object.entries(grouped)
      .map(([projectName, projectModels]) => {
        const projectMatches = projectName
          .toLowerCase()
          .includes(query);

        const matchingModels = projectModels.filter((model) =>
          model.name.toLowerCase().includes(query)
        );

        if (projectMatches) {
          return [projectName, projectModels] as [
            string,
            ModelSummary[]
          ];
        }

        if (matchingModels.length > 0) {
          return [projectName, matchingModels] as [
            string,
            ModelSummary[]
          ];
        }

        return null;
      })
      .filter(
        (
          entry
        ): entry is [string, ModelSummary[]] => entry !== null
      );
  }, [grouped, search]);

  const projectCount = Object.keys(grouped).length;

  // ============================================================
  // REAL API CALL FOR ONE MODEL
  // ============================================================

  const fetchModelPreview = async (modelId: number) => {
    if (!user) return;

    try {
      setPreviewLoading(true);
      setPreviewError(false);
      setPreview(null);

      const token = await user.getIdToken();

      /*
       * IMPORTANT:
       *
       * This is the same endpoint your main Dashboard already
       * uses when a model is selected.
       *
       * GET /api/dashboard?model_id=3
       *
       * The response contains:
       * - summary
       * - health_trend
       * - model_performance
       * - recent_reports
       * - findings
       * - recommendations
       */
      const res = await fetch(
        `${API_BASE}/api/dashboard?model_id=${modelId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(
          `Failed to load model data: ${res.status}`
        );
      }

      const data: ModelDashboardData = await res.json();

      setPreview(data);
    } catch (error) {
      console.error(
        "Failed to load model preview:",
        error
      );

      setPreviewError(true);
    } finally {
      setPreviewLoading(false);
    }
  };

  // ============================================================
  // EXPAND / COLLAPSE
  // ============================================================

  const toggleModel = (modelId: number) => {
    /*
     * Clicking the same model closes it.
     */
    if (expandedModelId === modelId) {
      setExpandedModelId(null);
      setPreview(null);
      setPreviewError(false);
      return;
    }

    /*
     * Expand the new model immediately.
     */
    setExpandedModelId(modelId);

    /*
     * Then load the real API data.
     */
    fetchModelPreview(modelId);
  };

  // ============================================================
  // OPEN FULL DASHBOARD
  // ============================================================

  const openFullDashboard = (modelId: number) => {
    navigate(`/dashboard?model_id=${modelId}`);
  };

  // ============================================================
  // FORMAT SCORE
  // ============================================================

  const formatScore = (value: number | null | undefined) => {
    if (
      value === null ||
      value === undefined ||
      Number.isNaN(value)
    ) {
      return "—";
    }

    return value.toFixed(1);
  };

  // ============================================================
  // FORMAT METRIC
  // ============================================================

  const formatMetric = (
    value: number | null | undefined
  ) => {
    if (
      value === null ||
      value === undefined ||
      Number.isNaN(value)
    ) {
      return "—";
    }

    /*
     * Your backend may return either:
     * 0.94
     * or
     * 94
     *
     * Convert 0.94 -> 94%.
     */
    const percentage = value <= 1 ? value * 100 : value;

    return `${percentage.toFixed(1)}%`;
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  // const formatDate = (
  //   date: string | null | undefined
  // ) => {
  //   if (!date) return "—";

  //   const parsed = new Date(date);

  //   if (Number.isNaN(parsed.getTime())) {
  //     return "—";
  //   }

  //   return parsed.toLocaleDateString(undefined, {
  //     month: "short",
  //     day: "numeric",
  //     year: "numeric",
  //   });
  // };

  // ============================================================
  // FORMAT DATE + TIME
  // ============================================================

  const formatDateTime = (
    date: string | null | undefined
  ) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // ============================================================
  // GET SELECTED MODEL
  // ============================================================

  const selectedModelPerformance =
    preview?.model_performance?.find(
      (model) =>
        model.model_id === expandedModelId
    ) ?? preview?.model_performance?.[0] ?? null;

  // ============================================================
  // GRAPH DATA
  // ============================================================

  const chartData = useMemo(() => {
    if (!preview?.health_trend) {
      return [];
    }

    return preview.health_trend.map((point) => ({
      date: point.date,
      health_score: point.health_score,
    }));
  }, [preview]);

  return (
    <div className="flex min-h-screen bg-white">

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar
        userName={
          user?.displayName || "MLSentinel user"
        }
        userEmail={user?.email || ""}
        userPhotoUrl={
          user?.photoURL || undefined
        }
      />

      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="min-h-screen min-w-0 flex-1 bg-white text-gray-900">

        <div className="mx-auto w-full max-w-[1280px] px-6 py-10 sm:px-8 lg:px-12 lg:py-14">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="border-b border-gray-200 pb-8">

            <p className="text-sm font-medium text-blue-600">
              Overview
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
              Projects
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
              All the projects and models you're currently
              tracking.
            </p>

          </div>

          {/* ==================================================
              SUMMARY + SEARCH
          ================================================== */}

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            {!loading && models.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-500">

                <Layers3 className="h-3.5 w-3.5" />

                <span>
                  {projectCount}{" "}
                  {projectCount === 1
                    ? "project"
                    : "projects"}
                </span>

                <span className="text-gray-300">
                  ·
                </span>

                <span>
                  {models.length}{" "}
                  {models.length === 1
                    ? "model"
                    : "models"}
                </span>

              </div>
            )}

            {!loading && models.length > 0 && (
              <div className="relative w-full sm:w-[280px]">

                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search projects or models..."
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                />

              </div>
            )}

          </div>

          {/* ==================================================
              CONTENT
          ================================================== */}

          <section className="mt-5">

            {/* ==================================================
                LOADING
            ================================================== */}

            {loading && (
              <div className="rounded-xl border border-gray-200">

                <div className="px-6 py-16 text-center">

                  <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800" />

                  <p className="mt-3 text-sm text-gray-500">
                    Loading projects...
                  </p>

                </div>

              </div>
            )}

            {/* ==================================================
                EMPTY
            ================================================== */}

            {!loading && models.length === 0 && (
              <div className="rounded-xl border border-gray-200">

                <div className="flex flex-col items-center px-6 py-16 text-center">

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">

                    <FolderKanban className="h-5 w-5 text-gray-500" />

                  </div>

                  <p className="mt-4 text-sm font-medium text-gray-900">
                    No projects yet
                  </p>

                  <p className="mt-1 max-w-sm text-sm leading-5 text-gray-500">
                    Start by adding a model through onboarding.
                  </p>

                </div>

              </div>
            )}

            {/* ==================================================
                SEARCH EMPTY
            ================================================== */}

            {!loading &&
              models.length > 0 &&
              filteredGroups.length === 0 && (
                <div className="rounded-xl border border-gray-200">

                  <div className="px-6 py-14 text-center">

                    <Search className="mx-auto h-5 w-5 text-gray-400" />

                    <p className="mt-3 text-sm font-medium text-gray-900">
                      No matching projects
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Try a different project or model name.
                    </p>

                  </div>

                </div>
              )}

            {/* ==================================================
                PROJECT LIST
            ================================================== */}

            {!loading &&
              filteredGroups.length > 0 && (

                <div className="max-h-[650px] space-y-4 overflow-y-auto pr-1">

                  {filteredGroups.map(
                    ([projectName, projectModels]) => (

                      <div
                        key={projectName}
                        className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                      >

                        {/* ======================================
                            PROJECT HEADER
                        ====================================== */}

                        <div className="border-b border-gray-200 px-5 py-4 sm:px-6">

                          <div className="flex items-center justify-between gap-4">

                            <div className="min-w-0">

                              <p className="truncate text-sm font-medium text-gray-900">
                                {projectName}
                              </p>

                              <p className="mt-0.5 text-xs text-gray-500">
                                {projectModels.length}{" "}
                                {projectModels.length === 1
                                  ? "model"
                                  : "models"}
                              </p>

                            </div>

                            <FolderKanban className="h-4 w-4 shrink-0 text-gray-400" />

                          </div>

                        </div>

                        {/* ======================================
                            MODELS
                        ====================================== */}

                        <ul className="divide-y divide-gray-100">

                          {projectModels.map((model) => {

                            const isExpanded =
                              expandedModelId ===
                              model.model_id;

                            const modelData =
                              isExpanded
                                ? selectedModelPerformance
                                : null;

                            return (

                              <li
                                key={model.model_id}
                              >

                                {/* ==================================
                                    MODEL HEADER
                                ================================== */}

                                <div className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-gray-50 sm:px-6">

                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleModel(
                                        model.model_id
                                      )
                                    }
                                    className="min-w-0 flex-1 text-left"
                                  >

                                    <p className="truncate text-sm font-medium text-gray-900">
                                      {model.name}
                                    </p>

                                    <p className="mt-0.5 text-xs text-gray-400">
                                      Model ID{" "}
                                      {model.model_id}
                                    </p>

                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleModel(
                                        model.model_id
                                      )
                                    }
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-600"
                                    aria-label={
                                      isExpanded
                                        ? "Collapse model"
                                        : "Expand model"
                                    }
                                  >

                                    {isExpanded ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}

                                  </button>

                                </div>

                                {/* ==================================
                                    MINI DASHBOARD
                                ================================== */}

                                {isExpanded && (

                                  <div className="border-t border-gray-100 bg-gray-50/40 px-5 py-5 sm:px-6">

                                    {/* --------------------------------
                                        LOADING
                                    -------------------------------- */}

                                    {previewLoading && (

                                      <div className="flex items-center justify-center py-12">

                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800" />

                                        <span className="ml-3 text-xs text-gray-500">
                                          Loading model data...
                                        </span>

                                      </div>

                                    )}

                                    {/* --------------------------------
                                        ERROR
                                    -------------------------------- */}

                                    {!previewLoading &&
                                      previewError && (

                                        <div className="rounded-lg border border-gray-200 bg-white px-5 py-8 text-center">

                                          <CircleAlert className="mx-auto h-5 w-5 text-gray-400" />

                                          <p className="mt-3 text-sm font-medium text-gray-900">
                                            Unable to load model data
                                          </p>

                                          <p className="mt-1 text-xs text-gray-500">
                                            The model dashboard could
                                            not be loaded right now.
                                          </p>

                                          <div className="mt-4 flex justify-center gap-4">

                                            <button
                                              type="button"
                                              onClick={() =>
                                                fetchModelPreview(
                                                  model.model_id
                                                )
                                              }
                                              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900"
                                            >
                                              <RefreshCw className="h-3.5 w-3.5" />
                                              Retry
                                            </button>

                                            <button
                                              type="button"
                                              onClick={() =>
                                                openFullDashboard(
                                                  model.model_id
                                                )
                                              }
                                              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
                                            >
                                              View full dashboard
                                              <ExternalLink className="h-3.5 w-3.5" />
                                            </button>

                                          </div>

                                        </div>

                                      )}

                                    {/* --------------------------------
                                        REAL DATA
                                    -------------------------------- */}

                                    {!previewLoading &&
                                      !previewError &&
                                      preview &&
                                      modelData && (

                                        <>

                                          {/* ==============================
                                              METRICS
                                          ============================== */}

                                          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

                                            {/* Health */}

                                            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">

                                              <div className="flex items-center justify-between">

                                                <p className="text-xs text-gray-500">
                                                  Health score
                                                </p>

                                                <ShieldCheck className="h-3.5 w-3.5 text-gray-400" />

                                              </div>

                                              <p className="mt-2 text-xl font-semibold text-gray-900">
                                                {formatScore(
                                                  modelData.health_score
                                                )}
                                              </p>

                                            </div>

                                            {/* Accuracy */}

                                            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">

                                              <p className="text-xs text-gray-500">
                                                Accuracy
                                              </p>

                                              <p className="mt-2 text-xl font-semibold text-gray-900">
                                                {formatMetric(
                                                  modelData.metrics?.accuracy
                                                )}
                                              </p>

                                            </div>

                                            {/* F1 */}

                                            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">

                                              <p className="text-xs text-gray-500">
                                                F1 score
                                              </p>

                                              <p className="mt-2 text-xl font-semibold text-gray-900">
                                                {formatMetric(
                                                  modelData.metrics?.f1_score
                                                )}
                                              </p>

                                            </div>

                                            {/* Status */}

                                            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">

                                              <p className="text-xs text-gray-500">
                                                Status
                                              </p>

                                              <div className="mt-2">

                                                <span
                                                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass[modelData.status]}`}
                                                >

                                                  <span
                                                    className={`h-1.5 w-1.5 rounded-full ${statusDot[modelData.status]}`}
                                                  />

                                                  {modelData.status}

                                                </span>

                                              </div>

                                            </div>

                                          </div>

                                          {/* ==============================
                                              EXTRA METRICS
                                          ============================== */}

                                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">

                                            <span>
                                              Precision{" "}
                                              <strong className="font-medium text-gray-700">
                                                {formatMetric(
                                                  modelData.metrics?.precision
                                                )}
                                              </strong>
                                            </span>

                                            <span>
                                              Recall{" "}
                                              <strong className="font-medium text-gray-700">
                                                {formatMetric(
                                                  modelData.metrics?.recall
                                                )}
                                              </strong>
                                            </span>

                                            <span>
                                              Last updated{" "}
                                              <strong className="font-medium text-gray-700">
                                                {formatDateTime(
                                                  modelData.last_updated
                                                )}
                                              </strong>
                                            </span>

                                          </div>

                                          {/* ==============================
                                              HEALTH GRAPH
                                          ============================== */}

                                          <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">

                                            <div className="flex items-center justify-between">

                                              <div className="flex items-center gap-2">

                                                <Activity className="h-4 w-4 text-gray-400" />

                                                <div>
                                                  <p className="text-xs font-medium text-gray-700">
                                                    Health trend
                                                  </p>

                                                  <p className="mt-0.5 text-[11px] text-gray-400">
                                                    {preview.health_trend.length}{" "}
                                                    recorded{" "}
                                                    {preview.health_trend.length ===
                                                    1
                                                      ? "run"
                                                      : "runs"}
                                                  </p>
                                                </div>

                                              </div>

                                              <span className="text-xs text-gray-400">
                                                Health score
                                              </span>

                                            </div>

                                            {chartData.length > 0 ? (

                                              <div className="mt-3 h-[150px] w-full">

                                                <ResponsiveContainer
                                                  width="100%"
                                                  height="100%"
                                                >

                                                  <LineChart
                                                    data={chartData}
                                                    margin={{
                                                      top: 5,
                                                      right: 8,
                                                      bottom: 0,
                                                      left: 8,
                                                    }}
                                                  >

                                                    <XAxis
                                                      dataKey="date"
                                                      hide
                                                    />

                                                    <YAxis
                                                      hide
                                                      domain={[
                                                        "auto",
                                                        "auto",
                                                      ]}
                                                    />

                                                    <Tooltip
                                                      contentStyle={{
                                                        border:
                                                          "1px solid #e5e7eb",
                                                        borderRadius:
                                                          "8px",
                                                        backgroundColor:
                                                          "#ffffff",
                                                        fontSize:
                                                          "12px",
                                                        boxShadow:
                                                          "none",
                                                      }}
                                                      labelFormatter={(
                                                        label
                                                      ) =>
                                                        formatDateTime(
                                                          String(
                                                            label
                                                          )
                                                        )
                                                      }
                                                      formatter={(
                                                        value
                                                      ) => [
                                                        typeof value ===
                                                        "number"
                                                          ? `${value.toFixed(
                                                              1
                                                            )}%`
                                                          : value,
                                                        "Health score",
                                                      ]}
                                                    />

                                                    <Line
                                                      type="monotone"
                                                      dataKey="health_score"
                                                      stroke="#2563eb"
                                                      strokeWidth={2}
                                                      dot={false}
                                                      activeDot={{
                                                        r: 4,
                                                      }}
                                                      connectNulls
                                                    />

                                                  </LineChart>

                                                </ResponsiveContainer>

                                              </div>

                                            ) : (

                                              <div className="flex h-[150px] items-center justify-center">

                                                <div className="text-center">

                                                  <Activity className="mx-auto h-5 w-5 text-gray-300" />

                                                  <p className="mt-2 text-xs text-gray-400">
                                                    No health history yet
                                                  </p>

                                                </div>

                                              </div>

                                            )}

                                          </div>

                                          {/* ==============================
                                              LAST RUN
                                          ============================== */}

                                          {preview.recent_reports.length >
                                            0 && (

                                            <div className="mt-3 rounded-lg border border-gray-200 bg-white px-4 py-3">

                                              <p className="text-xs font-medium text-gray-700">
                                                Latest run
                                              </p>

                                              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">

                                                <div>

                                                  <p className="text-sm text-gray-900">
                                                    {formatDateTime(
                                                      preview
                                                        .recent_reports[0]
                                                        .timestamp
                                                    )}
                                                  </p>

                                                  <p className="mt-0.5 text-xs text-gray-500">
                                                    {
                                                      preview
                                                        .recent_reports[0]
                                                        .issues
                                                    }{" "}
                                                    {preview
                                                      .recent_reports[0]
                                                      .issues === 1
                                                      ? "issue"
                                                      : "issues"}{" "}
                                                    detected
                                                  </p>

                                                </div>

                                                <span className="text-sm font-medium text-gray-900">
                                                  {
                                                    preview
                                                      .recent_reports[0]
                                                      .health_score
                                                  }
                                                  %
                                                </span>

                                              </div>

                                            </div>

                                          )}

                                          {/* ==============================
                                              FOOTER
                                          ============================== */}

                                          <div className="mt-4 flex items-center justify-between">

                                            <button
                                              type="button"
                                              onClick={() =>
                                                fetchModelPreview(
                                                  model.model_id
                                                )
                                              }
                                              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition-colors hover:text-gray-800"
                                            >

                                              <RefreshCw className="h-3.5 w-3.5" />

                                              Refresh

                                            </button>

                                            <button
                                              type="button"
                                              onClick={() =>
                                                openFullDashboard(
                                                  model.model_id
                                                )
                                              }
                                              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
                                            >

                                              View full dashboard

                                              <ExternalLink className="h-3.5 w-3.5" />

                                            </button>

                                          </div>

                                        </>

                                      )}

                                  </div>

                                )}

                              </li>

                            );
                          })}

                        </ul>

                      </div>

                    )
                  )}

                </div>
              )}

          </section>

          {/* ==================================================
              FOOTNOTE
          ================================================== */}

          {!loading && models.length > 0 && (
            <p className="mt-5 text-xs leading-5 text-gray-400">
              Expand a model to see its latest health,
              performance metrics, and trend. Open the full
              dashboard for detailed monitoring.
            </p>
          )}

        </div>

      </main>

    </div>
  );
}
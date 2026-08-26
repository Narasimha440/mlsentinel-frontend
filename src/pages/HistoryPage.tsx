import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Sidebar } from "../components/dashboard/Sidebar";
import { History as HistoryIcon } from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";




interface ModelOption {
  model_id: number;
  name: string;
  project: string;
}

interface RunRow {
  id: number;
  metrics: Record<string, number>;
  health_score: number | null;
  created_at: string;
}



interface HoverState {
  metricKey: string;
  runId: number;
}


const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";






function formatMetricLabel(key: string): string {
  return key
    .split("_")
    .map((word) => {
      if (word.toLowerCase() === "f1") {
        return "F1";
      }

      return (
        word.charAt(0).toUpperCase() +
        word.slice(1)
      );
    })
    .join(" ");
}



function isPercentMetric(key: string): boolean {
  if (key === "health_score") {
    return true;
  }

  if (key.toLowerCase().includes("loss")) {
    return false;
  }

  return true;
}



function toGraphValue(
  key: string,
  rawValue: number
): number {
 
  if (key === "health_score") {
    return rawValue;
  }

 
  if (key.toLowerCase().includes("loss")) {
    return rawValue;
  }

 
  return rawValue * 100;
}



function formatGraphValue(
  key: string,
  rawValue: number
): string {
  const value = toGraphValue(
    key,
    rawValue
  );

  if (isPercentMetric(key)) {
    return `${value.toFixed(2)}%`;
  }

  return value.toFixed(4);
}



function formatFullDate(
  dateStr: string
): string {
  return new Date(dateStr).toLocaleString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
}



function formatShortDate(
  dateStr: string
): string {
  return new Date(dateStr).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
    }
  );
}




export default function HistoryPage() {
  const { user } = useAuth();

  const [models, setModels] =
    useState<ModelOption[]>([]);

  const [selectedModel, setSelectedModel] =
    useState<ModelOption | null>(null);

  const [runs, setRuns] =
    useState<RunRow[]>([]);

  const [loadingModels, setLoadingModels] =
    useState(true);

  const [loadingRuns, setLoadingRuns] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);


 
  const [hover, setHover] =
    useState<HoverState | null>(null);


 

  useEffect(() => {
    if (!user) return;

    const loadModels = async () => {
      setLoadingModels(true);
      setError(null);

      try {
        const token =
          await user.getIdToken();

        const res = await fetch(
          `${API_BASE}/api/dashboard`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error(
            `Request failed: ${res.status}`
          );
        }

        const data =
          await res.json();

        const options: ModelOption[] =
          data.available_models ?? [];

        setModels(options);

        if (options.length > 0) {
          setSelectedModel(
            options[0]
          );
        }

      } catch (error) {
        console.error(
          "Failed to load models:",
          error
        );

        setError(
          "Couldn't load your models. Please try again."
        );

        setModels([]);

      } finally {
        setLoadingModels(false);
      }
    };

    loadModels();
  }, [user]);


 

  useEffect(() => {
    if (!user || !selectedModel) {
      return;
    }

    const loadRuns = async () => {
      setLoadingRuns(true);
      setError(null);

     
      setHover(null);

      try {
        const token =
          await user.getIdToken();

        const res = await fetch(
          `${API_BASE}/api/history/${encodeURIComponent(
            selectedModel.project
          )}/${encodeURIComponent(
            selectedModel.name
          )}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error(
            `Request failed: ${res.status}`
          );
        }

        const data =
          await res.json();

       
        setRuns(
          [...(data.runs ?? [])].reverse()
        );

      } catch (error) {
        console.error(
          "Failed to load history:",
          error
        );

        setError(
          "Couldn't load run history for this model. Please try again."
        );

        setRuns([]);

      } finally {
        setLoadingRuns(false);
      }
    };

    loadRuns();
  }, [user, selectedModel]);


 

 
  const metricKeys = useMemo(() => {
    return Array.from(
      new Set(
        runs.flatMap((run) =>
          Object.keys(
            run.metrics ?? {}
          )
        )
      )
    );
  }, [runs]);


 

 
  const chronologicalRuns =
    useMemo(() => {
      return [...runs].reverse();
    }, [runs]);


 

 
  const getMetricValue = (
    run: RunRow,
    metricKey: string
  ): number | null => {

    if (
      metricKey ===
      "health_score"
    ) {
      return run.health_score;
    }

    const value =
      run.metrics?.[metricKey];

    if (
      value === undefined ||
      value === null
    ) {
      return null;
    }

    return value;
  };


 

 
  const handleMetricEnter = (
    metricKey: string,
    runId: number
  ) => {
    setHover({
      metricKey,
      runId,
    });
  };


 

 
  const graphPoints =
    useMemo(() => {

      if (!hover) {
        return [];
      }

      return chronologicalRuns
        .filter((run) => {
          const value =
            getMetricValue(
              run,
              hover.metricKey
            );

          return (
            value !== null &&
            value !== undefined
          );
        })
        .map((run) => {

          const rawValue =
            getMetricValue(
              run,
              hover.metricKey
            );

          if (rawValue === null) {
            return null;
          }

          return {
            runId: run.id,
            created_at:
              run.created_at,

           
            value: toGraphValue(
              hover.metricKey,
              rawValue
            ),

           
            rawValue,
          };
        })
        .filter(
          (
            point
          ): point is {
            runId: number;
            created_at: string;
            value: number;
            rawValue: number;
          } => point !== null
        );

    }, [
      hover,
      chronologicalRuns,
    ]);


 

 
  const currentValue =
    useMemo(() => {

      if (!hover) {
        return null;
      }

      const currentRun =
        runs.find(
          (run) =>
            run.id ===
            hover.runId
        );

      if (!currentRun) {
        return null;
      }

      return getMetricValue(
        currentRun,
        hover.metricKey
      );

    }, [hover, runs]);


 

 
  const GraphTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: any[];
  }) => {

    if (
      !active ||
      !payload ||
      payload.length === 0
    ) {
      return null;
    }

    const point =
      payload[0]?.payload;

    if (!point) {
      return null;
    }

    return (
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">

        <p className="text-[11px] font-medium text-gray-500">
          {formatFullDate(
            point.created_at
          )}
        </p>

        <p className="mt-1 text-sm font-semibold text-gray-900">
          {formatGraphValue(
            hover?.metricKey ?? "",
            point.rawValue
          )}
        </p>

      </div>
    );
  };


 

 
  const renderMetricGraph = () => {

    return (
      <div
        className={`
          overflow-hidden
          transition-all
          duration-300
          ease-out
          ${
            hover
              ? "max-h-[250px] opacity-100"
              : "max-h-0 opacity-0"
          }
        `}
      >

        {hover && (

          <div className="border-b border-gray-100 bg-white px-8 py-5">

            <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">

              {/* -----------------------------------------
                  GRAPH HEADER
              ----------------------------------------- */}

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-xs font-medium text-gray-500">
                    {formatMetricLabel(
                      hover.metricKey
                    )}
                  </p>

                  <p className="mt-1 text-2xl font-medium tracking-tight text-gray-900">

                    {currentValue !== null
                      ? formatGraphValue(
                          hover.metricKey,
                          currentValue
                        )
                      : "—"}

                  </p>

                </div>


                <div className="text-right">

                  <p className="text-xs text-gray-400">
                    Historical trend
                  </p>

                  <p className="mt-1 text-xs font-medium text-gray-500">
                    {graphPoints.length} runs
                  </p>

                </div>

              </div>


              {/* -----------------------------------------
                  GRAPH
              ----------------------------------------- */}

              {graphPoints.length < 2 ? (

                <div className="flex h-[110px] items-center justify-center">

                  <p className="text-xs text-gray-400">
                    Not enough history yet for a trend.
                  </p>

                </div>

              ) : (

                <div className="mt-2 h-[120px]">

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <LineChart
                      data={graphPoints}
                      margin={{
                        top: 8,
                        right: 12,
                        left: 0,
                        bottom: 0,
                      }}
                    >

                      <CartesianGrid
                        vertical={false}
                        stroke="#F3F4F6"
                      />


                      <XAxis
                        dataKey="created_at"
                        tickFormatter={
                          formatShortDate
                        }
                        tick={{
                          fontSize: 10,
                          fill: "#9CA3AF",
                        }}
                        axisLine={false}
                        tickLine={false}
                        minTickGap={35}
                      />


                      <YAxis
                        hide
                        domain={[
                          "auto",
                          "auto",
                        ]}
                      />


                      <Tooltip
                        content={
                          <GraphTooltip />
                        }
                      />


                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#2563EB"
                        strokeWidth={2}
                        dot={false}

                       
                        activeDot={{
                          r: 4,
                          strokeWidth: 2,
                          stroke: "#2563EB",
                          fill: "#FFFFFF",
                        }}

                       
                        animationDuration={350}
                        animationEasing="ease-out"

                        connectNulls
                      />

                    </LineChart>

                  </ResponsiveContainer>

                </div>

              )}

            </div>

          </div>

        )}

      </div>
    );
  };


 

  return (

    <div className="flex min-h-screen">

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <Sidebar
        userName={
          user?.displayName ||
          "MLSentinel user"
        }
        userEmail={
          user?.email || ""
        }
        userPhotoUrl={
          user?.photoURL ||
          undefined
        }
      />


      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="min-h-screen flex-1 bg-white text-gray-900">

        <div className="mx-auto max-w-[1280px] px-12 py-16 sm:px-16">


          {/* =================================================
              HEADER
          ================================================= */}

          <div className="flex flex-wrap items-end justify-between gap-6">

            <div>

              <p className="text-sm font-medium text-blue-600">
                Run log
              </p>

              <h1 className="mt-3 text-4xl font-medium tracking-tight text-gray-900 sm:text-5xl">
                History
              </h1>

              <p className="mt-4 text-base text-gray-600">
                Every report submitted for a model, in order.
              </p>

            </div>


            {/* =================================================
                MODEL SELECTOR
            ================================================= */}

            {!loadingModels &&
              models.length > 0 && (

                <select
                  aria-label="Select model"
                  value={
                    selectedModel
                      ? `${selectedModel.model_id}`
                      : ""
                  }

                  onChange={(e) => {

                    const model =
                      models.find(
                        (m) =>
                          String(
                            m.model_id
                          ) ===
                          e.target.value
                      );

                    if (model) {
                      setSelectedModel(
                        model
                      );
                    }

                  }}

                  className="
                    h-11
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    px-4
                    text-sm
                    font-medium
                    text-gray-700
                    focus:border-blue-600
                    focus:outline-none
                    focus:ring-4
                    focus:ring-blue-600/10
                  "
                >

                  {models.map(
                    (model) => (

                      <option
                        key={
                          model.model_id
                        }
                        value={
                          model.model_id
                        }
                      >
                        {model.project} /{" "}
                        {model.name}
                      </option>

                    )
                  )}

                </select>

              )}

          </div>


          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {error && (

            <div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">

              {error}

            </div>

          )}


          {/* =================================================
              HISTORY TABLE CONTAINER
          ================================================= */}

          <div
            className="
              mt-10
              overflow-hidden
              rounded-2xl
              border
              border-gray-200
            "
          >


            {/* =================================================
                LOADING MODELS
            ================================================= */}

            {loadingModels ? (

              <p className="px-8 py-16 text-center text-sm text-gray-500">
                Loading...
              </p>


            ) : models.length === 0 ? (

             

              <div className="flex flex-col items-center gap-3 px-8 py-24 text-center">

                <HistoryIcon className="h-8 w-8 text-gray-400" />

                <p className="text-base font-medium text-gray-900">
                  No models yet
                </p>

                <p className="text-sm text-gray-500">
                  Add a model and send a report to see its history here.
                </p>

              </div>


            ) : loadingRuns ? (

             

              <p className="px-8 py-16 text-center text-sm text-gray-500">
                Loading history...
              </p>


            ) : runs.length === 0 ? (

             

              <div className="flex flex-col items-center gap-3 px-8 py-24 text-center">

                <HistoryIcon className="h-8 w-8 text-gray-400" />

                <p className="text-base font-medium text-gray-900">
                  No runs yet
                </p>

                <p className="text-sm text-gray-500">
                  This model hasn't received any reports yet.
                </p>

              </div>


            ) : (

             

              <>

                {/* =================================================
                    🔵 NEW: HOVER GRAPH
                   
                    The graph is placed ABOVE the table.
                   
                    This fixes the old problem where the popup
                    covered the table values.
                ================================================= */}

                <div
                  onMouseLeave={() =>
                    setHover(null)
                  }
                >

                  {renderMetricGraph()}

                </div>


                {/* =================================================
                    🔵 CHANGED: SCROLLABLE TABLE
                   
                    max-h:
                    Limits table height.
                   
                    overflow-auto:
                    Adds vertical + horizontal scrollbar when needed.
                ================================================= */}

                <div
                  className="
                    max-h-[560px]
                    overflow-auto
                  "
                  onMouseLeave={() =>
                    setHover(null)
                  }
                >

                  <table className="w-full text-left text-sm">


                    {/* =================================================
                        🔵 CHANGED: STICKY HEADER
                    ================================================= */}

                    <thead className="sticky top-0 z-10">

                      <tr
                        className="
                          border-b
                          border-gray-100
                          bg-gray-50
                          text-xs
                          font-medium
                          uppercase
                          tracking-wide
                          text-gray-500
                        "
                      >

                        <th className="whitespace-nowrap px-8 py-5">
                          Date
                        </th>

                        <th className="whitespace-nowrap px-8 py-5">
                          Health Score
                        </th>


                        {metricKeys.map(
                          (key) => (

                            <th
                              key={key}
                              className="whitespace-nowrap px-8 py-5"
                            >
                              {formatMetricLabel(
                                key
                              )}
                            </th>

                          )
                        )}

                      </tr>

                    </thead>


                    {/* =================================================
                        TABLE BODY
                    ================================================= */}

                    <tbody>

                      {runs.map(
                        (run) => (

                          <tr
                            key={run.id}
                            className="
                              border-b
                              border-gray-100
                              last:border-b-0
                              transition-colors
                              duration-150
                              hover:bg-gray-50
                            "
                          >


                            {/* =========================================
                                DATE
                            ========================================= */}

                            <td className="whitespace-nowrap px-8 py-5 text-gray-600">

                              {new Date(
                                run.created_at
                              ).toLocaleString()}

                            </td>


                            {/* =========================================
                                HEALTH SCORE
                                🔵 NEW HOVER BEHAVIOR
                            ========================================= */}

                            <td
                              className={`
                                whitespace-nowrap
                                px-8
                                py-5
                                font-medium
                                text-gray-900
                                transition-colors
                                duration-150
                                ${
                                  hover?.runId ===
                                    run.id &&
                                  hover?.metricKey ===
                                    "health_score"
                                    ? "bg-blue-50 text-blue-700"
                                    : ""
                                }
                              `}

                              onMouseEnter={() =>
                                handleMetricEnter(
                                  "health_score",
                                  run.id
                                )
                              }
                            >

                              <span
                                className={`
                                  inline-flex
                                  rounded-md
                                  px-2
                                  py-1
                                  transition-colors
                                  duration-150
                                  ${
                                    hover?.runId ===
                                      run.id &&
                                    hover?.metricKey ===
                                      "health_score"
                                      ? "bg-blue-100"
                                      : ""
                                  }
                                `}
                              >

                                {run.health_score !==
                                null
                                  ? `${run.health_score}%`
                                  : "—"}

                              </span>

                            </td>


                            {/* =========================================
                                DYNAMIC METRICS
                            ========================================= */}

                            {metricKeys.map(
                              (key) => {

                                const value =
                                  run.metrics?.[
                                    key
                                  ];

                                const isHovered =
                                  hover?.runId ===
                                    run.id &&
                                  hover?.metricKey ===
                                    key;

                                return (

                                  <td
                                    key={key}

                                    className={`
                                      whitespace-nowrap
                                      px-8
                                      py-5
                                      text-gray-600
                                      transition-colors
                                      duration-150
                                      ${
                                        isHovered
                                          ? "bg-blue-50 text-blue-700"
                                          : ""
                                      }
                                    `}

                                   
                                    onMouseEnter={() =>
                                      handleMetricEnter(
                                        key,
                                        run.id
                                      )
                                    }
                                  >

                                    <span
                                      className={`
                                        inline-flex
                                        rounded-md
                                        px-2
                                        py-1
                                        transition-colors
                                        duration-150
                                        ${
                                          isHovered
                                            ? "bg-blue-100"
                                            : ""
                                        }
                                      `}
                                    >

                                      {value !==
                                        undefined &&
                                      value !==
                                        null
                                        ? value
                                        : "—"}

                                    </span>

                                  </td>

                                );
                              }
                            )}

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </>

            )}

          </div>

        </div>

      </main>

    </div>
  );
}
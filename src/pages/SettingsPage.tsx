import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Sidebar } from "../components/dashboard/Sidebar";
import { Check, Clock3 } from "lucide-react";

interface ModelSummary {
  model_id: number;
  name: string;
  project: string;
}

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const FREQUENCIES = [
  { value: "off", label: "Off" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export default function SettingsPage() {
  const { user } = useAuth();

  const [models, setModels] = useState<ModelSummary[]>([]);
  const [schedules, setSchedules] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savedId, setSavedID] = useState<number | null>(null);

  // ------------------------------------------------------------
  // Load models and their schedules
  // ------------------------------------------------------------
  useEffect(() => {
    if (!user) return;

    const loadSettings = async () => {
      try {
        setLoading(true);

        const token = await user.getIdToken();

        const dashRes = await fetch(`${API_BASE}/api/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const dashData = await dashRes.json();

        const modelList: ModelSummary[] =
          dashData.available_models ?? [];

        setModels(modelList);

        const scheduleEntries = await Promise.all(
          modelList.map(async (model) => {
            const res = await fetch(
              `${API_BASE}/api/settings/schedule/${model.model_id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const data = await res.json();

            return [model.model_id, data.frequency] as const;
          })
        );

        setSchedules(Object.fromEntries(scheduleEntries));
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  // ------------------------------------------------------------
  // Update schedule
  // ------------------------------------------------------------
  const handleChange = async (
    modelId: number,
    frequency: string
  ) => {
    if (!user) return;

    try {
      setSavingId(modelId);
      setSavedID(null);

      // Update UI immediately
      setSchedules((prev) => ({
        ...prev,
        [modelId]: frequency,
      }));

      const token = await user.getIdToken();

      await fetch(`${API_BASE}/api/settings/schedule`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model_id: modelId,
          frequency,
        }),
      });

      setSavingId(null);
      setSavedID(modelId);

      setTimeout(() => {
        setSavedID(null);
      }, 1500);
    } catch (error) {
      console.error("Failed to save schedule:", error);
      setSavingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* ======================================================
          SIDEBAR
      ====================================================== */}
      <Sidebar
        userName={user?.displayName || "MLSentinel user"}
        userEmail={user?.email || ""}
        userPhotoUrl={user?.photoURL || undefined}
      />

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}
      <main className="min-h-screen min-w-0 flex-1 bg-white text-gray-900">
        <div className="mx-auto w-full max-w-[1100px] px-6 py-10 sm:px-8 lg:px-12 lg:py-14">

          {/* ==================================================
              HEADER
          ================================================== */}
          <div className="border-b border-gray-200 pb-8">
            <p className="text-sm font-medium text-blue-600">
              Preferences
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
              Settings
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
              Configure how often MLSentinel checks your models
              for new trends and regressions.
            </p>
          </div>

          {/* ==================================================
              MONITORING SECTION
          ================================================== */}
          <section className="mt-8">

            {/* Section heading */}
            <div className="mb-3">
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-gray-500" />

                <h2 className="text-sm font-medium text-gray-900">
                  Monitoring
                </h2>
              </div>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Choose how often MLSentinel should re-check each
                model's history.
              </p>
            </div>

            {/* ==================================================
                MODEL LIST
            ================================================== */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

              {/* Loading */}
              {loading && (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800" />

                  <p className="mt-3 text-sm text-gray-500">
                    Loading settings...
                  </p>
                </div>
              )}

              {/* No models */}
              {!loading && models.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <p className="text-sm font-medium text-gray-900">
                    No models yet
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Models will appear here once they start sending
                    reports to MLSentinel.
                  </p>
                </div>
              )}

              {/* Models */}
              {!loading && models.length > 0 && (
                <div className="max-h-[430px] overflow-y-auto">
                  <ul className="divide-y divide-gray-100">

                    {models.map((model) => (
                      <li
                        key={model.model_id}
                        className="flex items-center justify-between gap-6 px-5 py-4 transition-colors hover:bg-gray-50/60 sm:px-6"
                      >

                        {/* Model information */}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {model.name}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-gray-500">
                            {model.project}
                          </p>
                        </div>

                        {/* Schedule control */}
                        <div className="flex shrink-0 items-center gap-3">

                          {/* Saved indicator */}
                          {savedId === model.model_id && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                              <Check className="h-3.5 w-3.5" />
                              Saved
                            </span>
                          )}

                          {/* Frequency */}
                          <select
                            value={
                              schedules[model.model_id] ?? "off"
                            }
                            onChange={(e) =>
                              handleChange(
                                model.model_id,
                                e.target.value
                              )
                            }
                            disabled={
                              savingId === model.model_id
                            }
                            className="h-9 min-w-[110px] rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition-colors hover:border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {FREQUENCIES.map((frequency) => (
                              <option
                                key={frequency.value}
                                value={frequency.value}
                              >
                                {frequency.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </li>
                    ))}

                  </ul>
                </div>
              )}
            </div>
          </section>

          {/* ==================================================
              INFORMATION
          ================================================== */}
          <section className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-900">
              About monitoring schedules
            </h3>

            <p className="mt-2 max-w-2xl text-xs leading-5 text-gray-500">
              This controls MLSentinel's own re-check schedule,
              not your model's evaluation runs. Evaluation results
              still need to be sent through the SDK, either manually
              or through a{" "}
              <a
                href="/dashboard/github/connect"
                className="font-medium text-blue-600 transition-colors hover:text-blue-700"
              >
                connected GitHub workflow
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
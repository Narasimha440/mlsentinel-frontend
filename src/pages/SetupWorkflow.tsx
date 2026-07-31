import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sidebar } from "../components/dashboard/Sidebar";
import { CheckCircle2, ExternalLink } from "lucide-react";

interface ModelOption {
  model_id: number;
  name: string;
  project: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const FREQUENCY_OPTIONS = [
  { label: "Daily (9am UTC)", cron: "0 9 * * *" },
  { label: "Weekly (Monday 9am UTC)", cron: "0 9 * * 1" },
  { label: "Monthly (1st, 9am UTC)", cron: "0 9 1 * *" },
];

export default function SetupWorkflow() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const owner = params.get("owner") || "";
  const repo = params.get("repo") || "";

  const [models, setModels] = useState<ModelOption[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [selectedCron, setSelectedCron] = useState<string>(FREQUENCY_OPTIONS[1].cron);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [commitUrl, setCommitUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchModels = async () => {
      const token = await user.getIdToken();
      const res = await fetch(`${API_BASE}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      const flatModels: ModelOption[] = data.model_performance.map((m: any) => ({
        model_id: m.model_id,
        name: m.name,
        project: m.project,
      }));

      setModels(flatModels);
      if (flatModels.length > 0) {
        setSelectedModelId(flatModels[0].model_id);
      }
      setLoading(false);
    };

    fetchModels();
  }, [user]);

  const handleSubmit = async () => {
    if (!user || !selectedModelId) return;
    setSubmitting(true);
    setError("");

    const token = await user.getIdToken();
    const res = await fetch(`${API_BASE}/api/github/setup-workflow`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model_id: selectedModelId,
        owner: owner,
        repo: repo,
        frequency_cron: selectedCron,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.detail || "Something went wrong");
      setSubmitting(false);
      return;
    }

    setCommitUrl(data.commit_url);
    setSubmitting(false);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        userName={user?.displayName || "MLSentinel user"}
        userEmail={user?.email || ""}
        userPhotoUrl={user?.photoURL || undefined}
      />

      <main className="min-h-screen flex-1 bg-white text-gray-900">
        <div className="mx-auto max-w-2xl px-12 py-16 sm:px-16">
          <p className="text-sm font-medium text-blue-600">Automation</p>
          <h1 className="mt-3 text-4xl font-medium tracking-tight text-gray-900">Set up workflow</h1>
          <p className="mt-4 text-base text-gray-600">
            Adding a scheduled workflow to <span className="font-medium text-gray-900">{owner}/{repo}</span>
          </p>

          {commitUrl && (
            <div className="mt-10 rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-green-600" />
              <p className="mt-4 text-base font-medium text-gray-900">Workflow added successfully</p>
              <p className="mt-2 text-sm text-gray-600">
                Remember to edit the workflow file to load your real model and compute actual metrics — right
                now it sends placeholder zeros until you fill that in.
              </p>
              <a
                href={commitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-black"
              >
                View file on GitHub
                <ExternalLink className="h-4 w-4" />
              </a>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Back to dashboard →
                </button>
              </div>
            </div>
          )}

          {!commitUrl && loading && (
            <p className="mt-10 text-sm text-gray-500">Loading your models...</p>
          )}

          {!commitUrl && !loading && models.length === 0 && (
            <p className="mt-10 text-sm text-gray-500">
              No models found yet — add one first before setting up automation.
            </p>
          )}

          {!commitUrl && !loading && models.length > 0 && (
            <div className="mt-10 space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-900">Which model is this for?</label>
                <select
                  value={selectedModelId ?? ""}
                  onChange={(e) => setSelectedModelId(Number(e.target.value))}
                  className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                >
                  {models.map((m) => (
                    <option key={m.model_id} value={m.model_id}>
                      {m.project} / {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900">How often should it run?</label>
                <select
                  value={selectedCron}
                  onChange={(e) => setSelectedCron(e.target.value)}
                  className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                >
                  {FREQUENCY_OPTIONS.map((f) => (
                    <option key={f.cron} value={f.cron}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="h-12 w-full rounded-xl bg-gray-900 text-sm font-medium text-white transition-colors hover:bg-black disabled:opacity-50"
              >
                {submitting ? "Adding workflow..." : "Add workflow to repository"}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
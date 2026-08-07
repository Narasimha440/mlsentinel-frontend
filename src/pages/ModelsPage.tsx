import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sidebar } from "../components/dashboard/Sidebar";
import { Boxes, ChevronRight } from "lucide-react";

interface ModelRow {
    id: number;
    name: string;
    project_id: number;
    project_name: string;
    health_score: number | null;
    status: "Healthy" | "Warning" | "Critical";
    schedule_frequency: string;
    last_run_at: string | null;
    created_at: string;
}


const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const statusClass: Record<string, string> = {
    Healthy: "border-green-200 bg-green-50 text-green-700",
    Warning: "border-amber-200 bg-amber-50 text-amber-700",
    Critical: "border-red-200 bg-red-50 text-red-600",
};

const statusDot: Record<string, string> = {
    Healthy: "bg-green-500",
    Warning: "bg-amber-500",
    Critical: "bg-red-500",
};


export default function ModelsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [models, setModels] = useState<ModelRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<"all" | "Healthy" | "Warning" | "Critical">("all");

    useEffect(() => {
        if (!user) return
        (async () => {
            const token = await user.getIdToken();
            const res = await fetch(`${API_BASE}/api/dashboard/models`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setModels(data.models);
            setLoading(false);
        })();
    }, [user]);

    const visibleModels = statusFilter === "all" ? models : models.filter((m) => m.status === statusFilter);

    const counts = {
        Healthy: models.filter((m) => m.status === "Healthy").length,
        Warning: models.filter((m) => m.status === "Warning").length,
        Critical: models.filter((m) => m.status === "Critical").length,
    };

    return (
    <div className="flex min-h-screen">
      <Sidebar
        userName={user?.displayName || "MLSentinel user"}
        userEmail={user?.email || ""}
        userPhotoUrl={user?.photoURL || undefined}
      />

      <main className="min-h-screen flex-1 bg-white text-gray-900">
        <div className="mx-auto max-w-[1280px] px-12 py-16 sm:px-16">
          <p className="text-sm font-medium text-blue-600">Overview</p>
          <h1 className="mt-3 text-4xl font-medium tracking-tight text-gray-900 sm:text-5xl">Models</h1>
          <p className="mt-4 text-base text-gray-600">Every model you're tracking, across all projects.</p>

          {!loading && models.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  statusFilter === "all" ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                All ({models.length})
              </button>
              {(["Healthy", "Warning", "Critical"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    statusFilter === s ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${statusDot[s]}`} />
                  {s} ({counts[s]})
                </button>
              ))}
            </div>
          )}

          <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200">
            {loading ? (
              <p className="px-8 py-16 text-center text-sm text-gray-500">Loading...</p>
            ) : visibleModels.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-8 py-24 text-center">
                <Boxes className="h-8 w-8 text-gray-400" />
                <p className="text-base font-medium text-gray-900">
                  {models.length === 0 ? "No models yet" : "No models match this filter"}
                </p>
                {models.length === 0 && (
                  <p className="text-sm text-gray-500">Add a model through onboarding to get started.</p>
                )}
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-medium uppercase tracking-wide text-gray-500">
                    <th className="px-8 py-5">Model</th>
                    <th className="px-8 py-5">Project</th>
                    <th className="px-8 py-5">Health score</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5">Schedule</th>
                    <th className="px-8 py-5"></th>
                  </tr>
                </thead>
                <tbody>
                  {visibleModels.map((m) => (
                    <tr key={m.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50">
                      <td className="px-8 py-6 text-base font-medium text-gray-900">{m.name}</td>
                      <td className="px-8 py-6 text-sm text-gray-600">{m.project_name}</td>
                      <td className="px-8 py-6 text-sm text-gray-900">
                        {m.health_score !== null ? `${m.health_score}%` : "—"}
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${statusClass[m.status]}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${statusDot[m.status]}`} />
                          {m.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm capitalize text-gray-600">{m.schedule_frequency}</td>
                      <td className="px-8 py-6 text-right">
                        <button
                          type="button"
                          onClick={() => navigate(`/dashboard?model_id=${m.id}`)}
                          className="inline-flex rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
                          aria-label={`Open ${m.name}`}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
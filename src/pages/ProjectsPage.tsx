import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sidebar } from "../components/dashboard/Sidebar";
import { FolderKanban, ChevronRight } from "lucide-react";

interface ModelSummary {
  model_id: number;
  name: string;
  project: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export default function ProjectsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [models, setModels] = useState<ModelSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const token = await user.getIdToken();
      const res = await fetch(`${API_BASE}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setModels(data.available_models);
      setLoading(false);
    })();
  }, [user]);

  const grouped = models.reduce<Record<string, ModelSummary[]>>((acc, m) => {
    const key = m.project || "Ungrouped";
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

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
          <h1 className="mt-3 text-4xl font-medium tracking-tight text-gray-900 sm:text-5xl">Projects</h1>
          <p className="mt-4 text-base text-gray-600">All the projects and models you're currently tracking.</p>

          {loading ? (
            <p className="mt-12 text-sm text-gray-500">Loading...</p>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="mt-12 flex flex-col items-center gap-3 rounded-2xl border border-gray-200 px-8 py-24 text-center">
              <FolderKanban className="h-8 w-8 text-gray-400" />
              <p className="text-base font-medium text-gray-900">No projects yet</p>
              <p className="text-sm text-gray-500">Start by adding a model through onboarding.</p>
            </div>
          ) : (
            <div className="mt-12 space-y-8">
              {Object.entries(grouped).map(([projectName, projectModels]) => (
                <div key={projectName} className="overflow-hidden rounded-2xl border border-gray-200">
                  <div className="border-b border-gray-100 bg-gray-50/50 px-8 py-5">
                    <p className="text-base font-medium text-gray-900">{projectName}</p>
                    <p className="text-sm text-gray-500">{projectModels.length} model{projectModels.length !== 1 ? "s" : ""}</p>
                  </div>
                  <ul>
                    {projectModels.map((m) => (
                      <li key={m.model_id} className="border-b border-gray-100 last:border-b-0">
                        <button
                          type="button"
                          onClick={() => navigate(`/dashboard?model_id=${m.model_id}`)}
                          className="flex w-full items-center justify-between px-8 py-5 text-left transition-colors hover:bg-gray-50"
                        >
                          <span className="text-base text-gray-900">{m.name}</span>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
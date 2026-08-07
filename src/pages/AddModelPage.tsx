import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sidebar } from "../components/dashboard/Sidebar";
import { Copy, Check, ArrowRight } from "lucide-react";

interface ProjectOption {
  project_id: number;
  name: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export default function AddModelPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [modelName, setModelName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [createdModelName, setCreatedModelName] = useState("");
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const token = await user.getIdToken();
      const res = await fetch(`${API_BASE}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const opts: ProjectOption[] = data.projects.map((p: any) => ({ project_id: p.project_id, name: p.name }));
      setProjects(opts);
      if (opts.length > 0) setSelectedProjectId(opts[0].project_id);
      setLoading(false);
    })();
  }, [user]);

  const handleSubmit = async () => {
    if (!user || !selectedProjectId || !modelName.trim()) return;
    setSubmitting(true);
    const token = await user.getIdToken();

    const modelRes = await fetch(`${API_BASE}/api/models/quick-add`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: selectedProjectId, name: modelName.trim() }),
    });
    const modelData = await modelRes.json();

    const keyRes = await fetch(`${API_BASE}/api/api-keys`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ label: "Getting started key" }),
    });
    const keyData = await keyRes.json();

    setApiKey(keyData.key);
    setCreatedModelName(modelData.name);
    setProjectName(projects.find((p) => p.project_id === selectedProjectId)?.name || "");
    setSubmitting(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeSnippet = `from mlsentinal import MLDoc

monitor = MLDoc("${apiKey}")

response = monitor.doc_report(
    project="${projectName}",
    model="${createdModelName}",
    metrics={
        "accuracy": 0.95,
        "precision": 0.94,
        "recall": 0.93,
        "f1_score": 0.94,
        "val_loss": 0.18,
    },
)
print(response)`;

  return (
    <div className="flex min-h-screen">
      <Sidebar
        userName={user?.displayName || "MLSentinel user"}
        userEmail={user?.email || ""}
        userPhotoUrl={user?.photoURL || undefined}
      />

      <main className="min-h-screen flex-1 bg-white text-gray-900">
        <div className="mx-auto max-w-2xl px-12 py-16 sm:px-16">
          <p className="text-sm font-medium text-blue-600">Setup</p>
          <h1 className="mt-3 text-4xl font-medium tracking-tight text-gray-900">Add a model</h1>

          {apiKey ? (
            <>
              <p className="mt-4 text-base text-gray-600">
                Copy this into your training script — your project, model, and API key are already filled in.
              </p>
              <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-900 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-400">Python</p>
                  <button
                    type="button"
                    onClick={() => handleCopy(codeSnippet)}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-300 hover:bg-white/10"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="mt-3 overflow-x-auto text-xs leading-relaxed text-gray-100">
                  <code>{codeSnippet}</code>
                </pre>
              </div>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="mt-6 h-12 w-full rounded-xl bg-gray-900 text-sm font-medium text-white hover:bg-black"
              >
                Back to dashboard
              </button>
            </>
          ) : loading ? (
            <p className="mt-10 text-sm text-gray-500">Loading your projects...</p>
          ) : (
            <div className="mt-10 space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-900">Project</label>
                <select
                  value={selectedProjectId ?? ""}
                  onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                  className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                >
                  {projects.map((p) => (
                    <option key={p.project_id} value={p.project_id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900">Model name</label>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="e.g. XGBoost-v3"
                  className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                />
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !modelName.trim()}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-medium text-white hover:bg-black disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Create model"}
                {!submitting && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
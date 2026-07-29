import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { ArrowRight, Copy, Check, Loader2, PartyPopper } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export default function CreateModel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("project_id");
  const projectName = searchParams.get("project_name") || "";

  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [modelCreated, setModelCreated] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [reportReceived, setReportReceived] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim() || !projectId) return;
    setSubmitting(true);
    setError("");

    const token = await user.getIdToken();

    // 1. create the model
    const modelRes = await fetch(`${API_BASE}/api/onboarding/model`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: Number(projectId), name: name.trim() }),
    });
    const modelData = await modelRes.json();
    if (!modelRes.ok) {
      setError(modelData.detail || "Something went wrong");
      setSubmitting(false);
      return;
    }

    // 2. generate an API key for them automatically, so the snippet is ready to copy-paste
    const keyRes = await fetch(`${API_BASE}/api/api-keys`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ label: "Getting started key" }),
    });
    const keyData = await keyRes.json();

    setApiKey(keyData.key);
    setModelCreated(true);
    setSubmitting(false);
  };

  // poll for the first real report, so the page auto-advances the moment their script runs
  useEffect(() => {
    if (!modelCreated || !user) return;

    const interval = setInterval(async () => {
      const token = await user.getIdToken();
      const res = await fetch(`${API_BASE}/api/onboarding/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const status = await res.json();
      if (status.step === "complete") {
        setReportReceived(true);
        clearInterval(interval);
        setTimeout(() => navigate("/dashboard"), 1800);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [modelCreated, user, navigate]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeSnippet = `from mlsentinal import MLDoc

monitor = MLDoc("${apiKey}")

response = monitor.doc_report(
    project="${projectName}",
    model="${name}",
    metrics={
        "accuracy": 0.95,
        "precision": 0.94,
        "recall": 0.93,
        "f1_score": 0.94,
        "val_loss": 0.18,
    },
)

print(response)`;

  if (!modelCreated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <p className="text-sm font-medium text-blue-600">Step 3 of 3</p>
          <h1 className="mt-3 text-3xl font-medium tracking-tight text-gray-900">Add your first model</h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            Give your model a name — this is just a label. You'll connect it to real metrics in the next step
            using our Python SDK, no file upload needed.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ResNet50, XGBoost-v2"
              autoFocus
              className="h-14 w-full rounded-2xl border border-gray-200 px-4 text-sm focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 text-sm font-medium text-white transition-colors hover:bg-black disabled:opacity-50"
            >
              {submitting ? "Setting up..." : "Continue"}
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        {reportReceived ? (
          <div className="text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-50">
              <PartyPopper className="h-7 w-7 text-green-600" />
            </div>
            <h1 className="mt-5 text-3xl font-medium tracking-tight text-gray-900">First report received!</h1>
            <p className="mt-3 text-sm text-gray-600">Taking you to your dashboard...</p>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-blue-600">Almost there</p>
            <h1 className="mt-3 text-3xl font-medium tracking-tight text-gray-900">Connect "{name}" to real data</h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Copy this snippet into your training script (right after you compute your metrics) and run it once.
              We've already filled in your API key, project, and model name — nothing else to configure.
            </p>

            <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-900 p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-400">Python</p>
                <button
                  type="button"
                  onClick={() => handleCopy(codeSnippet)}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-white/10"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="mt-3 overflow-x-auto text-xs leading-relaxed text-gray-100">
                <code>{codeSnippet}</code>
              </pre>
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
              <Loader2 className="h-5 w-5 shrink-0 animate-spin text-blue-600" />
              <p className="text-sm text-blue-800">
                Waiting for your first report — run the script above and this page will update automatically.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="mt-6 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
            >
              Skip for now, I'll do this later →
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
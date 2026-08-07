import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Copy, ArrowRight, ArrowLeft } from "lucide-react";
import { SPRING } from "../../lib/motion";
import { GithubIcon } from "../icons/GithubIcon";

interface ProjectOption {
  project_id: number;
  name: string;
}

interface AddModelModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  user: any;
  apiBase: string;
}

type Framework = "generic" | "sklearn" | "tensorflow" | "pytorch" | "xgboost" | "lightgbm";
type Workflow = "manual" | "github_actions";

const FRAMEWORKS: { id: Framework; label: string }[] = [
  { id: "generic", label: "Generic Python" },
  { id: "sklearn", label: "Scikit-learn" },
  { id: "tensorflow", label: "TensorFlow" },
  { id: "pytorch", label: "PyTorch" },
  { id: "xgboost", label: "XGBoost" },
  { id: "lightgbm", label: "LightGBM" },
];

function buildMetricsBlock(framework: Framework): string {
  switch (framework) {
    case "sklearn":
      return `from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

# Replace y_test, y_pred with your actual evaluation data
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)

metrics = {
    "accuracy": accuracy,
    "precision": precision,
    "recall": recall,
    "f1_score": f1,
}`;
    case "tensorflow":
      return `# 'history' is the object returned by model.fit(...)
metrics = {
    "accuracy": history.history["val_accuracy"][-1],
    "val_loss": history.history["val_loss"][-1],
}
# Add precision/recall/f1_score if you track them via
# tf.keras.metrics.Precision() / Recall() during training`;
    case "pytorch":
      return `# Replace these with the metrics your evaluation loop computes
metrics = {
    "accuracy": accuracy,
    "precision": precision,
    "recall": recall,
    "f1_score": f1_score,
    "val_loss": val_loss,
}`;
    case "xgboost":
      return `from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

# 'model' is your trained xgboost.XGBClassifier / Booster
y_pred = model.predict(X_test)

metrics = {
    "accuracy": accuracy_score(y_test, y_pred),
    "precision": precision_score(y_test, y_pred),
    "recall": recall_score(y_test, y_pred),
    "f1_score": f1_score(y_test, y_pred),
}`;
    case "lightgbm":
      return `from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

# 'model' is your trained lightgbm.Booster / LGBMClassifier
y_pred = model.predict(X_test)

metrics = {
    "accuracy": accuracy_score(y_test, y_pred),
    "precision": precision_score(y_test, y_pred),
    "recall": recall_score(y_test, y_pred),
    "f1_score": f1_score(y_test, y_pred),
}`;
    default:
      return `# Replace with metrics from your own training/evaluation pipeline
metrics = model_metrics  # e.g. a dict you already compute yourself`;
  }
}

function buildSnippet(apiKey: string, project: string, model: string, framework: Framework): string {
  const metricsBlock = buildMetricsBlock(framework);
  return `from mlsentinal import MLDoc

monitor = MLDoc("${apiKey}")

${metricsBlock}

response = monitor.doc_report(
    project="${project}",
    model="${model}",
    metrics=metrics,
)
print(response)`;
}

export function AddModelModal({ open, onClose, onCreated, user, apiBase }: AddModelModalProps) {
  const [step, setStep] = useState(1);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [modelName, setModelName] = useState("");
  const [framework, setFramework] = useState<Framework>("generic");
  const [workflow, setWorkflow] = useState<Workflow>("manual");
  const [submitting, setSubmitting] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const loadProjects = async () => {
    if (!user) return;
    setLoadingProjects(true);
    const token = await user.getIdToken();
    const res = await fetch(`${apiBase}/api/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const opts = data.projects.map((p: any) => ({ project_id: p.project_id, name: p.name }));
    setProjects(opts);
    if (opts.length > 0) setProjectId(opts[0].project_id);
    setLoadingProjects(false);
  };

  useEffect(() => {
    if (!open) return;

    setStep(1);
    setApiKey(null);
    setModelName("");
    setFramework("generic");
    setWorkflow("manual");

    loadProjects();
  }, [open])

  const handleClose = () => {
    onClose();
    if (apiKey) onCreated();
  };

  const handleGenerate = async () => {
    if (!user || !projectId || !modelName.trim()) return;
    setSubmitting(true);
    const token = await user.getIdToken();

    await fetch(`${apiBase}/api/models/quick-add`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: projectId, name: modelName.trim() }),
    });

    const keyRes = await fetch(`${apiBase}/api/api-keys`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ label: "Getting started key" }),
    });
    const keyData = await keyRes.json();

    setApiKey(keyData.key);
    setSubmitting(false);
    setStep(4);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedProjectName = projects.find((p) => p.project_id === projectId)?.name || "";
  const snippet = apiKey ? buildSnippet(apiKey, selectedProjectName, modelName, framework) : "";

  // trigger project load the first time the modal opens
  if (open && projects.length === 0 && !loadingProjects && step === 1) {
    loadProjects();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ ...SPRING, duration: 0.3 }}
            className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="absolute right-5 top-5 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <X className="h-4 w-4" />
            </button>

            {step < 4 && (
              <div className="mb-6 flex items-center gap-1.5">
                {[1, 2, 3].map((s) => (
                  <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? "bg-gray-900" : "bg-gray-100"}`} />
                ))}
              </div>
            )}

            {/* Step 1 — Project info */}
            {step === 1 && (
              <>
                <p className="text-sm font-medium text-blue-600">Step 1 of 3</p>
                <h2 className="mt-2 text-xl font-medium text-gray-900">Project information</h2>
                <p className="mt-2 text-sm text-gray-600">Which project does this model belong to?</p>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-900">Project</label>
                    {loadingProjects ? (
                      <p className="mt-2 text-sm text-gray-500">Loading projects...</p>
                    ) : (
                      <select
                        value={projectId ?? ""}
                        onChange={(e) => setProjectId(Number(e.target.value))}
                        className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                      >
                        {projects.map((p) => (
                          <option key={p.project_id} value={p.project_id}>{p.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-900">Model name</label>
                    <input
                      type="text"
                      value={modelName}
                      onChange={(e) => setModelName(e.target.value)}
                      placeholder="e.g. XGBoost-v3"
                      autoFocus
                      className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!projectId || !modelName.trim()}
                  className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-medium text-white hover:bg-black disabled:opacity-50"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Step 2 — Framework */}
            {step === 2 && (
              <>
                <p className="text-sm font-medium text-blue-600">Step 2 of 3</p>
                <h2 className="mt-2 text-xl font-medium text-gray-900">Choose your framework</h2>
                <p className="mt-2 text-sm text-gray-600">This shapes the generated integration code.</p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {FRAMEWORKS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFramework(f.id)}
                      className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                        framework === f.id
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="mt-7 flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-medium text-white hover:bg-black"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}

            {/* Step 3 — Workflow */}
            {step === 3 && (
              <>
                <p className="text-sm font-medium text-blue-600">Step 3 of 3</p>
                <h2 className="mt-2 text-xl font-medium text-gray-900">Choose your workflow</h2>
                <p className="mt-2 text-sm text-gray-600">How will this integration run?</p>

                <div className="mt-6 space-y-3">
                  <button
                    type="button"
                    onClick={() => setWorkflow("manual")}
                    className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                      workflow === "manual" ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${workflow === "manual" ? "border-gray-900" : "border-gray-300"}`}>
                      {workflow === "manual" && <div className="h-2.5 w-2.5 rounded-full bg-gray-900" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Manual integration</p>
                      <p className="mt-1 text-sm text-gray-500">Paste the generated SDK code into your training script.</p>
                    </div>
                  </button>

                  <div className="flex w-full items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4 text-left opacity-60">
                    <div className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 border-gray-300" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <GithubIcon className="h-4 w-4 text-gray-500" />
                        <p className="text-sm font-medium text-gray-700">GitHub Actions</p>
                        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-600">
                          Coming soon
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">Automatically send reports after every GitHub Actions training workflow.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-7 flex gap-3">
                  <button type="button" onClick={() => setStep(2)} className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={submitting}
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-medium text-white hover:bg-black disabled:opacity-50"
                  >
                    {submitting ? "Generating..." : "Generate integration"}
                  </button>
                </div>
              </>
            )}

            {/* Step 4 — Result */}
            {step === 4 && apiKey && (
              <>
                <h2 className="text-xl font-medium text-gray-900">Integration ready</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Paste this into your training script — your metrics come from your own pipeline.
                </p>

                <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-900 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-400">Python · {FRAMEWORKS.find((f) => f.id === framework)?.label}</p>
                    <button
                      type="button"
                      onClick={() => handleCopy(snippet)}
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-300 hover:bg-white/10"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-relaxed text-gray-100">
                    <code>{snippet}</code>
                  </pre>
                </div>

                <button type="button" onClick={handleClose} className="mt-6 h-12 w-full rounded-xl bg-gray-900 text-sm font-medium text-white hover:bg-black">
                  Done
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  Copy,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { SPRING } from "../../lib/motion";
import { GithubIcon } from "../../components/icons/GithubIcon";

interface ProjectOption {
  project_id: number;
  name: string;
}

interface Repo {
  full_name: string;
  name: string;
  owner: string;
}

interface AddModelModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  user: any;
  apiBase: string;
}

type Framework =
  | "generic"
  | "sklearn"
  | "tensorflow"
  | "pytorch"
  | "xgboost"
  | "lightgbm";

type Workflow = "manual" | "github_actions";

const FRAMEWORKS: {
  id: Framework;
  label: string;
}[] = [
  { id: "generic", label: "Generic Python" },
  { id: "sklearn", label: "Scikit-learn" },
  { id: "tensorflow", label: "TensorFlow" },
  { id: "pytorch", label: "PyTorch" },
  { id: "xgboost", label: "XGBoost" },
  { id: "lightgbm", label: "LightGBM" },
];

const FREQUENCY_OPTIONS = [
  {
    label: "Daily (9am UTC)",
    cron: "0 9 * * *",
  },
  {
    label: "Weekly (Monday 9am UTC)",
    cron: "0 9 * * 1",
  },
  {
    label: "Monthly (1st, 9am UTC)",
    cron: "0 9 1 * *",
  },
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
}`;

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

# 'model' is your trained XGBoost model
y_pred = model.predict(X_test)

metrics = {
    "accuracy": accuracy_score(y_test, y_pred),
    "precision": precision_score(y_test, y_pred),
    "recall": recall_score(y_test, y_pred),
    "f1_score": f1_score(y_test, y_pred),
}`;

    case "lightgbm":
      return `from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

# 'model' is your trained LightGBM model
y_pred = model.predict(X_test)

metrics = {
    "accuracy": accuracy_score(y_test, y_pred),
    "precision": precision_score(y_test, y_pred),
    "recall": recall_score(y_test, y_pred),
    "f1_score": f1_score(y_test, y_pred),
}`;

    default:
      return `# Replace with metrics from your own training/evaluation pipeline
metrics = model_metrics`;
  }
}

function buildSnippet(
  apiKey: string,
  project: string,
  model: string,
  framework: Framework
): string {
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

export function AddModelModal({
  open,
  onClose,
  onCreated,
  user,
  apiBase,
}: AddModelModalProps) {
  const [step, setStep] = useState(1);

  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [projectId, setProjectId] =
    useState<number | null>(null);

  const [modelName, setModelName] = useState("");

  const [framework, setFramework] =
    useState<Framework>("generic");

 
  const [workflow, setWorkflow] =
    useState<Workflow>("manual");

 
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] =
    useState<Repo | null>(null);

 
  const [selectedCron, setSelectedCron] =
    useState(FREQUENCY_OPTIONS[1].cron);

  const [submitting, setSubmitting] =
    useState(false);

  const [apiKey, setApiKey] =
    useState<string | null>(null);

  const [copied, setCopied] =
    useState(false);

  const [loadingProjects, setLoadingProjects] =
    useState(false);

 
  const [loadingRepos, setLoadingRepos] =
    useState(false);

 
  const [githubError, setGithubError] =
    useState("");

  const [error, setError] = useState("");

  
  
  

  const loadProjects = async () => {
    if (!user) return;

    try {
      setLoadingProjects(true);

      const token = await user.getIdToken();

      const res = await fetch(
        `${apiBase}/api/projects`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(
          `Failed to load projects: ${res.status}`
        );
      }

      const data = await res.json();

      const opts: ProjectOption[] =
        data.projects.map((p: any) => ({
          project_id: p.project_id,
          name: p.name,
        }));

      setProjects(opts);

      if (opts.length > 0) {
        setProjectId(opts[0].project_id);
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
      setError("Unable to load projects.");
    } finally {
      setLoadingProjects(false);
    }
  };

  
  
  

  const loadGithubRepos = async () => {
    if (!user) return;

    try {
      setLoadingRepos(true);
      setGithubError("");

      const token = await user.getIdToken();

      const res = await fetch(
        `${apiBase}/api/github/repos`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const data = await res.json();

        setGithubError(
          data.detail ||
            "Failed to load repositories."
        );

        setRepos([]);
        return;
      }

      const data = await res.json();

      setRepos(data.repos || []);

     
      if (data.repos?.length > 0) {
        setSelectedRepo(data.repos[0]);
      }
    } catch (err) {
      console.error(
        "Failed to load GitHub repositories:",
        err
      );

      setGithubError(
        "Unable to connect to GitHub right now."
      );
    } finally {
      setLoadingRepos(false);
    }
  };

  
  
  

  const openModal = () => {
    setStep(1);

    setApiKey(null);
    setModelName("");

    setFramework("generic");

    setWorkflow("manual");

    setRepos([]);
    setSelectedRepo(null);

    setSelectedCron(
      FREQUENCY_OPTIONS[1].cron
    );

    setError("");
    setGithubError("");

    loadProjects();
  };

  const handleClose = () => {
    onClose();

    if (apiKey) {
      onCreated();
    }
  };

  
  
  

  const handleGenerate = async () => {
    if (
      !user ||
      !projectId ||
      !modelName.trim()
    ) {
      return;
    }

   
    if (
      workflow === "github_actions" &&
      !selectedRepo
    ) {
      setGithubError(
        "Please select a GitHub repository."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setGithubError("");

      const token = await user.getIdToken();

      
      
      

      const modelRes = await fetch(
        `${apiBase}/api/models/quick-add`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            project_id: projectId,
            name: modelName.trim(),
          }),
        }
      );

      if (!modelRes.ok) {
        const data = await modelRes.json();

        throw new Error(
          data.detail ||
            "Failed to create model."
        );
      }

      const modelData = await modelRes.json();

     
      const createdModelId =
        modelData.model_id ??
        modelData.id ??
        modelData.model?.model_id ??
        modelData.model?.id;

      if (!createdModelId) {
        throw new Error(
          "Model was created but no model ID was returned."
        );
      }

      
      
      

      const keyRes = await fetch(
        `${apiBase}/api/api-keys`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            label:
              workflow === "github_actions"
                ? "GitHub Actions"
                : "Getting started key",
          }),
        }
      );

      const keyData = await keyRes.json();

      if (!keyRes.ok) {
        throw new Error(
          keyData.detail ||
            "Failed to create API key."
        );
      }

      setApiKey(keyData.key);

      
      
      

      if (
        workflow === "github_actions" &&
        selectedRepo
      ) {
        const workflowRes = await fetch(
          `${apiBase}/api/github/setup-workflow`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model_id: createdModelId,

              owner: selectedRepo.owner,

              repo: selectedRepo.name,

              frequency_cron: selectedCron,
            }),
          }
        );

        const workflowData =
          await workflowRes.json();

        if (!workflowRes.ok) {
          throw new Error(
            workflowData.detail ||
              "Failed to set up GitHub workflow."
          );
        }

       
        if (workflowData.commit_url) {
          setGithubCommitUrl(
            workflowData.commit_url
          );
        }
      }

     
      setSubmitting(false);
      setStep(4);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );

      setSubmitting(false);
    }
  };

  
  
  

  const [githubCommitUrl, setGithubCommitUrl] =
    useState<string | null>(null);

  
  
  

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);

    setCopied(true);

    setTimeout(
      () => setCopied(false),
      2000
    );
  };

  const selectedProjectName =
    projects.find(
      (p) => p.project_id === projectId
    )?.name || "";

  const snippet = apiKey
    ? buildSnippet(
        apiKey,
        selectedProjectName,
        modelName,
        framework
      )
    : "";

 
  if (
    open &&
    projects.length === 0 &&
    !loadingProjects &&
    step === 1
  ) {
    openModal();
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
            initial={{
              opacity: 0,
              y: 12,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 12,
              scale: 0.98,
            }}
            transition={{
              ...SPRING,
              duration: 0.3,
            }}
            className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-8"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* CLOSE */}

            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="absolute right-5 top-5 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <X className="h-4 w-4" />
            </button>

            {/* PROGRESS */}

            {step < 4 && (
              <div className="mb-6 flex items-center gap-1.5">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1 flex-1 rounded-full ${
                      s <= step
                        ? "bg-gray-900"
                        : "bg-gray-100"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* ==================================================
                STEP 1
            ================================================== */}

            {step === 1 && (
              <>
                <p className="text-sm font-medium text-blue-600">
                  Step 1 of 3
                </p>

                <h2 className="mt-2 text-xl font-medium text-gray-900">
                  Project information
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  Which project does this model
                  belong to?
                </p>

                <div className="mt-6 space-y-4">

                  {/* PROJECT */}

                  <div>
                    <label className="text-sm font-medium text-gray-900">
                      Project
                    </label>

                    {loadingProjects ? (
                      <p className="mt-2 text-sm text-gray-500">
                        Loading projects...
                      </p>
                    ) : (
                      <select
                        value={
                          projectId ?? ""
                        }
                        onChange={(e) =>
                          setProjectId(
                            Number(
                              e.target.value
                            )
                          )
                        }
                        className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                      >
                        {projects.map((p) => (
                          <option
                            key={
                              p.project_id
                            }
                            value={
                              p.project_id
                            }
                          >
                            {p.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* MODEL */}

                  <div>
                    <label className="text-sm font-medium text-gray-900">
                      Model name
                    </label>

                    <input
                      type="text"
                      value={modelName}
                      onChange={(e) =>
                        setModelName(
                          e.target.value
                        )
                      }
                      placeholder="e.g. XGBoost-v3"
                      autoFocus
                      className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                    />
                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setStep(2)
                  }
                  disabled={
                    !projectId ||
                    !modelName.trim()
                  }
                  className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-medium text-white hover:bg-black disabled:opacity-50"
                >
                  Continue

                  <ArrowRight className="h-4 w-4" />
                </button>
              </>
            )}

            {/* ==================================================
                STEP 2
            ================================================== */}

            {step === 2 && (
              <>
                <p className="text-sm font-medium text-blue-600">
                  Step 2 of 3
                </p>

                <h2 className="mt-2 text-xl font-medium text-gray-900">
                  Choose your framework
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  This shapes the generated
                  integration code.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {FRAMEWORKS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() =>
                        setFramework(
                          f.id
                        )
                      }
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

                  <button
                    type="button"
                    onClick={() =>
                      setStep(1)
                    }
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setStep(3)
                    }
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-medium text-white hover:bg-black"
                  >
                    Continue

                    <ArrowRight className="h-4 w-4" />
                  </button>

                </div>
              </>
            )}

            {/* ==================================================
                STEP 3
            ================================================== */}

            {step === 3 && (
              <>
                <p className="text-sm font-medium text-blue-600">
                  Step 3 of 3
                </p>

                <h2 className="mt-2 text-xl font-medium text-gray-900">
                  Choose your workflow
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  Choose how MLSentinel should
                  receive your model reports.
                </p>

                <div className="mt-6 space-y-3">

                  {/* MANUAL */}

                  <button
                    type="button"
                    onClick={() =>
                      setWorkflow(
                        "manual"
                      )
                    }
                    className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                      workflow === "manual"
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
                        workflow === "manual"
                          ? "border-gray-900"
                          : "border-gray-300"
                      }`}
                    >
                      {workflow ===
                        "manual" && (
                        <div className="h-2.5 w-2.5 rounded-full bg-gray-900" />
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Manual integration
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Paste the generated SDK
                        code into your training
                        script.
                      </p>
                    </div>
                  </button>

                  {/* GITHUB ACTIONS */}

                  <button
                    type="button"
                    onClick={() => {
                      setWorkflow(
                        "github_actions"
                      );

                     
                      if (
                        repos.length === 0
                      ) {
                        loadGithubRepos();
                      }
                    }}
                    className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                      workflow ===
                      "github_actions"
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
                        workflow ===
                        "github_actions"
                          ? "border-gray-900"
                          : "border-gray-300"
                      }`}
                    >
                      {workflow ===
                        "github_actions" && (
                        <div className="h-2.5 w-2.5 rounded-full bg-gray-900" />
                      )}
                    </div>

                    <div className="flex-1">

                      <div className="flex items-center gap-2">

                        <GithubIcon className="h-4 w-4 text-gray-600" />

                        <p className="text-sm font-medium text-gray-900">
                          GitHub Actions
                        </p>

                      </div>

                      <p className="mt-1 text-sm text-gray-500">
                        Automatically run
                        MLSentinel monitoring
                        from your GitHub repository.
                      </p>

                    </div>
                  </button>

                </div>

                {/* ==================================================
                    GITHUB SETTINGS
                ================================================== */}

                {workflow ===
                  "github_actions" && (
                  <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50/50 p-4">

                    {/* REPOSITORY */}

                    <div>

                      <div className="flex items-center justify-between">

                        <label className="text-sm font-medium text-gray-900">
                          Repository
                        </label>

                        <button
                          type="button"
                          onClick={
                            loadGithubRepos
                          }
                          disabled={
                            loadingRepos
                          }
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 disabled:opacity-50"
                        >
                          <RefreshCw
                            className={`h-3.5 w-3.5 ${
                              loadingRepos
                                ? "animate-spin"
                                : ""
                            }`}
                          />

                          Refresh
                        </button>

                      </div>

                      {loadingRepos ? (
                        <p className="mt-3 text-sm text-gray-500">
                          Loading GitHub repositories...
                        </p>
                      ) : githubError ? (
                        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">

                          <p className="text-sm text-red-600">
                            {githubError}
                          </p>

                          <button
                            type="button"
                            onClick={
                              loadGithubRepos
                            }
                            className="mt-2 text-xs font-medium text-red-700 underline"
                          >
                            Try again
                          </button>

                        </div>
                      ) : repos.length ===
                        0 ? (
                        <p className="mt-3 text-sm text-gray-500">
                          No repositories found.
                        </p>
                      ) : (
                        <select
                          value={
                            selectedRepo
                              ?.full_name ||
                            ""
                          }
                          onChange={(e) => {
                            const repo =
                              repos.find(
                                (r) =>
                                  r.full_name ===
                                  e.target.value
                              );

                            setSelectedRepo(
                              repo || null
                            );
                          }}
                          className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                        >
                          {repos.map(
                            (repo) => (
                              <option
                                key={
                                  repo.full_name
                                }
                                value={
                                  repo.full_name
                                }
                              >
                                {repo.full_name}
                              </option>
                            )
                          )}
                        </select>
                      )}

                    </div>

                    {/* FREQUENCY */}

                    <div className="mt-4">

                      <label className="text-sm font-medium text-gray-900">
                        Monitoring frequency
                      </label>

                      <select
                        value={
                          selectedCron
                        }
                        onChange={(e) =>
                          setSelectedCron(
                            e.target.value
                          )
                        }
                        className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                      >
                        {FREQUENCY_OPTIONS.map(
                          (frequency) => (
                            <option
                              key={
                                frequency.cron
                              }
                              value={
                                frequency.cron
                              }
                            >
                              {
                                frequency.label
                              }
                            </option>
                          )
                        )}
                      </select>

                    </div>

                  </div>
                )}

                {/* ERROR */}

                {error && (
                  <p className="mt-4 text-sm text-red-600">
                    {error}
                  </p>
                )}

                {/* BUTTONS */}

                <div className="mt-7 flex gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      setStep(2)
                    }
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleGenerate
                    }
                    disabled={
                      submitting ||
                      (workflow ===
                        "github_actions" &&
                        (!selectedRepo ||
                          loadingRepos))
                    }
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-medium text-white hover:bg-black disabled:opacity-50"
                  >
                    {submitting
                      ? workflow ===
                        "github_actions"
                        ? "Setting up GitHub..."
                        : "Generating..."
                      : workflow ===
                        "github_actions"
                      ? "Set up GitHub workflow"
                      : "Generate integration"}
                  </button>

                </div>

              </>
            )}

            {/* ==================================================
                STEP 4 — RESULT
            ================================================== */}

            {step === 4 &&
              apiKey && (
                <>
                  {workflow ===
                  "github_actions" ? (
                    <>
                      <div className="flex items-center gap-3">

                        <div className="grid h-10 w-10 place-items-center rounded-full bg-green-50">

                          <Check className="h-5 w-5 text-green-600" />

                        </div>

                        <div>

                          <h2 className="text-xl font-medium text-gray-900">
                            GitHub workflow ready
                          </h2>

                          <p className="mt-1 text-sm text-gray-500">
                            MLSentinel has added the
                            scheduled workflow to{" "}
                            <span className="font-medium text-gray-800">
                              {selectedRepo?.full_name}
                            </span>
                            .
                          </p>

                        </div>

                      </div>

                      <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">

                        <p className="text-sm font-medium text-green-900">
                          Automation enabled
                        </p>

                        <p className="mt-1 text-sm text-green-700">
                          The workflow will run{" "}
                          {
                            FREQUENCY_OPTIONS.find(
                              (f) =>
                                f.cron ===
                                selectedCron
                            )?.label
                          }{" "}
                          and send the model's
                          metrics to MLSentinel.
                        </p>

                      </div>

                      {githubCommitUrl && (
                        <a
                          href={
                            githubCommitUrl
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          View workflow on GitHub
                        </a>
                      )}

                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-medium text-gray-900">
                        Integration ready
                      </h2>

                      <p className="mt-2 text-sm text-gray-600">
                        Paste this into your training
                        script — your metrics come from
                        your own pipeline.
                      </p>

                      <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-900 p-5">

                        <div className="flex items-center justify-between">

                          <p className="text-xs font-medium text-gray-400">
                            Python ·{" "}
                            {
                              FRAMEWORKS.find(
                                (f) =>
                                  f.id ===
                                  framework
                              )?.label
                            }
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(
                                snippet
                              )
                            }
                            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-300 hover:bg-white/10"
                          >
                            {copied ? (
                              <Check className="h-3.5 w-3.5 text-green-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}

                            {copied
                              ? "Copied"
                              : "Copy"}
                          </button>

                        </div>

                        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-relaxed text-gray-100">
                          <code>
                            {snippet}
                          </code>
                        </pre>

                      </div>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={
                      handleClose
                    }
                    className="mt-6 h-12 w-full rounded-xl bg-gray-900 text-sm font-medium text-white hover:bg-black"
                  >
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
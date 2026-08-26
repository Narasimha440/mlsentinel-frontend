import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Sidebar } from "../components/dashboard/Sidebar";
import {
  KeyRound,
  Copy,
  Trash2,
  Plus,
  X,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ApiKey {
  id: number;
  label: string;
  preview: string;
  created_at: string;
}

interface MLModel {
  id: number;
  name: string;
}

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export default function ApiKeysPage() {
  const { user } = useAuth();

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [models, setModels] = useState<MLModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<number | "">("");

  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [keyToRevoke, setKeyToRevoke] = useState<ApiKey | null>(null);
  const [revoking, setRevoking] = useState(false);


  // ------------------------------------------------------------
  // Fetch API keys
  // ------------------------------------------------------------
  const fetchKeys = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const token = await user.getIdToken();

      const res = await fetch(`${API_BASE}/api/api-keys`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to load API keys");
      }

      const data = await res.json();

      setKeys(data.keys || []);
    } catch (error) {
      console.error("Failed to fetch API keys:", error);
      setKeys([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken();

      const res = await fetch(`${API_BASE}/api/dashboard/models`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to load models");
      }

      const data = await res.json();

      setModels(data.models || []);
    } catch (error) {
      console.error("Failed to fetch models:", error);
      setModels([]);
    }
  };

  useEffect(() => {
    fetchKeys();
    fetchModels();
  }, [user]);

  // ------------------------------------------------------------
  // Create API key
  // ------------------------------------------------------------
  const handleCreate = async () => {
    if (!user || creating) return;

    if (!selectedModelId) {
      alert("Please select a default model");
      return;
    }

    try {
      setCreating(true);

      const token = await user.getIdToken();

      const res = await fetch(`${API_BASE}/api/api-keys`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: newLabel || "Untitled key",
          default_ml_model_id: selectedModelId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create API key");
      }

      const data = await res.json();

      // The full key is only displayed once.
      setRevealedKey(data.key);

      setNewLabel("");

      await fetchKeys();
    } catch (error) {
      console.error("Failed to create API key:", error);
    } finally {
      setCreating(false);
    }
  };

  // ------------------------------------------------------------
  // Open revoke confirmation
  // ------------------------------------------------------------
  const openRevokeConfirm = (key: ApiKey) => {
    setKeyToRevoke(key);
  };

  // ------------------------------------------------------------
  // Revoke API key
  // ------------------------------------------------------------
  const confirmRevoke = async () => {
    if (!user || !keyToRevoke || revoking) return;

    try {
      setRevoking(true);

      const token = await user.getIdToken();

      const res = await fetch(
        `${API_BASE}/api/api-keys/${keyToRevoke.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to revoke API key");
      }

      setKeyToRevoke(null);

      await fetchKeys();
    } catch (error) {
      console.error("Failed to revoke API key:", error);
    } finally {
      setRevoking(false);
    }
  };

  // ------------------------------------------------------------
  // Copy API key
  // ------------------------------------------------------------
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy API key:", error);
    }
  };

  // ------------------------------------------------------------
  // Close create/reveal flow
  // ------------------------------------------------------------
  const closeCreateFlow = () => {
    setShowCreateModal(false);
    setRevealedKey(null);
    setNewLabel("");
  setSelectedModelId("");
    setCopied(false);
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* ------------------------------------------------------
          SIDEBAR
      ------------------------------------------------------ */}
      <Sidebar
        userName={user?.displayName || "MLSentinel user"}
        userEmail={user?.email || ""}
        userPhotoUrl={user?.photoURL || undefined}
      />

      {/* ------------------------------------------------------
          MAIN CONTENT
      ------------------------------------------------------ */}
      <main className="min-h-screen min-w-0 flex-1 bg-white text-gray-900">
        <div className="mx-auto w-full max-w-[1280px] px-6 py-10 sm:px-8 lg:px-12 lg:py-14">

          {/* ==================================================
              HEADER
          ================================================== */}
          <div className="flex flex-col gap-6 border-b border-gray-200 pb-8 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="text-sm font-medium text-blue-600">
                Developer settings
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
                API keys
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
                Manage the keys used by your MLSentinel SDK
                and integrations.
              </p>
            </div>

            {/* Create key button */}
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            >
              <Plus className="h-4 w-4" />
              Create key
            </button>
          </div>

          {/* ==================================================
              SECURITY NOTE
          ================================================== */}
          <div className="mt-6 flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3.5">
            <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />

            <div>
              <p className="text-sm font-medium text-gray-800">
                Keep your API keys secure
              </p>

              <p className="mt-0.5 text-xs leading-5 text-gray-500">
                Full keys are shown only when they are created.
                Never commit them to source control or expose them
                in client-side code.
              </p>
            </div>
          </div>

          {/* ==================================================
              API KEY LIST
          ================================================== */}
          <section className="mt-8">

            {/* Section heading */}
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-900">
                  Active keys
                </h2>

                {!loading && (
                  <p className="mt-0.5 text-xs text-gray-500">
                    {keys.length}{" "}
                    {keys.length === 1 ? "key" : "keys"}
                  </p>
                )}
              </div>
            </div>

            {/* --------------------------------------------------
                Loading
            -------------------------------------------------- */}
            {loading && (
              <div className="rounded-xl border border-gray-200">
                <div className="px-6 py-14 text-center">
                  <div className="mx-auto flex h-8 w-8 items-center justify-center">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800" />
                  </div>

                  <p className="mt-3 text-sm text-gray-500">
                    Loading API keys...
                  </p>
                </div>
              </div>
            )}

            {/* --------------------------------------------------
                Empty state
            -------------------------------------------------- */}
            {!loading && keys.length === 0 && (
              <div className="rounded-xl border border-gray-200">
                <div className="flex flex-col items-center px-6 py-16 text-center">

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
                    <KeyRound className="h-5 w-5 text-gray-500" />
                  </div>

                  <h3 className="mt-4 text-sm font-medium text-gray-900">
                    No API keys yet
                  </h3>

                  <p className="mt-1 max-w-sm text-sm leading-5 text-gray-500">
                    Create an API key to start sending reports
                    from your MLSentinel SDK.
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-gray-900 px-3.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                  >
                    <Plus className="h-4 w-4" />
                    Create key
                  </button>
                </div>
              </div>
            )}

            {/* --------------------------------------------------
                API key items
            -------------------------------------------------- */}
            {!loading && keys.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-100">

                  {keys.map((key) => (
                    <div
                      key={key.id}
                      className="group px-4 py-3 transition-colors hover:bg-gray-50/60"
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-4">

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <p className="truncate text-sm font-medium text-gray-900">
                              {key.label}
                            </p>

                            <span className="shrink-0 text-xs text-gray-400">
                              {new Date(key.created_at).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>

                          <code className="mt-1 block truncate font-mono text-cs text-gray-500">
                            {key.preview}
                          </code>
                        </div>

                        {/* Revoke */}
                        <button
                          type="button"
                          onClick={() => openRevokeConfirm(key)}
                          className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          Revoke
                        </button>
                      </div>
                      </div>
                  ))}

                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ======================================================
          CREATE API KEY MODAL
      ====================================================== */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={closeCreateFlow}
          >
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >

              {!revealedKey ? (
                <>
                  {/* Modal header */}
                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Create API key
                      </h2>

                      <p className="mt-1 text-sm leading-5 text-gray-500">
                        Give the key a label so you can recognize
                        it later.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={closeCreateFlow}
                      className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Label input */}
                  <div className="mt-5">
                    <label
                      htmlFor="api-key-label"
                      className="text-xs font-medium text-gray-700"
                    >
                      Label
                    </label>

                    <input
                      id="api-key-label"
                      type="text"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder="e.g. GitHub Actions"
                      autoFocus
                      className="mt-1.5 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                    />
                  </div>

                  <div className="mt-4">
                    <label
                      htmlFor="api-key-model"
                      className="text-xs font-medium text-gray-700"
                    >
                      Default model
                    </label>

                    <select
                      id="api-key-model"
                      value={selectedModelId}
                      onChange={(e) => 
                        setSelectedModelId(
                          e.target.value ? Number(e.target.value) : ""
                        )
                      }
                      className="mt-1.5 h-10 w-full rounded-lg border border-gray0200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                    >
                      <option value="">Select a model</option>

                      {models.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Create */}
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={creating}
                    className="mt-5 h-10 w-full rounded-lg bg-gray-900 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {creating ? "Creating..." : "Create key"}
                  </button>
                </>
              ) : (
                <>
                  {/* Reveal header */}
                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Your new API key
                      </h2>

                      <p className="mt-1 text-sm text-amber-600">
                        Copy this now. You won't be able to see
                        it again.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={closeCreateFlow}
                      className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Key */}
                  <div className="mt-5 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">

                    <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-xs text-gray-700">
                      {revealedKey}
                    </code>

                    <button
                      type="button"
                      onClick={() => handleCopy(revealedKey)}
                      className="shrink-0 rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-900"
                      aria-label="Copy API key"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Done */}
                  <button
                    type="button"
                    onClick={closeCreateFlow}
                    className="mt-5 h-10 w-full rounded-lg bg-gray-900 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                  >
                    Done
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================
          REVOKE CONFIRMATION MODAL
      ====================================================== */}
      <AnimatePresence>
        {keyToRevoke && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={() => !revoking && setKeyToRevoke(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >

              {/* Warning icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>

              <h2 className="mt-4 text-lg font-semibold text-gray-900">
                Revoke this API key?
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                <span className="font-medium text-gray-900">
                  {keyToRevoke.label}
                </span>{" "}
                ({keyToRevoke.preview}) will stop working
                immediately. Any code using it will need to be
                updated with a new key.
              </p>

              {/* Actions */}
              <div className="mt-6 flex gap-3">

                <button
                  type="button"
                  onClick={() => setKeyToRevoke(null)}
                  disabled={revoking}
                  className="h-10 flex-1 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmRevoke}
                  disabled={revoking}
                  className="h-10 flex-1 rounded-lg bg-red-600 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {revoking ? "Revoking..." : "Revoke key"}
                </button>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
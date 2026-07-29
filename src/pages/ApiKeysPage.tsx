import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Sidebar } from "../components/dashboard/Sidebar";
import { KeyRound, Copy, Trash2, Plus, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ApiKey {
  id: number;
  label: string;
  preview: string;
  created_at: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export default function ApiKeysPage() {
  const { user } = useAuth();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKey | null>(null);
    const [revoking, setRevoking] = useState(false);

  const fetchKeys = async () => {
    if (!user) return;
    setLoading(true);
    const token = await user.getIdToken();
    const res = await fetch(`${API_BASE}/api/api-keys`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setKeys(data.keys);
    setLoading(false);
  };

  useEffect(() => {
    fetchKeys();
  }, [user]);

  const handleCreate = async () => {
    if (!user) return;
    setCreating(true);
    const token = await user.getIdToken();
    const res = await fetch(`${API_BASE}/api/api-keys`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ label: newLabel || "Untitled key" }),
    });
    const data = await res.json();
    setRevealedKey(data.key);
    setNewLabel("");
    setCreating(false);
    fetchKeys();
  };

  const openRevokeConfirm = (key: ApiKey) => {
    setKeyToRevoke(key);
  };

  const confirmRevoke = async () => {
    if (!user || !keyToRevoke) return;
    setRevoking(true);

    const token = await user.getIdToken();
    await fetch(`${API_BASE}/api/api-keys/${keyToRevoke.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });

    setRevoking(false);
    setKeyToRevoke(null);
    fetchKeys();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const closeCreateFlow = () => {
    setShowCreateModal(false);
    setRevealedKey(null);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        userName={user?.displayName || "MLSentinel user"}
        userEmail={user?.email || ""}
        userPhotoUrl={user?.photoURL || undefined}
      />

      <main className="min-h-screen flex-1 bg-white text-gray-900">
        <div className="mx-auto max-w-[1280px] px-12 py-16 sm:px-16 lg:pl-20">
            <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
                <p className="text-base font-medium text-blue-600">Developer settings</p>
                <h1 className="mt-3 text-5xl font-medium tracking-tight text-gray-900 sm:text-6xl">API keys</h1>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-600">
                Use these keys in your SDK to authenticate requests and send metrics from your training scripts.
                </p>
            </div>
            <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-gray-900 px-7 text-base font-medium text-white transition-colors hover:bg-black focus:outline-none focus:ring-4 focus:ring-gray-900/20"
            >
                <Plus className="h-5 w-5" />
                Create key
            </button>
            </div>

<div className="mt-14 overflow-hidden rounded-2xl border border-gray-200">
  {loading ? (
    <p className="px-10 py-20 text-center text-lg text-gray-500">Loading...</p>
  ) : keys.length === 0 ? (
    <div className="flex flex-col items-center gap-4 px-10 py-28 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-gray-50">
        <KeyRound className="h-7 w-7 text-gray-400" />
      </div>
      <p className="text-xl font-medium text-gray-900">No API keys yet</p>
      <p className="max-w-sm text-lg text-gray-500">
        Create one to start sending reports from your SDK — you'll only see the full key once.
      </p>
    </div>
  ) : (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-gray-100 bg-gray-50/60">
          <th className="px-10 py-6 text-sm font-semibold uppercase tracking-wider text-gray-500">Label</th>
          <th className="px-10 py-6 text-sm font-semibold uppercase tracking-wider text-gray-500">Key</th>
          <th className="px-10 py-6 text-sm font-semibold uppercase tracking-wider text-gray-500">Created</th>
          <th className="px-10 py-6"></th>
        </tr>
      </thead>
      <tbody>
        {keys.map((k) => (
          <tr key={k.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50">
            <td className="px-10 py-8" style={{ fontSize: "20px" }}>
              <span className="font-semibold text-gray-900">{k.label}</span>
            </td>
            <td className="px-10 py-8">
              <code className="rounded-lg bg-gray-100 px-3 py-1.5 font-mono text-base text-gray-700">
                {k.preview}
              </code>
            </td>
            <td className="px-10 py-8 text-lg text-gray-500">
              {new Date(k.created_at).toLocaleDateString()}
            </td>
            <td className="px-10 py-8 text-right">
              <button
                type="button"
                onClick={() => openRevokeConfirm(k)}
                className="inline-flex items-center gap-2 rounded-full bg-red-50 px-5 py-3 text-base font-medium text-red-600 transition-colors hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
                Revoke
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

      {/* Create key modal */}
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
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              className="w-full max-w-lg rounded-2xl bg-white p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {!revealedKey ? (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-medium text-gray-900">Create API key</h2>
                    <button type="button" onClick={closeCreateFlow} className="text-gray-400 hover:text-gray-600">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">Give it a label so you can recognize it later.</p>
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="e.g. My laptop, CI pipeline"
                    className="mt-5 h-14 w-full rounded-2xl border border-gray-200 px-4 text-sm focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                  />
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={creating}
                    className="mt-6 h-14 w-full rounded-2xl bg-gray-900 text-sm font-medium text-white transition-colors hover:bg-black disabled:opacity-50"
                  >
                    {creating ? "Creating..." : "Create key"}
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-medium text-gray-900">Your new API key</h2>
                  <p className="mt-2 text-sm text-amber-600">
                    Copy this now — you won't be able to see it again.
                  </p>
                  <div className="mt-5 flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
                    <code className="flex-1 overflow-x-auto text-xs text-gray-800">{revealedKey}</code>
                    <button
                      type="button"
                      onClick={() => handleCopy(revealedKey)}
                      className="shrink-0 rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    >
                      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={closeCreateFlow}
                    className="mt-6 h-14 w-full rounded-2xl bg-gray-900 text-sm font-medium text-white transition-colors hover:bg-black"
                  >
                    Done
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Revoke confirmation modal */}
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
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        className="w-full max-w-md rounded-2xl bg-white p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid h-12 w-12 place-items-center rounded-full bg-red-50">
          <Trash2 className="h-5 w-5 text-red-600" />
        </div>
        <h2 className="mt-5 text-xl font-medium text-gray-900">Revoke this API key?</h2>
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-medium text-gray-900">{keyToRevoke.label}</span> ({keyToRevoke.preview}) will stop
          working immediately. Any code using it will start failing until you replace it with a new key.
        </p>
        <div className="mt-7 flex gap-3">
          <button
            type="button"
            onClick={() => setKeyToRevoke(null)}
            disabled={revoking}
            className="h-12 flex-1 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmRevoke}
            disabled={revoking}
            className="h-12 flex-1 rounded-xl bg-red-600 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
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
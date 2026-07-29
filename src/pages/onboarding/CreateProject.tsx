import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export default function CreateProject() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setSubmitting(true);
    setError("");

    const token = await user.getIdToken();
    const res = await fetch(`${API_BASE}/api/onboarding/project`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.detail || "Something went wrong");
      setSubmitting(false);
      return;
    }

    navigate(`/onboarding/model?project_id=${data.id}&project_name=${encodeURIComponent(data.name)}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <p className="text-sm font-medium text-blue-600">Step 2 of 3</p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight text-gray-900">Create your first project</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          A project groups related models together — e.g. "Fraud Detection" or "Recommendation Engine."
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Fraud Detection"
            autoFocus
            className="h-14 w-full rounded-2xl border border-gray-200 px-4 text-sm focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 text-sm font-medium text-white transition-colors hover:bg-black disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Continue"}
            {!submitting && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
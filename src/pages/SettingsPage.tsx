import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext"
import { Sidebar } from "../components/dashboard/Sidebar";
import { Check } from "lucide-react";

interface ModelSummary {
    model_id: number;
    name: string;
    project: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const FREQUENCIES = [
    { value: "off", label: "Off"},
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
];

export default function SettingsPage() {
    const { user } = useAuth()
    const [models, setModels] = useState<ModelSummary[]>([]);
    const [schedules, setSchedules] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<number | null>(null);
    const [savedId, setSavedID] = useState<number | null>(null);

    useEffect(() => {
        if (!user) return;

        (async () => {
            const token = await user.getIdToken();
            const dashRes = await fetch(`${API_BASE}/api/dashboard`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const dashData = await dashRes.json();
            console.log("dashboard response: ", dashData);
            console.log("status: ", dashRes.status);
            const modelList: ModelSummary[] = dashData.available_models ?? [];
            setModels(modelList);

            const scheduleEntries = await Promise.all(
                modelList.map(async (m) => {
                    const res = await fetch(`${API_BASE}/api/settings/schedule/${m.model_id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const data = await res.json();
                    return [m.model_id, data.frequency] as const;
                })
            );

            setSchedules(Object.fromEntries(scheduleEntries));
            setLoading(false);
        })();
    }, [user]);

    const handleChange = async (modelId: number, frequency: string) => {
        if (!user) return;
        setSavedID(modelId);
        setSchedules((prev) => ({ ...prev, [modelId]: frequency }));

        const token = await user.getIdToken();
        await fetch(`${API_BASE}/api/settings/schedule`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model_id: modelId, frequency }),
        });

        setSavingId(null);
        setSavedID(modelId);
        setTimeout(() => setSavedID(null), 1500);
    };
    return (
    <div className="flex min-h-screen">
      <Sidebar
        userName={user?.displayName || "MLSentinel user"}
        userEmail={user?.email || ""}
        userPhotoUrl={user?.photoURL || undefined}
      />

      <main className="min-h-screen flex-1 bg-white text-gray-900">
        <div className="mx-auto max-w-3xl px-12 py-16 sm:px-16">
          <p className="text-sm font-medium text-blue-600">Preferences</p>
          <h1 className="mt-3 text-4xl font-medium tracking-tight text-gray-900 sm:text-5xl">Settings</h1>
          <p className="mt-4 text-base text-gray-600">
            Choose how often MLSentinel should re-check each model's history for trends and regressions.
          </p>

          <div className="mt-12 overflow-hidden rounded-2xl border border-gray-200">
            {loading ? (
              <p className="px-8 py-16 text-center text-sm text-gray-500">Loading...</p>
            ) : models.length === 0 ? (
              <p className="px-8 py-16 text-center text-sm text-gray-500">No models yet.</p>
            ) : (
              <ul>
                {models.map((m) => (
                  <li key={m.model_id} className="flex items-center justify-between border-b border-gray-100 px-8 py-6 last:border-b-0">
                    <div>
                      <p className="text-base font-medium text-gray-900">{m.name}</p>
                      <p className="text-sm text-gray-500">{m.project}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {savedId === m.model_id && <Check className="h-4 w-4 text-green-600" />}
                      <select
                        value={schedules[m.model_id] ?? "off"}
                        onChange={(e) => handleChange(m.model_id, e.target.value)}
                        disabled={savingId === m.model_id}
                        className="h-11 rounded-xl border border-gray-200 px-4 text-sm focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 disabled:opacity-50"
                      >
                        {FREQUENCIES.map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="mt-6 text-sm text-gray-500">
            This controls MLSentinel's own re-check schedule, not your model's evaluation runs — those still
            need to be sent via the SDK, either manually or through{" "}
            <a href="/dashboard/github/connect" className="text-blue-600 hover:text-blue-700">
              a connected GitHub workflow
            </a>.
          </p>
        </div>
      </main>
    </div>
    );
}
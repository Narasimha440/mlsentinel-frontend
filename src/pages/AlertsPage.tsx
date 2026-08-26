import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Sidebar } from "../components/dashboard/Sidebar";
import { AlertTriangle, AlertCircle, Info, Check } from "lucide-react";

interface AlertItem {
    id: number;
    severity: "critical" | "warning" | "info";
    message: string;
    acknowledged: boolean;
    created_at: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const severityConfig = {
    critical: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", label: "Critical" },
    warning: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50", label: "Warning" },
    info: { icon: Info, color: "text-blue-600", bg: "bg-blue-50", label: "Info" },
};

export default function AlertsPage() {
    const { user } = useAuth();
    const [alerts, setAlerts] = useState<AlertItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "unacknowledged">("all");

    const fetchAlerts = async () => {
        if (!user) return;

        const token = await user.getIdToken();
        const res = await fetch(`${API_BASE}/api/alerts`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAlerts(data.alerts);
        setLoading(false);
    };

    useEffect(() => {
        fetchAlerts();
    }, [user]);

    const handleAcknowledge = async (alertId: number) => {
        if (!user) return;
        setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)));

        const token = await user.getIdToken();
        await fetch(`${API_BASE}/api/alerts/${alertId}/acknowledge`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        });
    };

    const visibleAlerts = filter === "unacknowledged" ? alerts.filter((a) => !a.acknowledged) : alerts;
    const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;

    return (
    <div className="flex min-h-screen">
      <Sidebar
        userName={user?.displayName || "MLSentinel user"}
        userEmail={user?.email || ""}
        userPhotoUrl={user?.photoURL || undefined}
      />

      <main className="min-h-screen flex-1 bg-white text-gray-900">
        <div className="mx-auto max-w-4xl px-12 py-16 sm:px-16">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-sm font-medium text-blue-600">Monitoring</p>
              <h1 className="mt-3 text-4xl font-medium tracking-tight text-gray-900 sm:text-5xl">Alerts</h1>
              <p className="mt-4 text-base text-gray-600">
                Regressions and issues detected by MLSentinel's scheduled checks.
              </p>
            </div>
            <div className="flex gap-2 rounded-full border border-gray-200 p-1">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  filter === "all" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilter("unacknowledged")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  filter === "unacknowledged" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Unread {unacknowledgedCount > 0 && `(${unacknowledgedCount})`}
              </button>
            </div>
          </div>

          <div className="mt-12 overflow-hidden rounded-2xl border border-gray-200">
            {loading ? (
              <p className="px-8 py-16 text-center text-sm text-gray-500">Loading...</p>
            ) : visibleAlerts.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-8 py-24 text-center">
                <Check className="h-8 w-8 text-green-600" />
                <p className="text-base font-medium text-gray-900">
                  {filter === "unacknowledged" ? "No unread alerts" : "No alerts yet"}
                </p>
                <p className="text-sm text-gray-500">
                  {filter === "unacknowledged"
                    ? "You're all caught up."
                    : "MLSentinel checks your models on schedule and will list regressions here."}
                </p>
              </div>
            ) : (
              <ul>
                {visibleAlerts.map((alert) => {
                  const config = severityConfig[alert.severity] || severityConfig.info;
                  const Icon = config.icon;
                  return (
                    <li
                      key={alert.id}
                      className={`flex items-start gap-4 border-b border-gray-100 px-8 py-6 last:border-b-0 ${
                        !alert.acknowledged ? "bg-blue-50/30" : ""
                      }`}
                    >
                      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${config.bg}`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium uppercase tracking-wide ${config.color}`}>
                            {config.label}
                          </span>
                          {!alert.acknowledged && (
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                          )}
                        </div>
                        <p className="mt-1 text-base text-gray-900">{alert.message}</p>
                        <p className="mt-1 text-sm text-gray-500">
                          {new Date(alert.created_at).toLocaleString()}
                        </p>
                      </div>
                      {!alert.acknowledged && (
                        <button
                          type="button"
                          onClick={() => handleAcknowledge(alert.id)}
                          className="shrink-0 rounded-full px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                        >
                          Mark as read
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
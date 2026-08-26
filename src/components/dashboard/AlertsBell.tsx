import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, AlertTriangle, AlertCircle, Info, Check } from "lucide-react";

interface AlertItem {
    id: number;
    severity: "critical" | "warning" | "info";
    message: string;
    acknowledged: boolean;
    created_at: string;
}

interface AlertsBellProps {
    idToken?: string;
    apiBase: string;
}

const severityConfig = {
    critical: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
    warning: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
    info: { icon: Info, color: "text-blue-600", bg: "bg-blue-50" },
};

export function AlertsBell({ idToken, apiBase }: AlertsBellProps) {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [alerts, setAlerts] = useState<AlertItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const fetchAlerts = async () => {
        if (!idToken) return;

        const res = await fetch(`${apiBase}/api/alerts`, {
            headers: { Authorization: `Bearer ${idToken}` },
        });
        if (res.ok) {
            const data = await res.json();
            setAlerts(data.alerts.slice(0, 5));
            setUnreadCount(data.unacknowledged_count);
        }
    };


    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 30000);
        return () => clearInterval(interval);
    }, [idToken]);


    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const goToAlerts = () => {
        setOpen(false);
        navigate("/dashboard/alerts");
    };


    return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
        className="relative grid h-10 w-10 place-items-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[11px] font-medium text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-gray-200 bg-white shadow-lg"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <p className="text-sm font-medium text-gray-900">Notifications</p>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                  <Check className="h-5 w-5 text-green-600" />
                  <p className="text-sm text-gray-500">No alerts yet</p>
                </div>
              ) : (
                alerts.map((alert) => {
                  const config = severityConfig[alert.severity] || severityConfig.info;
                  const Icon = config.icon;
                  return (
                    <div
                      key={alert.id}
                      className={`flex items-start gap-3 border-b border-gray-50 px-4 py-3 last:border-b-0 ${
                        !alert.acknowledged ? "bg-blue-50/30" : ""
                      }`}
                    >
                      <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${config.bg}`}>
                        <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm text-gray-900">{alert.message}</p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {new Date(alert.created_at).toLocaleString()}
                        </p>
                      </div>
                      {!alert.acknowledged && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />}
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-gray-100 p-2">
              <button
                type="button"
                onClick={goToAlerts}
                className="w-full rounded-lg px-3 py-2.5 text-center text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
              >
                View all alerts →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
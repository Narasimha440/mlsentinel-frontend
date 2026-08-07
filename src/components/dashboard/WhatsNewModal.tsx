import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, LineChart, Bell, BarChart3, Zap } from "lucide-react";

interface WhatsNewModalProps {
  userId?: string;
}

const VERSION = "v1.2.0";
const RELEASE_AT = new Date(Date.now() - 5 * 60 * 1000);
const VISIBILITY_WINDOW_HOURS = 24;

const FEATURES = [
  { icon: LineChart, color: "text-blue-600", bg: "bg-blue-50", title: "New Drift Insights", description: "Detect drift with deeper statistical tests and clearer explanations." },
  { icon: Bell, color: "text-green-600", bg: "bg-green-50", title: "Smarter Alerts", description: "Reduce noise with adaptive thresholds and alert grouping." },
  { icon: BarChart3, color: "text-purple-600", bg: "bg-purple-50", title: "Dashboard Upgrades", description: "New charts, filters, and real-time performance improvements." },
  { icon: Zap, color: "text-amber-600", bg: "bg-amber-50", title: "More Integrations", description: "Easier setup with AWS, GCP, Databricks, and Slack." },
];

function storageKey(userId: string) {
  return `mlsentinel_whatsnew_seen_${VERSION}_${userId}`;
}

function isWithinVisibilityWindow(): boolean {
  const now = Date.now();
  const releaseTime = RELEASE_AT.getTime();
  const windowEnd = releaseTime + VISIBILITY_WINDOW_HOURS * 60 * 60 * 1000;
  return now >= releaseTime && now <= windowEnd;
}

export function WhatsNewModal({ userId }: WhatsNewModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const alreadySeen = localStorage.getItem(storageKey(userId));
    if (!alreadySeen && isWithinVisibilityWindow()) {
      setOpen(true);
    }
  }, [userId]);

  const dismiss = () => {
    if (userId) localStorage.setItem(storageKey(userId), "true");
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4"
          onClick={dismiss}
        >
         <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative w-full max-w-lg rounded-md border border-gray-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
            >
            <button
                type="button"
                onClick={dismiss}
                aria-label="Close"
                className="absolute right-5 top-5 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
                <X className="h-5 w-5" />
            </button>

            {/* Full logo — large and centered */}
            <div className="flex flex-col items-center border-b border-gray-100 px-8 py-10">
                <img
                src="https://raw.githubusercontent.com/Narasimha440/mlsentinal/main/logo.png"
                alt="MLSentinel"
                className="h-24 w-auto"
                />
            </div>

            <div className="px-8 py-7">
                <span className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600">
                What's New
                </span>

                <h2 className="mt-5 text-2xl font-medium text-gray-900">
                MLSentinel {VERSION} is here! 
                </h2>
                <p className="mt-2 text-base text-gray-600">Smarter monitoring. Faster alerts. Better insights.</p>

                <div className="mt-6 space-y-5">
                {FEATURES.map((f) => (
                    <div key={f.title} className="flex items-start gap-4">
                    <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-md ${f.bg}`}>
                        <f.icon className={`h-5 w-5 ${f.color}`} />
                    </div>
                    <div>
                        <p className="text-base font-medium text-gray-900">{f.title}</p>
                        <p className="mt-1 text-sm text-gray-500">{f.description}</p>
                    </div>
                    </div>
                ))}
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 px-8 py-5">
                <button
                type="button"
                onClick={dismiss}
                className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-black"
                >
                Explore Now
                <ArrowRight className="h-4 w-4" />
                </button>
                <a
                href="/changelog"
                className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
                >
                View Changelog
                </a>
            </div>
            </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
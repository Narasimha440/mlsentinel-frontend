import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  LineChart,
  Bell,
  Settings,
} from "lucide-react";

import { GithubIcon } from "../icons/GithubIcon";

interface WhatsNewModalProps {
  userId?: string;
}

const VERSION = "v2.2.0";

/*
 * Set this to the actual release time when you deploy.
 *
 * For testing, this currently makes the release appear
 * to have happened 5 minutes ago.
 */
const RELEASE_AT = new Date(Date.now() - 5 * 60 * 1000);

const VISIBILITY_WINDOW_HOURS = 24;

const FEATURES = [
  {
    icon: GithubIcon,
    color: "text-gray-700",
    bg: "bg-gray-100",
    title: "GitHub Actions",
    description:
      "Set up scheduled MLSentinel monitoring directly from your GitHub repository.",
  },
  {
    icon: LineChart,
    color: "text-blue-600",
    bg: "bg-blue-50",
    title: "Projects & Model Insights",
    description:
      "View your projects and models with compact performance and health insights.",
  },
  {
    icon: Bell,
    color: "text-amber-600",
    bg: "bg-amber-50",
    title: "Alerts",
    description:
      "See detected regressions and monitoring issues in one place and mark them as read.",
  },
  {
    icon: Settings,
    color: "text-gray-600",
    bg: "bg-gray-100",
    title: "Monitoring Settings",
    description:
      "Configure how frequently MLSentinel re-checks your models for trends and regressions.",
  },
];

function storageKey(userId: string) {
  return `mlsentinel_whatsnew_seen_${VERSION}_${userId}`;
}

function isWithinVisibilityWindow(): boolean {
  const now = Date.now();

  const releaseTime = RELEASE_AT.getTime();

  const windowEnd =
    releaseTime +
    VISIBILITY_WINDOW_HOURS * 60 * 60 * 1000;

  return (
    now >= releaseTime &&
    now <= windowEnd
  );
}

export function WhatsNewModal({
  userId,
}: WhatsNewModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const alreadySeen = localStorage.getItem(
      storageKey(userId)
    );

    if (
      !alreadySeen &&
      isWithinVisibilityWindow()
    ) {
      setOpen(true);
    }
  }, [userId]);

  const dismiss = () => {
    if (userId) {
      localStorage.setItem(
        storageKey(userId),
        "true"
      );
    }

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
              type: "spring",
              stiffness: 300,
              damping: 28,
            }}
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-md border border-gray-200 bg-white shadow-xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* Close */}

            <button
              type="button"
              onClick={dismiss}
              aria-label="Close"
              className="absolute right-5 top-5 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Logo */}

            <div className="flex flex-col items-center border-b border-gray-100 px-8 py-8">
              <img
                src="https://raw.githubusercontent.com/Narasimha440/mlsentinal/main/logo.png"
                alt="MLSentinel"
                className="h-20 w-auto"
              />
            </div>

            {/* Content */}

            <div className="px-8 py-7">
              <span className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600">
                What's New
              </span>

              <h2 className="mt-5 text-2xl font-medium tracking-tight text-gray-900">
                MLSentinel {VERSION} is here
              </h2>

              <p className="mt-2 text-base leading-relaxed text-gray-600">
                Automated monitoring, better project
                visibility, and a cleaner workflow for
                keeping track of your models.
              </p>

              {/* Features */}

              <div className="mt-7 space-y-5">
                {FEATURES.map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <div
                      key={feature.title}
                      className="flex items-start gap-4"
                    >
                      <div
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-md ${feature.bg}`}
                      >
                        <Icon
                          className={`h-5 w-5 ${feature.color}`}
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {feature.title}
                        </p>

                        <p className="mt-1 text-sm leading-relaxed text-gray-500">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}

            <div className="flex items-center justify-end border-t border-gray-100 px-8 py-5">
              <a
                href="/changelog"
                onClick={dismiss}
                className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
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
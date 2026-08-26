import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Boxes,
  Activity,
  Bell,
  History as HistoryIcon,
  KeyRound,
  Settings,
  ChevronDown,
  Database,
} from "lucide-react";
import { GithubIcon } from "../icons/GithubIcon";
import { AnimatePresence, motion } from "framer-motion";
import type { ComponentType } from "react";

interface NavItem {
  label: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  userName: string;
  userEmail: string;
  userPhotoUrl?: string;
  workspacePlan?: string;
  idToken?: string;
}

export function Sidebar({
  userName,
  userEmail,
  userPhotoUrl,
  workspacePlan = "",
  idToken,
}: SidebarProps) {
  const navigate = useNavigate();

  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const [alertCount, setAlertCount] = useState(0);
  const [workspaceName, setWorkspaceName] = useState("My Workspace");

  const [expandedSections, setExpandedSections] = useState({
    Overview: true,
    Workspace: true,
    Monitoring: true,
    Developer: true,
  });

  const toggleSection = (title: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

  const navigation: NavSection[] = [
    {
      title: "Overview",
      items: [
        {
          label: "Dashboard",
          path: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Workspace",
      items: [
        {
          label: "Projects",
          path: "/dashboard/projects",
          icon: FolderKanban,
        },
        {
          label: "Models",
          path: "/dashboard/models",
          icon: Boxes,
        },
      ],
    },
    {
      title: "Monitoring",
      items: [
        {
          label: "Data Quality",
          path: "/dashboard/data-quality",
          icon: Database,
        },
        {
          label: "Monitoring",
          path: "/dashboard/monitoring",
          icon: Activity,
        },
        {
          label: "History",
          path: "/dashboard/history",
          icon: HistoryIcon,
        },
        {
          label: "Alerts",
          path: "/dashboard/alerts",
          icon: Bell,
          badge: alertCount > 0 ? alertCount : undefined,
        },
      ],
    },
    {
      title: "Developer",
      items: [
        {
          label: "API Keys",
          path: "/dashboard/api-keys",
          icon: KeyRound,
        },
        {
          label: "Settings",
          path: "/dashboard/settings",
          icon: Settings,
        },
        {
          label: "Github Connect",
          path: "/dashboard/github/connect",
          icon: GithubIcon,
        },
      ],
    },
  ];

  useEffect(() => {
    if (!idToken) return;

    const fetchWorkspace = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/workspace`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!res.ok) return;

        const data = await res.json();

        if (data.name && typeof data.name === "string") {
          setWorkspaceName(data.name);
        }
      } catch {
        // Ignore workspace fetch errors
      }
    };

    const fetchAlertCount = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/alerts`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!res.ok) return;

        const data = await res.json();

        if (typeof data.unacknowledged_count === "number") {
          setAlertCount(data.unacknowledged_count);
        } else if (Array.isArray(data.alerts)) {
          setAlertCount(
            data.alerts.filter((a: { acknowledged?: boolean }) => !a.acknowledged)
              .length
          );
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchWorkspace();
    fetchAlertCount();

    const interval = setInterval(fetchAlertCount, 30000);

    return () => clearInterval(interval);
  }, [idToken, API_BASE]);

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="px-5 py-5">
        <button
          type="button"
          onClick={() => navigate("/")}
          draggable={false}
          aria-label="Go to MLSentinel home"
          className="block cursor-pointer border-0 bg-transparent p-0 outline-none"
        >
          <img
            src="/image.png"
            alt="MLSentinel"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
            className="h-auto w-[190px] select-none object-contain"
          />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {navigation.map((section) => {
          const sectionKey =
            section.title as keyof typeof expandedSections;

          return (
            <div key={section.title} className="mb-4">
              <button
                type="button"
                onClick={() => toggleSection(sectionKey)}
                className="mb-2 flex w-full items-center justify-between px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400 hover:text-gray-600"
              >
                <span>{section.title}</span>

                <ChevronDown
                  className={`h-3 w-3 transition-transform duration-200 ${
                    expandedSections[sectionKey]
                      ? "rotate-0"
                      : "-rotate-90"
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {expandedSections[sectionKey] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1">
                      {section.items.map((item) => (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          end={item.path === "/dashboard"}
                          className={({ isActive }) =>
                            `flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                              isActive
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`
                          }
                        >
                          <span className="flex items-center gap-3">
                            <item.icon className="h-4 w-4" />
                            {item.label}
                          </span>

                          {item.badge !== undefined && item.badge > 0 && (
                            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1.5 text-[11px] text-white">
                              {item.badge}
                            </span>
                          )}
                        </NavLink>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Workspace switcher */}
      <div className="border-t border-gray-100 px-3 py-3">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
        >
          <span className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-blue-50 text-blue-600">
              <Boxes className="h-4 w-4" />
            </span>

            <span className="leading-tight">
              <p className="text-sm font-medium text-gray-900">
                {workspaceName}
              </p>
              <p className="text-[11px] text-gray-500">{workspacePlan}</p>
            </span>
          </span>

          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* User profile */}
      <div className="border-t border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            {userPhotoUrl ? (
              <img
                src={userPhotoUrl}
                alt={userName}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-50 text-sm font-medium text-blue-600">
                {initials}
              </div>
            )}

            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
          </div>

          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium text-gray-900">
              {userName}
            </p>
            <p className="truncate text-xs text-gray-500">{userEmail}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
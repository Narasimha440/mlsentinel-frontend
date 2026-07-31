import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Boxes,
  Activity,
  BarChart3,
  Lightbulb,
  Bell,
  History as HistoryIcon,
  KeyRound,
  Settings,
  ChevronDown,
  GitCommitHorizontal,
} from "lucide-react";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Github", path: "/dashboard/github/connect", icon: GitCommitHorizontal },
  { label: "Projects", path: "/dashboard/projects", icon: FolderKanban },
  { label: "Models", path: "/dashboard/models", icon: Boxes },
  { label: "Monitoring", path: "/dashboard/monitoring", icon: Activity },
  { label: "Analysis", path: "/dashboard/analysis", icon: BarChart3 },
  { label: "Recommendations", path: "/dashboard/recommendations", icon: Lightbulb },
  { label: "Alerts", path: "/dashboard/alerts", icon: Bell, badge: 4 },
  { label: "History", path: "/dashboard/history", icon: HistoryIcon },
  { label: "API Keys", path: "/dashboard/api-keys", icon: KeyRound },
  { label: "Settings", path: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  userName: string;
  userEmail: string;
  userPhotoUrl?: string;
  workspaceName?: string;
  workspacePlan?: string;
}

export function Sidebar({
  userName,
  userEmail,
  userPhotoUrl,
  workspaceName = "My Workspace",
  workspacePlan = "Free Plan",
}: SidebarProps) {
  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-6">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-gray-900">
          <Activity className="h-4.5 w-4.5 text-white" />
        </div>
        <div className="leading-tight">
          <p className="text-[15px] font-medium tracking-tight text-gray-900">MLSentinel</p>
          <p className="text-[11px] text-gray-500">Guarding models. Powering trust.</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/dashboard"}
            className={({ isActive }) =>
              `flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <span className="flex items-center gap-3">
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </span>
            {item.badge && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1.5 text-[11px] font-medium text-white">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
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
              <p className="text-sm font-medium text-gray-900">{workspaceName}</p>
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
              <img src={userPhotoUrl} alt={userName} className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-50 text-sm font-medium text-blue-600">
                {initials}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium text-gray-900">{userName}</p>
            <p className="truncate text-xs text-gray-500">{userEmail}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
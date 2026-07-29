import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isLoading || !user) return;

    const checkStatus = async () => {
      const token = await user.getIdToken();
      const res = await fetch(`${API_BASE}/api/onboarding/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const status = await res.json();

      if (status.step === "workspace") navigate("/onboarding/workspace");
      else if (status.step === "project") navigate("/onboarding/project");
      else if (status.step === "model") navigate(`/onboarding/model?project_id=${status.project.id}&project_name=${encodeURIComponent(status.project.name)}`);
      // "waiting_for_first_report" and "complete" both fall through to the dashboard

      setChecking(false);
    };

    checkStatus();
  }, [user, isLoading, navigate]);

  if (isLoading || checking) {
    return <div className="flex min-h-screen items-center justify-center bg-white text-sm text-gray-500">Loading...</div>;
  }

  return <>{children}</>;
}
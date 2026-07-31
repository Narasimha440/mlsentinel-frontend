import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export default function GithubCallback() {
  const [params] = useSearchParams();
  const { user, isLoading } = useAuth();
  const [status, setStatus] = useState<"working" | "success" | "error">("working");

  useEffect(() => {
    if (isLoading) return;

    const installationId = params.get("installation_id");

    if (!installationId || !user) {
      setStatus("error");
      return;
    }

    const saveInstallation = async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch(`${API_BASE}/api/github/callback`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ installation_id: installationId, account_login: "" }),
        });

        if (!res.ok) throw new Error("Failed to save installation");

        setStatus("success");

        // if we're in a popup, tell the opener we're done and close ourselves
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({ type: "github-connected" }, window.location.origin);
          setTimeout(() => window.close(), 800);
        }
      } catch {
        setStatus("error");
      }
    };

    saveInstallation();
  }, [params, user, isLoading]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="max-w-sm text-center">
        {status === "working" && (
          <>
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-4 text-sm text-gray-600">Connecting your GitHub account...</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="mx-auto h-8 w-8 text-green-600" />
            <p className="mt-4 text-sm text-gray-600">
              GitHub connected — you can close this window.
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="mx-auto h-8 w-8 text-red-600" />
            <p className="mt-4 text-sm text-gray-600">
              Something went wrong. Please close this window and try again.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
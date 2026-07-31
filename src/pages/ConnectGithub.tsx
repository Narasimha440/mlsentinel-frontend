import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sidebar } from "../components/dashboard/Sidebar";
import { CheckCircle2 } from "lucide-react";
import { GithubIcon } from "../components/icons/GithubIcon"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const GITHUB_APP_SLUG = import.meta.env.VITE_GITHUB_APP_SLUG || "MLSentinel";

export default function ConnectGithub() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connected, setConnected] = useState(false);
  const [checking, setChecking] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const popupRef = useRef<Window | null>(null);

  const checkConnection = async () => {
    if (!user) return;
    const token = await user.getIdToken();
    const res = await fetch(`${API_BASE}/api/github/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setConnected(data.connected);
    }
    setChecking(false);
  };

  useEffect(() => {
    checkConnection();
  }, [user]);

  // Listen for the popup telling us it's done
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "github-connected") {
        setConnecting(false);
        checkConnection();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [user]);

  // Fallback: if the popup gets closed without ever posting a message
  // (user cancels, closes manually, etc.), stop the "connecting" spinner
  useEffect(() => {
    if (!connecting) return;

    const interval = setInterval(() => {
      if (popupRef.current?.closed) {
        setConnecting(false);
        checkConnection();
        clearInterval(interval);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [connecting]);

  const handleConnect = () => {
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    setConnecting(true);
    popupRef.current = window.open(
      `https://github.com/apps/${GITHUB_APP_SLUG}/installations/new`,
      "github-connect",
      `width=${width},height=${height},left=${left},top=${top}`
    );
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
          <p className="text-sm font-medium text-blue-600">Automation</p>
          <h1 className="mt-3 text-4xl font-medium tracking-tight text-gray-900">Connect GitHub</h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-600">
            Let MLSentinel add a scheduled workflow directly to your repository, so your model's
            metrics get sent automatically — even when you're not around to run anything yourself.
          </p>

          <div className="mt-10 rounded-2xl border border-gray-200 p-8">
            {checking ? (
              <p className="text-sm text-gray-500">Checking connection status...</p>
            ) : connected ? (
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-base font-medium text-gray-900">GitHub connected</p>
                  <p className="text-sm text-gray-500">You can now set up automated workflows for your models.</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/github/select-repo")}
                  className="ml-auto h-11 rounded-full bg-gray-900 px-5 text-sm font-medium text-white hover:bg-black"
                >
                  Set up a workflow
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gray-900">
                  <GithubIcon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-medium text-gray-900">Not connected yet</p>
                  <p className="text-sm text-gray-500">
                    A window will open for you to choose which repositories to allow access to.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={connecting}
                  className="h-11 shrink-0 rounded-full bg-gray-900 px-5 text-sm font-medium text-white hover:bg-black disabled:opacity-50"
                >
                  {connecting ? "Connecting..." : "Connect GitHub"}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
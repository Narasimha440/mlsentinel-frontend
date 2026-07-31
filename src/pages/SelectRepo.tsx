import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sidebar } from "../components/dashboard/Sidebar";
import { ChevronRight, BookMarked } from "lucide-react";

interface Repo {
  full_name: string;
  name: string;
  owner: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export default function SelectRepo() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchRepos = async () => {
      const token = await user.getIdToken();
      const res = await fetch(`${API_BASE}/api/github/repos`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "Failed to load repositories");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setRepos(data.repos);
      setLoading(false);
    };

    fetchRepos();
  }, [user]);

  const handleSelect = (repo: Repo) => {
    navigate(`/dashboard/github/setup?owner=${repo.owner}&repo=${repo.name}`);
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
          <h1 className="mt-3 text-4xl font-medium tracking-tight text-gray-900">Choose a repository</h1>
          <p className="mt-4 text-base text-gray-600">
            Pick the repo where MLSentinel should add a scheduled monitoring workflow.
          </p>

          <div className="mt-10 overflow-hidden rounded-2xl border border-gray-200">
            {loading && (
              <p className="px-8 py-16 text-center text-sm text-gray-500">Loading repositories...</p>
            )}

            {!loading && error && (
              <div className="px-8 py-16 text-center">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/github/connect")}
                  className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Go to Connect GitHub →
                </button>
              </div>
            )}

            {!loading && !error && repos.length === 0 && (
              <p className="px-8 py-16 text-center text-sm text-gray-500">No repositories found.</p>
            )}

            {!loading && !error && repos.length > 0 && (
              <ul>
                {repos.map((repo) => (
                  <li key={repo.full_name} className="border-b border-gray-100 last:border-b-0">
                    <button
                      type="button"
                      onClick={() => handleSelect(repo)}
                      className="flex w-full items-center gap-4 px-8 py-6 text-left transition-colors hover:bg-gray-50"
                    >
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gray-50">
                        <BookMarked className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-medium text-gray-900">{repo.name}</p>
                        <p className="text-sm text-gray-500">{repo.owner}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
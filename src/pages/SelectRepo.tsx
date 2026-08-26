import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sidebar } from "../components/dashboard/Sidebar";
import {
  ChevronRight,
  Search,
  RefreshCw,
  GitBranch,
} from "lucide-react";
import { GithubIcon } from "../components/icons/GithubIcon";

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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");


  const fetchRepos = async (isRefresh = false) => {
    if (!user) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = await user.getIdToken();

      const res = await fetch(`${API_BASE}/api/github/repos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(
          data.detail || "Failed to load repositories"
        );
      }

      const data = await res.json();
      setRepos(data.repos || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load repositories"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, [user]);


  const filteredRepos = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return repos;

    return repos.filter((repo) => {
      return (
        repo.name.toLowerCase().includes(query) ||
        repo.owner.toLowerCase().includes(query) ||
        repo.full_name.toLowerCase().includes(query)
      );
    });
  }, [repos, search]);


  const handleSelect = (repo: Repo) => {
    navigate(
      `/dashboard/github/setup?owner=${repo.owner}&repo=${repo.name}`
    );
  };

return (
    <div className="flex min-h-screen bg-white">
      <Sidebar
        userName={user?.displayName || "MLSentinel user"}
        userEmail={user?.email || ""}
        userPhotoUrl={user?.photoURL || undefined}
      />

      <main className="min-h-screen flex-1 bg-white text-gray-900">
        <div className="mx-auto w-full max-w-4xl px-8 py-12 sm:px-12 lg:px-16">

          {/* --------------------------------------------------
              PAGE HEADER
          -------------------------------------------------- */}
          <div className="mb-8">

            {/* Breadcrumb / section context */}
            <div className="mb-5 flex items-center gap-2 text-sm text-gray-500">
              <span>Automation</span>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-gray-700">GitHub</span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-gray-950 sm:text-[34px]">
              Choose a repository
            </h1>

            <p className="mt-3 max-w-2xl text-[15px] leading-6 text-gray-500">
              Pick the repository where MLSentinel should add a
              scheduled monitoring workflow.
            </p>
          </div>

          {/* --------------------------------------------------
              GITHUB CONNECTION
          -------------------------------------------------- */}
          <div className="mb-6 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/60 px-5 py-4">
            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white">
                <GithubIcon className="h-[18px] w-[18px] text-gray-800" />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">
                  GitHub
                </p>

                <p className="text-xs text-gray-500">
                  Connected as{" "}
                  <span className="font-medium text-gray-700">
                    {user?.displayName || user?.email || "GitHub user"}
                  </span>
                </p>
              </div>
            </div>

            <span className="text-xs font-medium text-gray-500">
              Connected
            </span>
          </div>

          {/* --------------------------------------------------
              REPOSITORY SECTION HEADER
          -------------------------------------------------- */}
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Repositories
              </p>

              {!loading && !error && (
                <p className="mt-0.5 text-xs text-gray-500">
                  {filteredRepos.length}{" "}
                  {filteredRepos.length === 1
                    ? "repository"
                    : "repositories"}
                  {search && ` matching "${search}"`}
                </p>
              )}
            </div>

            {/* Refresh */}
            {!loading && !error && (
              <button
                type="button"
                onClick={() => fetchRepos(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </button>
            )}
          </div>

          {/* --------------------------------------------------
              SEARCH
          -------------------------------------------------- */}
          {!loading && !error && repos.length > 0 && (
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search repositories..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
              />
            </div>
          )}

          {/* --------------------------------------------------
              REPOSITORY LIST
          -------------------------------------------------- */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

            {/* Loading */}
            {loading && (
              <div className="px-8 py-16 text-center">
                <div className="mx-auto mb-4 flex h-8 w-8 items-center justify-center">
                  <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
                </div>

                <p className="text-sm text-gray-500">
                  Loading repositories...
                </p>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="px-8 py-16 text-center">

                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <GithubIcon className="h-5 w-5 text-gray-500" />
                </div>

                <p className="text-sm font-medium text-gray-900">
                  Unable to load repositories
                </p>

                <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
                  {error}
                </p>

                <div className="mt-5 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => fetchRepos()}
                    className="text-sm font-medium text-gray-700 hover:text-gray-950"
                  >
                    Try again
                  </button>

                  <span className="text-gray-300">|</span>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/dashboard/github/connect")
                    }
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Connect GitHub
                  </button>
                </div>
              </div>
            )}

            {/* No repositories */}
            {!loading &&
              !error &&
              repos.length === 0 && (
                <div className="px-8 py-16 text-center">

                  <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
                    <GitBranch className="h-5 w-5 text-gray-500" />
                  </div>

                  <p className="text-sm font-medium text-gray-900">
                    No repositories found
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Make sure the connected GitHub account has access
                    to at least one repository.
                  </p>
                </div>
              )}

            {/* No search results */}
            {!loading &&
              !error &&
              repos.length > 0 &&
              filteredRepos.length === 0 && (
                <div className="px-8 py-14 text-center">
                  <Search className="mx-auto mb-3 h-5 w-5 text-gray-400" />

                  <p className="text-sm font-medium text-gray-900">
                    No repositories found
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Try a different search term.
                  </p>
                </div>
              )}

            {/* Repository rows */}
            {!loading &&
              !error &&
              filteredRepos.length > 0 && (
                <ul>
                  {filteredRepos.map((repo) => (
                    <li
                      key={repo.full_name}
                      className="border-b border-gray-100 last:border-b-0"
                    >
                      <button
                        type="button"
                        onClick={() => handleSelect(repo)}
                        className="group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50 sm:px-6"
                      >
                        {/* Repository icon */}
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors group-hover:border-gray-300">
                          <GithubIcon className="h-[17px] w-[17px] text-gray-600 group-hover:text-gray-900" />
                        </div>

                        {/* Repository information */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {repo.name}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-gray-500">
                            {repo.owner}
                          </p>
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
          </div>

          {/* --------------------------------------------------
              FOOTNOTE
          -------------------------------------------------- */}
          {!loading && !error && repos.length > 0 && (
            <p className="mt-4 text-xs leading-5 text-gray-400">
              Select a repository to continue setting up scheduled
              MLSentinel monitoring.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
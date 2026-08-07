import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Sidebar } from "../components/dashboard/Sidebar";
import { Database, AlertTriangle, AlertCircle } from "lucide-react";

interface Finding {
  column: string;
  issue: string;
  severity: "critical" | "warning" | "info";
  detail: string;
}

interface ColumnStat {
  dtype: string;
  null_percentage: number;
  unique_count: number;
  mean?: number;
  std?: number;
  min?: number;
  max?: number;
  outlier_percentage?: number;
  top_value_ratio?: number;
}

interface QualityReport {
  model_id: number;
  model_name: string;
  project_name: string;
  row_count: number;
  column_count: number;
  duplicate_row_percentage: number;
  findings: Finding[];
  columns: Record<string, ColumnStat>;
  checked_at: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const severityStyle: Record<string, string> = {
  critical: "border-red-200 bg-red-50 text-red-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
};

export default function DataQualityPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<QualityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModel, setExpandedModel] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const token = await user.getIdToken();
      const res = await fetch(`${API_BASE}/api/dashboard/data-quality`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setReports(data.reports);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        userName={user?.displayName || "MLSentinel user"}
        userEmail={user?.email || ""}
        userPhotoUrl={user?.photoURL || undefined}
      />

      <main className="min-h-screen flex-1 bg-white text-gray-900">
        <div className="mx-auto max-w-[1280px] px-12 py-16 sm:px-16">
          <p className="text-sm font-medium text-blue-600">Data health</p>
          <h1 className="mt-3 text-4xl font-medium tracking-tight text-gray-900 sm:text-5xl">Data quality</h1>
          <p className="mt-4 text-base text-gray-600">
            Column-level statistics computed locally by the SDK — your raw data never leaves your machine.
          </p>

          {loading ? (
            <p className="mt-12 text-sm text-gray-500">Loading...</p>
          ) : reports.length === 0 ? (
            <div className="mt-12 flex flex-col items-center gap-3 rounded-2xl border border-gray-200 px-8 py-24 text-center">
              <Database className="h-8 w-8 text-gray-400" />
              <p className="text-base font-medium text-gray-900">No data quality reports yet</p>
              <p className="max-w-sm text-sm text-gray-500">
                Call <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">monitor.report_data_quality()</code> from
                the SDK to see column-level stats here.
              </p>
            </div>
          ) : (
            <div className="mt-12 space-y-6">
              {reports.map((r) => {
                const isExpanded = expandedModel === r.model_id;
                return (
                  <div key={r.model_id} className="overflow-hidden rounded-2xl border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setExpandedModel(isExpanded ? null : r.model_id)}
                      className="flex w-full items-center justify-between px-8 py-6 text-left hover:bg-gray-50"
                    >
                      <div>
                        <p className="text-sm font-medium text-blue-600">{r.project_name}</p>
                        <h2 className="mt-1 text-xl font-medium tracking-tight text-gray-900">{r.model_name}</h2>
                        <p className="mt-2 text-sm text-gray-500">
                          {r.row_count.toLocaleString()} rows · {r.column_count} columns · {r.duplicate_row_percentage}% duplicates
                        </p>
                      </div>
                      {r.findings.length > 0 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {r.findings.length} finding{r.findings.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </button>

                    {isExpanded && (
                      <div className="border-t border-gray-100 px-8 py-6">
                        {r.findings.length > 0 && (
                          <div className="mb-6 space-y-2">
                            {r.findings.map((f, i) => (
                              <div key={i} className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${severityStyle[f.severity]}`}>
                                {f.severity === "critical" ? (
                                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                ) : (
                                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                )}
                                <div>
                                  <p className="text-sm font-medium">{f.column}</p>
                                  <p className="text-sm">{f.detail}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="border-b border-gray-100 text-xs font-medium uppercase tracking-wide text-gray-500">
                              <th className="py-3 pr-4">Column</th>
                              <th className="py-3 pr-4">Type</th>
                              <th className="py-3 pr-4">Missing</th>
                              <th className="py-3 pr-4">Unique</th>
                              <th className="py-3 pr-4">Mean</th>
                              <th className="py-3 pr-4">Outliers</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(r.columns).map(([colName, stat]) => (
                              <tr key={colName} className="border-b border-gray-50 last:border-b-0">
                                <td className="py-3 pr-4 font-medium text-gray-900">{colName}</td>
                                <td className="py-3 pr-4 text-gray-600">{stat.dtype}</td>
                                <td className="py-3 pr-4 text-gray-600">{stat.null_percentage}%</td>
                                <td className="py-3 pr-4 text-gray-600">{stat.unique_count}</td>
                                <td className="py-3 pr-4 text-gray-600">{stat.mean ?? "—"}</td>
                                <td className="py-3 pr-4 text-gray-600">
                                  {stat.outlier_percentage !== undefined ? `${stat.outlier_percentage}%` : "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
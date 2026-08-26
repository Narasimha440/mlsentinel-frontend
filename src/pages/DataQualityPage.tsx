import { Fragment, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Database,
  Info,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { Sidebar } from "../components/dashboard/Sidebar";

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

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

const severityBadgeClass: Record<Finding["severity"], string> = {
  critical: "border-red-200 bg-red-50 text-red-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
};

function formatNumber(
  value: number | undefined,
  digits = 2
) {
  if (value === undefined || value === null) {
    return "—";
  }

  return Number(value).toFixed(digits);
}

function formatDate(value: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatPercentage(value: number) {
  return `${formatNumber(value)}%`;
}

export default function DataQualityPage() {
  const { user } = useAuth();

  const [reports, setReports] = useState<QualityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModel, setExpandedModel] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchReports = async () => {
      try {
        setLoading(true);

        const token = await user.getIdToken();

        const response = await fetch(
          `${API_BASE}/api/dashboard/data-quality`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch data quality reports: ${response.status}`
          );
        }

        const data = await response.json();

        if (!cancelled) {
          setReports(
            Array.isArray(data.reports)
              ? data.reports
              : []
          );
        }
      } catch (error) {
        console.error(
          "Failed to load data quality reports:",
          error
        );

        if (!cancelled) {
          setReports([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchReports();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const summary = useMemo(() => {
    const totalModels = reports.length;

    const totalFindings = reports.reduce(
      (total, report) =>
        total + report.findings.length,
      0
    );

    const criticalFindings = reports.reduce(
      (total, report) =>
        total +
        report.findings.filter(
          (finding) =>
            finding.severity === "critical"
        ).length,
      0
    );

    const warningFindings = reports.reduce(
      (total, report) =>
        total +
        report.findings.filter(
          (finding) =>
            finding.severity === "warning"
        ).length,
      0
    );

    const infoFindings = reports.reduce(
      (total, report) =>
        total +
        report.findings.filter(
          (finding) =>
            finding.severity === "info"
        ).length,
      0
    );

    const totalColumns = reports.reduce(
      (total, report) =>
        total + report.column_count,
      0
    );

    const averageDuplicatePercentage =
      totalModels > 0
        ? reports.reduce(
            (total, report) =>
              total +
              report.duplicate_row_percentage,
            0
          ) / totalModels
        : 0;

    return {
      totalModels,
      totalFindings,
      criticalFindings,
      warningFindings,
      infoFindings,
      totalColumns,
      averageDuplicatePercentage,
    };
  }, [reports]);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar
        userName={
          user?.displayName ||
          "MLSentinel user"
        }
        userEmail={user?.email || ""}
        userPhotoUrl={
          user?.photoURL || undefined
        }
      />

      <main className="min-h-screen min-w-0 flex-1 bg-white text-gray-900">
        <div className="mx-auto w-full max-w-[1500px] px-6 py-12 lg:px-10 xl:px-12 lg:py-16">
          <div>
            <p className="text-sm font-medium text-blue-600">
              Data health
            </p>

            <h1 className="mt-3 text-4xl font-medium tracking-tight text-gray-900 sm:text-5xl">
              Data quality
            </h1>

            <p className="mt-4 max-w-3xl text-base text-gray-600">
              Column-level statistics computed locally
              by the SDK — your raw data never leaves
              your machine.
            </p>
          </div>

          {loading ? (
            <div className="mt-12 flex h-48 items-center justify-center rounded-xl border border-gray-200">
              <p className="text-sm text-gray-500">
                Loading data quality reports...
              </p>
            </div>
          ) : reports.length === 0 ? (
            <div className="mt-12 flex flex-col items-center gap-3 rounded-xl border border-gray-200 px-8 py-24 text-center">
              <Database className="h-8 w-8 text-gray-400" />

              <p className="text-base font-medium text-gray-900">
                No data quality reports yet
              </p>

              <p className="max-w-md text-sm leading-6 text-gray-500">
                Call{" "}
                <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700">
                  monitor.report_data_quality()
                </code>{" "}
                from the SDK to see column-level
                statistics here.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-gray-200 bg-white px-5 py-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Models
                  </p>

                  <p className="mt-2 text-2xl font-medium tracking-tight text-gray-900">
                    {summary.totalModels}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Models reporting data quality
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white px-5 py-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Findings
                  </p>

                  <p className="mt-2 text-2xl font-medium tracking-tight text-gray-900">
                    {summary.totalFindings}
                  </p>

                  <div className="mt-2 flex items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-1.5 text-red-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      {summary.criticalFindings} critical
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-amber-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      {summary.warningFindings} warning
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white px-5 py-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Columns
                  </p>

                  <p className="mt-2 text-2xl font-medium tracking-tight text-gray-900">
                    {summary.totalColumns.toLocaleString()}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Columns across all models
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white px-5 py-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Avg. duplicates
                  </p>

                  <p className="mt-2 text-2xl font-medium tracking-tight text-gray-900">
                    {formatPercentage(
                      summary.averageDuplicatePercentage
                    )}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Average duplicate rows
                  </p>
                </div>
              </div>

              {summary.totalFindings > 0 && (
                <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/50 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-gray-500" />

                    <span className="text-sm font-medium text-gray-700">
                      Quality findings
                    </span>
                  </div>

                  <span className="h-4 w-px bg-gray-200" />

                  <span className="inline-flex items-center gap-2 text-sm text-red-600">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    {summary.criticalFindings} critical
                  </span>

                  <span className="inline-flex items-center gap-2 text-sm text-amber-600">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    {summary.warningFindings} warning
                  </span>

                  <span className="inline-flex items-center gap-2 text-sm text-blue-600">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    {summary.infoFindings} info
                  </span>
                </div>
              )}

              <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[1100px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/70">
                        <th className="h-12 px-6 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Model
                        </th>

                        <th className="h-12 px-6 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Rows
                        </th>

                        <th className="h-12 px-6 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Columns
                        </th>

                        <th className="h-12 px-6 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Duplicates
                        </th>

                        <th className="h-12 px-6 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Findings
                        </th>

                        <th className="h-12 px-6 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Last checked
                        </th>

                        <th className="h-12 w-12 px-4" />
                      </tr>
                    </thead>

                    <tbody>
                      {reports.map((report) => {
                        const isExpanded =
                          expandedModel ===
                          report.model_id;

                        const criticalCount =
                          report.findings.filter(
                            (finding) =>
                              finding.severity ===
                              "critical"
                          ).length;

                        const warningCount =
                          report.findings.filter(
                            (finding) =>
                              finding.severity ===
                              "warning"
                          ).length;

                        const infoCount =
                          report.findings.filter(
                            (finding) =>
                              finding.severity ===
                              "info"
                          ).length;

                        return (
                          <Fragment
                            key={report.model_id}
                          >
                            <tr
                              onClick={() =>
                                setExpandedModel(
                                  isExpanded
                                    ? null
                                    : report.model_id
                                )
                              }
                              className="group cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50"
                            >
                              <td className="px-6 py-5">
                                <div className="flex flex-col">
                                  <span className="text-[15px] font-medium text-gray-900">
                                    {report.model_name}
                                  </span>

                                  <span className="mt-1 text-xs text-gray-400">
                                    {report.project_name}
                                  </span>
                                </div>
                              </td>

                              <td className="px-6 py-5">
                                <span className="text-[15px] font-medium text-gray-700">
                                  {report.row_count.toLocaleString()}
                                </span>
                              </td>

                              <td className="px-6 py-5">
                                <span className="text-[15px] text-gray-700">
                                  {report.column_count}
                                </span>
                              </td>

                              <td className="px-6 py-5">
                                <span
                                  className={`text-[15px] font-medium ${
                                    report.duplicate_row_percentage >
                                    5
                                      ? "text-red-600"
                                      : report.duplicate_row_percentage >
                                        1
                                      ? "text-amber-600"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {formatPercentage(
                                    report.duplicate_row_percentage
                                  )}
                                </span>
                              </td>

                              <td className="px-6 py-5">
                                {report.findings.length ===
                                0 ? (
                                  <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Healthy
                                  </span>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    {criticalCount > 0 && (
                                      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                        {criticalCount}
                                      </span>
                                    )}

                                    {warningCount > 0 && (
                                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                        {warningCount}
                                      </span>
                                    )}

                                    {infoCount > 0 && (
                                      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                        {infoCount}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>

                              <td className="px-6 py-5">
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-gray-700">
                                    {formatDate(
                                      report.checked_at
                                    )}
                                  </span>

                                  <span className="mt-1 text-xs text-gray-400">
                                    {formatTime(
                                      report.checked_at
                                    )}
                                  </span>
                                </div>
                              </td>

                              <td className="px-4 py-5">
                                <div className="flex justify-end">
                                  {isExpanded ? (
                                    <ChevronDown className="h-5 w-5 text-gray-400" />
                                  ) : (
                                    <ChevronRight className="h-5 w-5 text-gray-300 transition-colors group-hover:text-gray-500" />
                                  )}
                                </div>
                              </td>
                            </tr>

                            {isExpanded && (
                              <tr>
                                <td
                                  colSpan={7}
                                  className="border-b border-gray-200 bg-gray-50/30 px-6 py-6"
                                >
                                  {report.findings.length >
                                    0 && (
                                    <div className="mb-8">
                                      <div className="mb-4 flex items-center justify-between">
                                        <div>
                                          <h3 className="text-sm font-semibold text-gray-900">
                                            Quality findings
                                          </h3>

                                          <p className="mt-1 text-xs text-gray-500">
                                            Issues detected in
                                            this dataset.
                                          </p>
                                        </div>

                                        <span className="text-xs text-gray-400">
                                          {
                                            report
                                              .findings
                                              .length
                                          }{" "}
                                          {report.findings
                                            .length === 1
                                            ? "finding"
                                            : "findings"}
                                        </span>
                                      </div>

                                      <div className="space-y-2">
                                        {report.findings.map(
                                          (
                                            finding,
                                            index
                                          ) => (
                                            <div
                                              key={`${finding.column}-${index}`}
                                              className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${severityBadgeClass[finding.severity]}`}
                                            >
                                              <div className="mt-0.5 shrink-0">
                                                {finding.severity ===
                                                "critical" ? (
                                                  <AlertCircle className="h-4 w-4" />
                                                ) : finding.severity ===
                                                  "warning" ? (
                                                  <AlertTriangle className="h-4 w-4" />
                                                ) : (
                                                  <Info className="h-4 w-4" />
                                                )}
                                              </div>

                                              <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                  <p className="text-sm font-semibold">
                                                    {
                                                      finding.column
                                                    }
                                                  </p>

                                                  <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                                                    {
                                                      finding.severity
                                                    }
                                                  </span>
                                                </div>

                                                <p className="mt-1 text-sm">
                                                  {
                                                    finding.detail
                                                  }
                                                </p>

                                                {finding.issue && (
                                                  <p className="mt-1 text-xs opacity-70">
                                                    {
                                                      finding.issue
                                                    }
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {report.findings.length ===
                                    0 && (
                                    <div className="mb-8 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-4">
                                      <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />

                                      <div>
                                        <p className="text-sm font-medium text-green-800">
                                          No quality issues
                                          detected
                                        </p>

                                        <p className="mt-1 text-xs text-green-700">
                                          The latest quality
                                          check did not find
                                          any reported
                                          problems.
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  <div>
                                    <div className="mb-4 flex items-center justify-between">
                                      <div>
                                        <h3 className="text-sm font-semibold text-gray-900">
                                          Column statistics
                                        </h3>

                                        <p className="mt-1 text-xs text-gray-500">
                                          Statistics calculated
                                          locally by the SDK.
                                        </p>
                                      </div>

                                      <span className="text-xs text-gray-400">
                                        {report.column_count}{" "}
                                        columns
                                      </span>
                                    </div>

                                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                                      <div className="max-h-[520px] overflow-auto">
                                        <table className="w-full min-w-[1050px] border-collapse text-left">
                                          <thead className="sticky top-0 z-10">
                                            <tr className="border-b border-gray-200 bg-gray-50">
                                              <th className="h-11 px-5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Column
                                              </th>

                                              <th className="h-11 px-5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Type
                                              </th>

                                              <th className="h-11 px-5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Missing
                                              </th>

                                              <th className="h-11 px-5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Unique
                                              </th>

                                              <th className="h-11 px-5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Mean
                                              </th>

                                              <th className="h-11 px-5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Std
                                              </th>

                                              <th className="h-11 px-5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Min
                                              </th>

                                              <th className="h-11 px-5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Max
                                              </th>

                                              <th className="h-11 px-5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Outliers
                                              </th>

                                              <th className="h-11 px-5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Top value
                                              </th>
                                            </tr>
                                          </thead>

                                          <tbody>
                                            {Object.entries(
                                              report.columns
                                            ).map(
                                              ([
                                                columnName,
                                                stat,
                                              ]) => (
                                                <tr
                                                  key={
                                                    columnName
                                                  }
                                                  className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50"
                                                >
                                                  <td className="px-5 py-4">
                                                    <span className="text-sm font-medium text-gray-900">
                                                      {
                                                        columnName
                                                      }
                                                    </span>
                                                  </td>

                                                  <td className="px-5 py-4">
                                                    <span className="rounded-md bg-gray-100 px-2 py-1 font-mono text-xs text-gray-600">
                                                      {
                                                        stat.dtype
                                                      }
                                                    </span>
                                                  </td>

                                                  <td className="px-5 py-4">
                                                    <span
                                                      className={`text-sm font-medium ${
                                                        stat.null_percentage >
                                                        5
                                                          ? "text-red-600"
                                                          : stat.null_percentage >
                                                            1
                                                          ? "text-amber-600"
                                                          : "text-gray-700"
                                                      }`}
                                                    >
                                                      {formatPercentage(
                                                        stat.null_percentage
                                                      )}
                                                    </span>
                                                  </td>

                                                  <td className="px-5 py-4">
                                                    <span className="text-sm text-gray-700">
                                                      {stat.unique_count.toLocaleString()}
                                                    </span>
                                                  </td>

                                                  <td className="px-5 py-4">
                                                    <span className="font-mono text-sm text-gray-700">
                                                      {formatNumber(
                                                        stat.mean
                                                      )}
                                                    </span>
                                                  </td>

                                                  <td className="px-5 py-4">
                                                    <span className="font-mono text-sm text-gray-700">
                                                      {formatNumber(
                                                        stat.std
                                                      )}
                                                    </span>
                                                  </td>

                                                  <td className="px-5 py-4">
                                                    <span className="font-mono text-sm text-gray-700">
                                                      {formatNumber(
                                                        stat.min
                                                      )}
                                                    </span>
                                                  </td>

                                                  <td className="px-5 py-4">
                                                    <span className="font-mono text-sm text-gray-700">
                                                      {formatNumber(
                                                        stat.max
                                                      )}
                                                    </span>
                                                  </td>

                                                  <td className="px-5 py-4">
                                                    {stat.outlier_percentage !==
                                                    undefined ? (
                                                      <span
                                                        className={`text-sm font-medium ${
                                                          stat.outlier_percentage >
                                                          5
                                                            ? "text-red-600"
                                                            : stat.outlier_percentage >
                                                              1
                                                            ? "text-amber-600"
                                                            : "text-gray-700"
                                                        }`}
                                                      >
                                                        {formatPercentage(
                                                          stat.outlier_percentage
                                                        )}
                                                      </span>
                                                    ) : (
                                                      <span className="text-sm text-gray-400">
                                                        —
                                                      </span>
                                                    )}
                                                  </td>

                                                  <td className="px-5 py-4">
                                                    {stat.top_value_ratio !==
                                                    undefined ? (
                                                      <span className="text-sm text-gray-700">
                                                        {formatPercentage(
                                                          stat.top_value_ratio
                                                        )}
                                                      </span>
                                                    ) : (
                                                      <span className="text-sm text-gray-400">
                                                        —
                                                      </span>
                                                    )}
                                                  </td>
                                                </tr>
                                              )
                                            )}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
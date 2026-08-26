import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import type {
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";

import { Boxes, ChevronRight } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { Sidebar } from "../components/dashboard/Sidebar";

interface ModelRow {
  id: number;
  name: string;
  project_id: number;
  project_name: string;
  health_score: number | null;
  status: "Healthy" | "Warning" | "Critical";
  schedule_frequency: string;
  last_run_at: string | null;
  created_at: string;
}

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

const statusDot: Record<ModelRow["status"], string> = {
  Healthy: "bg-green-500",
  Warning: "bg-amber-500",
  Critical: "bg-red-500",
};

const statusBadgeClass: Record<
  ModelRow["status"],
  string
> = {
  Healthy:
    "border-green-200 bg-green-50 text-green-700",

  Warning:
    "border-amber-200 bg-amber-50 text-amber-700",

  Critical:
    "border-red-200 bg-red-50 text-red-600",
};

export default function ModelsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [models, setModels] = useState<ModelRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] =
    useState<
      "all" | "Healthy" | "Warning" | "Critical"
    >("all");

  const [sorting, setSorting] =
    useState<SortingState>([]);

  /*
   * --------------------------------------------------
   * FETCH MODELS
   * --------------------------------------------------
   */

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchModels = async () => {
      try {
        setLoading(true);

        const token = await user.getIdToken();

        const response = await fetch(
          `${API_BASE}/api/dashboard/models`,
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
            `Failed to fetch models: ${response.status}`
          );
        }

        const data = await response.json();

        if (!cancelled) {
          setModels(
            Array.isArray(data.models)
              ? data.models
              : []
          );
        }
      } catch (error) {
        console.error(
          "Failed to load models:",
          error
        );

        if (!cancelled) {
          setModels([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchModels();

    return () => {
      cancelled = true;
    };
  }, [user]);

  /*
   * --------------------------------------------------
   * STATUS COUNTS
   * --------------------------------------------------
   */

  const counts = useMemo(
    () => ({
      Healthy: models.filter(
        (model) => model.status === "Healthy"
      ).length,

      Warning: models.filter(
        (model) => model.status === "Warning"
      ).length,

      Critical: models.filter(
        (model) => model.status === "Critical"
      ).length,
    }),
    [models]
  );

  /*
   * --------------------------------------------------
   * STATUS FILTER
   * --------------------------------------------------
   */

  const filteredModels = useMemo(() => {
    if (statusFilter === "all") {
      return models;
    }

    return models.filter(
      (model) =>
        model.status === statusFilter
    );
  }, [models, statusFilter]);

  /*
   * --------------------------------------------------
   * TABLE COLUMNS
   * --------------------------------------------------
   */

  const columns = useMemo<
    ColumnDef<ModelRow>[]
  >(
    () => [
      /*
       * MODEL
       */
      {
        accessorKey: "name",

        header: "Model",

        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-[15px] font-medium text-gray-900">
              {row.original.name}
            </span>

            <span className="mt-1 text-xs text-gray-400">
              #{row.original.id}
            </span>
          </div>
        ),
      },

      /*
       * PROJECT
       */
      {
        accessorKey: "project_name",

        header: "Project",

        cell: ({ row }) => (
          <span className="text-[15px] font-medium text-gray-700">
            {row.original.project_name}
          </span>
        ),
      },

      /*
       * HEALTH
       */
      {
        accessorKey: "health_score",

        header: "Health",

        sortingFn: (rowA, rowB) => {
          const a =
            rowA.original.health_score ?? -1;

          const b =
            rowB.original.health_score ?? -1;

          return a - b;
        },

        cell: ({ row }) => {
          const score =
            row.original.health_score;

          if (score === null) {
            return (
              <span className="text-[15px] text-gray-400">
                —
              </span>
            );
          }

          const normalizedScore =
            Math.min(
              Math.max(score, 0),
              100
            );

          return (
            <div className="flex items-center gap-4">
              <span className="min-w-[58px] text-[15px] font-medium text-gray-900">
                {score}%
              </span>

              <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gray-900 transition-all duration-300"
                  style={{
                    width: `${normalizedScore}%`,
                  }}
                />
              </div>
            </div>
          );
        },
      },

      /*
       * STATUS
       */
      {
        accessorKey: "status",

        header: "Status",

        enableSorting: false,

        cell: ({ row }) => {
          const status =
            row.original.status;

          return (
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium ${statusBadgeClass[status]}`}
            >
              <span
                className={`h-2 w-2 rounded-full ${statusDot[status]}`}
              />

              {status}
            </span>
          );
        },
      },

      /*
       * SCHEDULE
       */
      {
        accessorKey:
          "schedule_frequency",

        header: "Schedule",

        enableSorting: false,

        cell: ({ row }) => (
          <span className="text-[15px] font-medium capitalize text-gray-700">
            {row.original.schedule_frequency}
          </span>
        ),
      },

      /*
       * ACTION
       */
      {
        id: "actions",

        header: "",

        enableSorting: false,

        cell: ({ row }) => (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();

                navigate(
                  `/dashboard?model_id=${row.original.id}`
                );
              }}
              className="rounded-full p-2 text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label={`Open ${row.original.name}`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        ),
      },
    ],
    [navigate]
  );

  /*
   * --------------------------------------------------
   * TANSTACK TABLE
   * --------------------------------------------------
   */

  const table = useReactTable({
    data: filteredModels,

    columns,

    state: {
      sorting,
    },

    onSortingChange: setSorting,

    getCoreRowModel:
      getCoreRowModel(),

    getSortedRowModel:
      getSortedRowModel(),

    getPaginationRowModel:
      getPaginationRowModel(),

    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
  });

  /*
   * --------------------------------------------------
   * RENDER
   * --------------------------------------------------
   */

  return (
    <div className="flex min-h-screen bg-white">

      {/* SIDEBAR */}

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

      {/* MAIN */}

      <main className="min-h-screen min-w-0 flex-1 bg-white text-gray-900">

        <div className="mx-auto w-full max-w-[1500px] px-6 py-12 lg:px-10 xl:px-12 lg:py-16">

          {/* PAGE HEADER */}

          <p className="text-sm font-medium text-blue-600">
            Overview
          </p>

          <h1 className="mt-3 text-4xl font-medium tracking-tight text-gray-900 sm:text-5xl">
            Models
          </h1>

          <p className="mt-4 text-base text-gray-600">
            Every model you're tracking, across all projects.
          </p>

          {/* STATUS FILTERS */}

          {!loading &&
            models.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">

                {/* ALL */}

                <button
                  type="button"
                  onClick={() =>
                    setStatusFilter("all")
                  }
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    statusFilter === "all"
                      ? "bg-gray-900 text-white"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  All ({models.length})
                </button>

                {/* HEALTHY / WARNING / CRITICAL */}

                {(
                  [
                    "Healthy",
                    "Warning",
                    "Critical",
                  ] as const
                ).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() =>
                      setStatusFilter(status)
                    }
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      statusFilter === status
                        ? "bg-gray-900 text-white"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${statusDot[status]}`}
                    />

                    {status} ({counts[status]})
                  </button>
                ))}
              </div>
            )}

          {/* TABLE CONTAINER */}

          <div className="mt-10 w-full overflow-hidden rounded-xl border border-gray-200 bg-white">

            {/* LOADING */}

            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <p className="text-sm text-gray-500">
                  Loading models...
                </p>
              </div>
            ) : filteredModels.length === 0 ? (

              /* EMPTY */

              <div className="flex flex-col items-center gap-3 px-8 py-24 text-center">

                <Boxes className="h-8 w-8 text-gray-400" />

                <p className="text-base font-medium text-gray-900">
                  {models.length === 0
                    ? "No models yet"
                    : "No models match this filter"}
                </p>

                {models.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Add a model through onboarding to get started.
                  </p>
                )}
              </div>
            ) : (
              <>
                {/* HORIZONTAL SCROLL */}

                <div className="w-full overflow-x-auto">
                  <div className="max-h-[520px]">

                    <table className="w-full min-w-[1050px] border-collapse text-left">

                      {/* HEADER */}

                      <thead>
                        {table
                          .getHeaderGroups()
                          .map((headerGroup) => (
                            <tr
                              key={headerGroup.id}
                              className="border-b border-gray-200 bg-gray-50/70"
                            >
                              {headerGroup.headers.map(
                                (header) => {
                                  const isSortable =
                                    header.column.getCanSort();

                                  const sorted =
                                    header.column.getIsSorted();

                                  return (
                                    <th
                                      key={header.id}
                                      onClick={
                                        isSortable
                                          ? header.column.getToggleSortingHandler()
                                          : undefined
                                      }
                                      className={`
                                        h-12
                                        px-6
                                        text-left
                                        align-middle
                                        text-xs
                                        font-semibold
                                        uppercase
                                        tracking-wide
                                        text-gray-500
                                        ${
                                          isSortable
                                            ? "cursor-pointer select-none hover:text-gray-900"
                                            : ""
                                        }
                                      `}
                                    >
                                      <div className="flex items-center gap-2">

                                        {header.isPlaceholder
                                          ? null
                                          : flexRender(
                                              header
                                                .column
                                                .columnDef
                                                .header,
                                              header.getContext()
                                            )}

                                        {isSortable && (
                                          <span className="flex flex-col leading-[7px]">

                                            <span
                                              className={
                                                sorted ===
                                                "asc"
                                                  ? "text-gray-700"
                                                  : "text-gray-300"
                                              }
                                            >
                                              ▲
                                            </span>

                                            <span
                                              className={
                                                sorted ===
                                                "desc"
                                                  ? "text-gray-700"
                                                  : "text-gray-300"
                                              }
                                            >
                                              ▼
                                            </span>

                                          </span>
                                        )}

                                      </div>
                                    </th>
                                  );
                                }
                              )}
                            </tr>
                          ))}
                      </thead>

                      {/* BODY */}

                      <tbody>
                        {table
                          .getRowModel()
                          .rows.map((row) => (
                            <tr
                              key={row.id}
                              onClick={() =>
                                navigate(
                                  `/dashboard?model_id=${row.original.id}`
                                )
                              }
                              className="group cursor-pointer border-b border-gray-100 transition-colors last:border-b-0 hover:bg-gray-50"
                            >
                              {row
                                .getVisibleCells()
                                .map((cell) => (
                                  <td
                                    key={cell.id}
                                    className="h-[68px] px-6 align-middle"
                                  >
                                    {flexRender(
                                      cell.column
                                        .columnDef.cell,
                                      cell.getContext()
                                    )}
                                  </td>
                                ))}
                            </tr>
                          ))}
                      </tbody>

                    </table>
                  </div>
                </div>

                {/* PAGINATION */}

                {table.getPageCount() > 1 && (
                  <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">

                    <p className="text-sm text-gray-500">
                      Page{" "}

                      <span className="font-medium text-gray-900">
                        {table.getState()
                          .pagination
                          .pageIndex + 1}
                      </span>

                      {" "}of{" "}

                      <span className="font-medium text-gray-900">
                        {table.getPageCount()}
                      </span>
                    </p>

                    <div className="flex gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          table.previousPage()
                        }
                        disabled={
                          !table.getCanPreviousPage()
                        }
                        className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Previous
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          table.nextPage()
                        }
                        disabled={
                          !table.getCanNextPage()
                        }
                        className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next
                      </button>

                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
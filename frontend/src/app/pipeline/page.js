"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Loader2,
  Users,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getStats } from "@/services/api";

const stages = [
  {
    key: "Applied",
    label: "Applied",
    icon: Users,
    color: "blue",
  },
  {
    key: "Screening",
    label: "Screening",
    icon: Clock3,
    color: "amber",
  },
  {
    key: "Interview",
    label: "Interview",
    icon: BriefcaseBusiness,
    color: "violet",
  },
  {
    key: "Selected",
    label: "Selected",
    icon: CheckCircle2,
    color: "green",
  },
  {
    key: "Rejected",
    label: "Rejected",
    icon: XCircle,
    color: "red",
  },
];

function getColorClasses(color) {
  const colors = {
    blue: {
      icon: "bg-blue-50 text-blue-600",
      bar: "bg-blue-600",
      badge: "bg-blue-50 text-blue-700",
    },
    amber: {
      icon: "bg-amber-50 text-amber-600",
      bar: "bg-amber-500",
      badge: "bg-amber-50 text-amber-700",
    },
    violet: {
      icon: "bg-violet-50 text-violet-600",
      bar: "bg-violet-600",
      badge: "bg-violet-50 text-violet-700",
    },
    green: {
      icon: "bg-green-50 text-green-600",
      bar: "bg-green-600",
      badge: "bg-green-50 text-green-700",
    },
    red: {
      icon: "bg-red-50 text-red-600",
      bar: "bg-red-500",
      badge: "bg-red-50 text-red-700",
    },
  };

  return colors[color] || colors.blue;
}

export default function PipelinePage() {
  const router = useRouter();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadPipeline() {
      try {
        setLoading(true);
        setError("");

        const data = await getStats();

        if (!mounted) return;

        setStats(data);
      } catch (err) {
        console.error("Pipeline loading error:", err);

        if (mounted) {
          setError(
            err?.message || "Failed to load recruitment pipeline."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPipeline();

    return () => {
      mounted = false;
    };
  }, []);

  const pipeline = useMemo(() => {
    const source = stats?.pipeline || {};

    return stages.map((stage) => {
      let count = 0;
      if (stage.key === "Selected") {
        count = Number(
          source["Selected"] ??
          source["Hired"] ??
          stats?.selected ??
          stats?.hired ??
          0
        );
      } else if (stage.key === "Interview") {
        count = Number(
          source["Interview"] ??
          stats?.interviews ??
          0
        );
      } else {
        count = Number(source[stage.key] || 0);
      }

      return {
        ...stage,
        count,
      };
    });
  }, [stats]);

  const totalCandidates = Number(
    stats?.totalCandidates || 0
  );

  const activeStages = pipeline.filter(
    (stage) =>
      stage.key !== "Selected" &&
      stage.key !== "Rejected"
  );

  const activeCandidates = activeStages.reduce(
    (sum, stage) => sum + stage.count,
    0
  );

  const selected = Number(
    stats?.pipeline?.Selected ??
    stats?.pipeline?.Hired ??
    stats?.selected ??
    stats?.hired ??
    0
  );

  const rejected = Number(
    stats?.pipeline?.Rejected || 0
  );

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="mx-auto max-w-7xl space-y-8">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="transition hover:text-blue-600"
                >
                  Dashboard
                </button>

                <span>/</span>

                <span className="font-medium text-blue-600">
                  Pipeline
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Recruitment Pipeline
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Track candidates through every stage of your
                recruitment workflow.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <ArrowLeft size={17} />
              Back to Dashboard
            </button>
          </motion.div>

          {/* Loading */}
          {loading && (
            <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <Loader2
                  size={20}
                  className="animate-spin text-blue-600"
                />
                Loading recruitment pipeline...
              </div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <div className="flex items-start gap-3">
                <XCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div>
                  <h2 className="font-semibold text-red-800">
                    Unable to load pipeline
                  </h2>

                  <p className="mt-1 text-sm text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {!loading && !error && (
            <>
              {/* Summary cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <SummaryCard
                  icon={Users}
                  label="Total Candidates"
                  value={totalCandidates}
                  color="blue"
                />

                <SummaryCard
                  icon={Clock3}
                  label="Active Pipeline"
                  value={activeCandidates}
                  color="amber"
                />

                <SummaryCard
                  icon={CheckCircle2}
                  label="Selected"
                  value={selected}
                  color="green"
                />

                <SummaryCard
                  icon={XCircle}
                  label="Rejected"
                  value={rejected}
                  color="red"
                />

              </div>

              {/* Pipeline */}
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="mb-7">
                  <h2 className="text-xl font-bold text-slate-900">
                    Candidate Pipeline
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Current distribution of candidates across
                    recruitment stages.
                  </p>
                </div>

                {totalCandidates === 0 ? (
                  <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                      <Users
                        size={24}
                        className="text-slate-400"
                      />
                    </div>

                    <h3 className="font-semibold text-slate-700">
                      No candidates yet
                    </h3>

                    <p className="mt-1 max-w-md text-sm text-slate-500">
                      Add candidates to start tracking your
                      recruitment pipeline.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        router.push("/candidates")
                      }
                      className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Go to Candidates
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">

                    {pipeline.map((stage, index) => {
                      const Icon = stage.icon;
                      const colors =
                        getColorClasses(stage.color);

                      const percentage =
                        totalCandidates > 0
                          ? Math.round(
                              (stage.count /
                                totalCandidates) *
                                100
                            )
                          : 0;

                      return (
                        <motion.div
                          key={stage.key}
                          initial={{
                            opacity: 0,
                            x: -10,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          transition={{
                            duration: 0.25,
                            delay: index * 0.05,
                          }}
                        >
                          <div className="mb-2 flex items-center justify-between">

                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.icon}`}
                              >
                                <Icon size={18} />
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  {stage.label}
                                </p>

                                <p className="text-xs text-slate-500">
                                  {stage.count}{" "}
                                  {stage.count === 1
                                    ? "candidate"
                                    : "candidates"}
                                </p>
                              </div>
                            </div>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${colors.badge}`}
                            >
                              {percentage}%
                            </span>
                          </div>

                          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                            <motion.div
                              initial={{
                                width: 0,
                              }}
                              animate={{
                                width: `${percentage}%`,
                              }}
                              transition={{
                                duration: 0.6,
                                delay:
                                  index * 0.05,
                              }}
                              className={`h-full rounded-full ${colors.bar}`}
                            />
                          </div>
                        </motion.div>
                      );
                    })}

                  </div>
                )}
              </section>

              {/* Stage cards */}
              <section>
                <div className="mb-5">
                  <h2 className="text-xl font-bold text-slate-900">
                    Pipeline Stages
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Detailed view of every recruitment stage.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">

                  {pipeline.map((stage) => {
                    const Icon = stage.icon;
                    const colors =
                      getColorClasses(stage.color);

                    const percentage =
                      totalCandidates > 0
                        ? Math.round(
                            (stage.count /
                              totalCandidates) *
                              100
                          )
                        : 0;

                    return (
                      <motion.div
                        key={stage.key}
                        whileHover={{ y: -3 }}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-center justify-between">

                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.icon}`}
                          >
                            <Icon size={18} />
                          </div>

                          <span className="text-xs font-semibold text-slate-400">
                            {percentage}%
                          </span>
                        </div>

                        <p className="mt-5 text-sm font-medium text-slate-500">
                          {stage.label}
                        </p>

                        <p className="mt-1 text-3xl font-bold text-slate-900">
                          {stage.count}
                        </p>

                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${colors.bar}`}
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}

                </div>
              </section>

              {/* Conversion overview */}
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900">
                    Pipeline Overview
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    High-level recruitment funnel metrics.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">

                  <OverviewMetric
                    label="Screening Rate"
                    value={
                      totalCandidates
                        ? Math.round(
                            ((pipeline.find(
                              (item) =>
                                item.key ===
                                "Screening"
                            )?.count || 0) /
                              totalCandidates) *
                              100
                          )
                        : 0
                    }
                    suffix="%"
                    description="Candidates currently in screening"
                  />

                  <OverviewMetric
                    label="Interview Rate"
                    value={
                      totalCandidates
                        ? Math.round(
                            ((pipeline.find(
                              (item) =>
                                item.key ===
                                "Interview"
                            )?.count || 0) /
                              totalCandidates) *
                              100
                          )
                        : 0
                    }
                    suffix="%"
                    description="Candidates currently in interview"
                  />

                  <OverviewMetric
                    label="Selection Rate"
                    value={
                      totalCandidates
                        ? Math.round(
                            (selected /
                              totalCandidates) *
                              100
                          )
                        : 0
                    }
                    suffix="%"
                    description="Candidates selected from total"
                  />

                </div>
              </section>
            </>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  color,
}) {
  const colors = getColorClasses(color);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors.icon}`}
        >
          <Icon size={20} />
        </div>
      </div>
    </motion.div>
  );
}

function OverviewMetric({
  label,
  value,
  suffix,
  description,
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-slate-900">
          {value}
        </span>

        <span className="text-lg font-semibold text-slate-500">
          {suffix}
        </span>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}
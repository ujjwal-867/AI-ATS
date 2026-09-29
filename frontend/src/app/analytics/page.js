"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import {
  Activity,
  ArrowLeft,
  BarChart3,
  Briefcase,
  CheckCircle2,
  Download,
  Loader2,
  PieChart as PieChartIcon,
  Target,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

import { useRouter } from "next/navigation";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";

import { getAnalytics } from "@/services/analytics.service";


const STATUS_COLORS = [
  "#2563EB",
  "#60A5FA",
  "#16A34A",
  "#22C55E",
  "#EF4444",
];


function StatCard({
  icon: Icon,
  label,
  value,
  helper,
  iconClass,
  index,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 14,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: index * 0.06,
      }}
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
      "
    >
      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="
            mt-2
            text-3xl
            font-bold
            tracking-tight
            text-slate-900
          ">
            {value}
          </p>

          <p className="
            mt-2
            text-xs
            text-slate-500
          ">
            {helper}
          </p>

        </div>

        <div
          className={`
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${iconClass}
          `}
        >
          <Icon size={21} />
        </div>

      </div>
    </motion.div>
  );
}


function EmptyChart({ message }) {
  return (
    <div className="
      flex
      h-full
      min-h-[280px]
      items-center
      justify-center
    ">
      <div className="text-center">

        <div className="
          mx-auto
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-xl
          bg-slate-50
          text-slate-400
        ">
          <BarChart3 size={22} />
        </div>

        <p className="
          mt-3
          text-sm
          font-medium
          text-slate-700
        ">
          No analytics data yet
        </p>

        <p className="
          mt-1
          text-xs
          text-slate-500
        ">
          {message}
        </p>

      </div>
    </div>
  );
}


function SectionTitle({
  icon: Icon,
  title,
  subtitle,
}) {
  return (
    <div className="
      mb-6
      flex
      items-start
      gap-3
    ">

      <div className="
        flex
        h-10
        w-10
        shrink-0
        items-center
        justify-center
        rounded-xl
        bg-blue-50
        text-blue-600
      ">
        <Icon size={19} />
      </div>

      <div>

        <h2 className="
          text-lg
          font-bold
          text-slate-900
        ">
          {title}
        </h2>

        <p className="
          mt-1
          text-sm
          text-slate-500
        ">
          {subtitle}
        </p>

      </div>

    </div>
  );
}


export default function AnalyticsPage() {
  const router = useRouter();

  const [data, setData] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  async function loadAnalytics() {
    try {
      setLoading(true);
      setError("");

      const response =
        await getAnalytics();

      setData(response);

    } catch (err) {
      console.error(
        "Analytics error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load analytics. Please try again."
      );

    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadAnalytics();
  }, []);


  const summary =
    data?.summary || {};

  const pipeline =
    data?.pipeline || [];

  const atsDistribution =
    data?.atsDistribution || [];

  const trend =
    data?.trend || [];

  const recentActivity =
    data?.recentActivity || [];


  const totalPipeline =
    useMemo(
      () =>
        pipeline.reduce(
          (sum, item) =>
            sum +
            Number(
              item.value || 0
            ),
          0
        ),
      [pipeline]
    );


  function exportReport() {
    if (!data) return;

    const rows = [
      [
        "Metric",
        "Value",
      ],

      [
        "Total Candidates",
        summary.totalCandidates || 0,
      ],

      [
        "Active Jobs",
        summary.activeJobs || 0,
      ],

      [
        "Scheduled Interviews",
        summary.interviews || 0,
      ],

      [
        "Completed Interviews",
        summary.completedInterviews || 0,
      ],

      [
        "Average ATS",
        `${summary.averageATS || 0}%`,
      ],

      [
        "Selected",
        summary.selected || 0,
      ],

      [
        "Rejected",
        summary.rejected || 0,
      ],

      [
        "On Hold",
        summary.onHold || 0,
      ],

      [
        "Selection Rate",
        `${summary.selectionRate || 0}%`,
      ],

      [],

      [
        "Pipeline",
        "Candidates",
      ],

      ...pipeline.map(
        (item) => [
          item.name,
          item.value,
        ]
      ),
    ];


    const csv =
      rows
        .map(
          (row) =>
            row
              .map(
                (value) =>
                  `"${String(
                    value ?? ""
                  ).replaceAll(
                    '"',
                    '""'
                  )}"`
              )
              .join(",")
        )
        .join("\n");


    const blob =
      new Blob(
        [csv],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );


    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      "ai-ats-analytics.csv";

    link.click();

    URL.revokeObjectURL(
      url
    );
  }


  return (
    <ProtectedRoute>

      <AppLayout>

        <div className="
          min-h-full
          bg-white
        ">

          {/* HEADER */}

          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mb-8"
          >

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/dashboard"
                )
              }
              className="
                mb-4
                flex
                items-center
                gap-2
                text-sm
                font-medium
                text-slate-500
                transition
                hover:text-blue-600
              "
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>


            <div className="
              flex
              flex-col
              gap-5
              lg:flex-row
              lg:items-end
              lg:justify-between
            ">

              <div>

                <div className="
                  mb-2
                  flex
                  items-center
                  gap-2
                  text-sm
                  text-slate-500
                ">
                  <span>
                    Dashboard
                  </span>

                  <span>
                    /
                  </span>

                  <span className="
                    font-medium
                    text-blue-600
                  ">
                    Analytics
                  </span>
                </div>


                <h1 className="
                  text-3xl
                  font-bold
                  tracking-tight
                  text-slate-900
                ">
                  Analytics
                </h1>


                <p className="
                  mt-2
                  max-w-2xl
                  text-sm
                  text-slate-500
                ">
                  Recruitment performance,
                  candidate pipeline,
                  ATS quality, and
                  hiring outcomes.
                </p>

              </div>


              <button
                type="button"
                onClick={exportReport}
                disabled={!data}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-slate-700
                  shadow-sm
                  transition
                  hover:border-blue-200
                  hover:bg-blue-50
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <Download size={17} />
                Export Report
              </button>

            </div>

          </motion.div>


          {/* ERROR */}

          {error && (
            <div className="
              mb-6
              flex
              items-center
              justify-between
              gap-4
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-700
            ">

              <div>

                <p className="font-semibold">
                  Analytics Error
                </p>

                <p className="mt-1">
                  {error}
                </p>

              </div>


              <button
                type="button"
                onClick={
                  loadAnalytics
                }
                className="
                  rounded-lg
                  bg-white
                  px-3
                  py-2
                  text-xs
                  font-semibold
                  text-red-700
                  shadow-sm
                "
              >
                Retry
              </button>

            </div>
          )}


          {/* LOADING */}

          {loading ? (

            <div className="
              flex
              min-h-[500px]
              items-center
              justify-center
              rounded-2xl
              border
              border-slate-200
              bg-white
              shadow-sm
            ">

              <div className="text-center">

                <Loader2
                  className="
                    mx-auto
                    animate-spin
                    text-blue-600
                  "
                  size={30}
                />

                <p className="
                  mt-3
                  text-sm
                  font-medium
                  text-slate-700
                ">
                  Loading analytics...
                </p>

                <p className="
                  mt-1
                  text-xs
                  text-slate-500
                ">
                  Calculating recruitment metrics.
                </p>

              </div>

            </div>

          ) : (

            <>

              {/* STAT CARDS */}

              <section className="
                mb-7
                grid
                gap-5
                md:grid-cols-2
                xl:grid-cols-4
              ">

                <StatCard
                  icon={Users}
                  label="Total Candidates"
                  value={
                    summary.totalCandidates ||
                    0
                  }
                  helper="
                    Candidates in your database
                  "
                  iconClass="
                    bg-blue-50
                    text-blue-600
                  "
                  index={0}
                />


                <StatCard
                  icon={Briefcase}
                  label="Active Jobs"
                  value={
                    summary.activeJobs ||
                    0
                  }
                  helper="
                    Currently open positions
                  "
                  iconClass="
                    bg-slate-100
                    text-slate-700
                  "
                  index={1}
                />


                <StatCard
                  icon={Activity}
                  label="Interviews"
                  value={
                    summary.interviews ||
                    0
                  }
                  helper={`
                    ${summary.completedInterviews || 0}
                    completed
                  `}
                  iconClass="
                    bg-green-50
                    text-green-600
                  "
                  index={2}
                />


                <StatCard
                  icon={Target}
                  label="Average ATS"
                  value={`
                    ${summary.averageATS || 0}%
                  `}
                  helper={`
                    ${summary.selectionRate || 0}%
                    selection rate
                  `}
                  iconClass="
                    bg-indigo-50
                    text-indigo-600
                  "
                  index={3}
                />

              </section>


              {/* TREND + PIPELINE */}

              <section className="
                mb-7
                grid
                gap-6
                xl:grid-cols-[1.6fr_1fr]
              ">


                {/* TREND */}

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 14,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-6
                    shadow-sm
                  "
                >

                  <SectionTitle
                    icon={TrendingUp}
                    title="Recruitment Trend"
                    subtitle="
                      Applications, completed interviews,
                      and selections over the last 6 months.
                    "
                  />


                  {trend.some(
                    (item) =>
                      Number(
                        item.applications
                      ) > 0 ||
                      Number(
                        item.interviews
                      ) > 0 ||
                      Number(
                        item.selected
                      ) > 0
                  ) ? (

                    <div className="
                      h-[330px]
                    ">

                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >

                        <AreaChart
                          data={trend}
                        >

                          <defs>

                            <linearGradient
                              id="
                                applicationsFill
                              "
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >

                              <stop
                                offset="5%"
                                stopColor="#2563EB"
                                stopOpacity={0.2}
                              />

                              <stop
                                offset="95%"
                                stopColor="#2563EB"
                                stopOpacity={0}
                              />

                            </linearGradient>

                          </defs>


                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#E2E8F0"
                          />


                          <XAxis
                            dataKey="month"
                            tick={{
                              fill: "#64748B",
                              fontSize: 12,
                            }}
                            axisLine={false}
                            tickLine={false}
                          />


                          <YAxis
                            allowDecimals={false}
                            tick={{
                              fill: "#64748B",
                              fontSize: 12,
                            }}
                            axisLine={false}
                            tickLine={false}
                          />


                          <Tooltip />


                          <Area
                            type="monotone"
                            dataKey="applications"
                            name="Applications"
                            stroke="#2563EB"
                            strokeWidth={3}
                            fill="
                              url(#applicationsFill)
                            "
                          />


                          <Area
                            type="monotone"
                            dataKey="interviews"
                            name="
                              Completed Interviews
                            "
                            stroke="#16A34A"
                            strokeWidth={2}
                            fill="transparent"
                          />


                          <Area
                            type="monotone"
                            dataKey="selected"
                            name="Selected"
                            stroke="#D4AF37"
                            strokeWidth={2}
                            fill="transparent"
                          />

                        </AreaChart>

                      </ResponsiveContainer>

                    </div>

                  ) : (

                    <EmptyChart
                      message="
                        Add candidates to start
                        building recruitment trends.
                      "
                    />

                  )}

                </motion.div>


                {/* PIPELINE */}

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 14,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.06,
                  }}
                  className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-6
                    shadow-sm
                  "
                >

                  <SectionTitle
                    icon={PieChartIcon}
                    title="Pipeline"
                    subtitle="
                      Current candidate distribution
                      by stage.
                    "
                  />


                  {totalPipeline > 0 ? (

                    <>

                      <div className="
                        h-[260px]
                      ">

                        <ResponsiveContainer
                          width="100%"
                          height="100%"
                        >

                          <PieChart>

                            <Pie
                              data={pipeline.filter(
                                (item) =>
                                  Number(
                                    item.value
                                  ) > 0
                              )}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={65}
                              outerRadius={95}
                              paddingAngle={3}
                            >

                              {pipeline
                                .filter(
                                  (item) =>
                                    Number(
                                      item.value
                                    ) > 0
                                )
                                .map(
                                  (
                                    entry,
                                    index
                                  ) => (

                                    <Cell
                                      key={
                                        entry.name
                                      }
                                      fill={
                                        STATUS_COLORS[
                                          index %
                                            STATUS_COLORS.length
                                        ]
                                      }
                                    />

                                  )
                                )}

                            </Pie>

                            <Tooltip />

                          </PieChart>

                        </ResponsiveContainer>

                      </div>


                      <div className="
                        space-y-2
                      ">

                        {pipeline.map(
                          (
                            item,
                            index
                          ) => (

                            <div
                              key={
                                item.name
                              }
                              className="
                                flex
                                items-center
                                justify-between
                                rounded-lg
                                bg-slate-50
                                px-3
                                py-2
                              "
                            >

                              <div className="
                                flex
                                items-center
                                gap-2
                              ">

                                <span
                                  className="
                                    h-2.5
                                    w-2.5
                                    rounded-full
                                  "
                                  style={{
                                    backgroundColor:
                                      STATUS_COLORS[
                                        index %
                                          STATUS_COLORS.length
                                      ],
                                  }}
                                />

                                <span className="
                                  text-sm
                                  text-slate-600
                                ">
                                  {item.name}
                                </span>

                              </div>


                              <span className="
                                text-sm
                                font-bold
                                text-slate-900
                              ">
                                {item.value}
                              </span>

                            </div>

                          )
                        )}

                      </div>

                    </>

                  ) : (

                    <EmptyChart
                      message="
                        Your pipeline will appear
                        here once candidates are added.
                      "
                    />

                  )}

                </motion.div>

              </section>


              {/* ATS + OUTCOMES */}

              <section className="
                mb-7
                grid
                gap-6
                xl:grid-cols-2
              ">


                {/* ATS */}

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 14,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-6
                    shadow-sm
                  "
                >

                  <SectionTitle
                    icon={BarChart3}
                    title="
                      ATS Score Distribution
                    "
                    subtitle="
                      Candidate distribution across
                      ATS score ranges.
                    "
                  />


                  {atsDistribution.some(
                    (item) =>
                      Number(
                        item.value
                      ) > 0
                  ) ? (

                    <div className="
                      h-[310px]
                    ">

                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >

                        <BarChart
                          data={
                            atsDistribution
                          }
                        >

                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#E2E8F0"
                          />

                          <XAxis
                            dataKey="name"
                            tick={{
                              fill: "#64748B",
                              fontSize: 12,
                            }}
                            axisLine={false}
                            tickLine={false}
                          />

                          <YAxis
                            allowDecimals={false}
                            tick={{
                              fill: "#64748B",
                              fontSize: 12,
                            }}
                            axisLine={false}
                            tickLine={false}
                          />

                          <Tooltip />

                          <Bar
                            dataKey="value"
                            name="Candidates"
                            fill="#2563EB"
                            radius={[
                              6,
                              6,
                              0,
                              0,
                            ]}
                          />

                        </BarChart>

                      </ResponsiveContainer>

                    </div>

                  ) : (

                    <EmptyChart
                      message="
                        ATS score distribution will
                        appear after candidates are evaluated.
                      "
                    />

                  )}

                </motion.div>


                {/* OUTCOMES */}

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 14,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.06,
                  }}
                  className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-6
                    shadow-sm
                  "
                >

                  <SectionTitle
                    icon={CheckCircle2}
                    title="Hiring Outcomes"
                    subtitle="
                      Current outcome summary from
                      completed interview decisions.
                    "
                  />


                  <div className="
                    grid
                    gap-4
                    sm:grid-cols-2
                  ">

                    <OutcomeCard
                      icon={CheckCircle2}
                      label="Selected"
                      value={
                        summary.selected ||
                        0
                      }
                      helper={`
                        ${summary.selectionRate || 0}%
                        of candidates
                      `}
                      className="
                        bg-green-50
                        text-green-600
                      "
                    />


                    <OutcomeCard
                      icon={XCircle}
                      label="Rejected"
                      value={
                        summary.rejected ||
                        0
                      }
                      helper="
                        Current rejected candidates
                      "
                      className="
                        bg-red-50
                        text-red-600
                      "
                    />


                    <OutcomeCard
                      icon={Activity}
                      label="On Hold"
                      value={
                        summary.onHold ||
                        0
                      }
                      helper="
                        Awaiting final decision
                      "
                      className="
                        bg-amber-50
                        text-amber-600
                      "
                    />


                    <OutcomeCard
                      icon={TrendingUp}
                      label="
                        Interview Completion
                      "
                      value={`
                        ${summary.interviewCompletionRate || 0}%
                      `}
                      helper="
                        Completed vs scheduled
                      "
                      className="
                        bg-blue-50
                        text-blue-600
                      "
                    />

                  </div>

                </motion.div>

              </section>


              {/* RECENT ACTIVITY */}

              <motion.section
                initial={{
                  opacity: 0,
                  y: 14,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-6
                  shadow-sm
                "
              >

                <SectionTitle
                  icon={Activity}
                  title="
                    Recent Candidate Activity
                  "
                  subtitle="
                    Latest candidates entering or
                    moving through your recruitment pipeline.
                  "
                />


                {recentActivity.length === 0 ? (

                  <EmptyChart
                    message="
                      Recent candidate activity
                      will appear here.
                    "
                  />

                ) : (

                  <div className="
                    overflow-x-auto
                  ">

                    <table className="
                      w-full
                      min-w-[650px]
                    ">

                      <thead>

                        <tr className="
                          border-b
                          border-slate-100
                        ">

                          <th className="
                            px-4
                            py-3
                            text-left
                            text-xs
                            font-semibold
                            uppercase
                            tracking-wider
                            text-slate-500
                          ">
                            Candidate
                          </th>


                          <th className="
                            px-4
                            py-3
                            text-left
                            text-xs
                            font-semibold
                            uppercase
                            tracking-wider
                            text-slate-500
                          ">
                            ATS
                          </th>


                          <th className="
                            px-4
                            py-3
                            text-left
                            text-xs
                            font-semibold
                            uppercase
                            tracking-wider
                            text-slate-500
                          ">
                            Status
                          </th>


                          <th className="
                            px-4
                            py-3
                            text-right
                            text-xs
                            font-semibold
                            uppercase
                            tracking-wider
                            text-slate-500
                          ">
                            Added
                          </th>

                        </tr>

                      </thead>


                      <tbody>

                        {recentActivity.map(
                          (candidate) => (

                            <tr
                              key={
                                candidate.id
                              }
                              className="
                                border-b
                                border-slate-50
                                last:border-0
                                hover:bg-slate-50/70
                              "
                            >

                              <td className="
                                px-4
                                py-4
                              ">

                                <div className="
                                  flex
                                  items-center
                                  gap-3
                                ">

                                  <div className="
                                    flex
                                    h-9
                                    w-9
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-blue-50
                                    text-xs
                                    font-bold
                                    text-blue-600
                                  ">
                                    {(
                                      candidate.name ||
                                      "U"
                                    )
                                      .split(" ")
                                      .map(
                                        (
                                          part
                                        ) =>
                                          part[0]
                                      )
                                      .slice(
                                        0,
                                        2
                                      )
                                      .join("")
                                      .toUpperCase()}
                                  </div>


                                  <div>

                                    <p className="
                                      font-semibold
                                      text-slate-900
                                    ">
                                      {candidate.name ||
                                        "Unnamed Candidate"}
                                    </p>

                                  </div>

                                </div>

                              </td>


                              <td className="
                                px-4
                                py-4
                                text-sm
                                font-semibold
                                text-slate-700
                              ">
                                {Number(
                                  candidate.ats_score ||
                                    0
                                )}
                                %
                              </td>


                              <td className="
                                px-4
                                py-4
                              ">

                                <span className="
                                  rounded-full
                                  bg-blue-50
                                  px-2.5
                                  py-1
                                  text-xs
                                  font-semibold
                                  text-blue-700
                                ">
                                  {candidate.status ||
                                    "Applied"}
                                </span>

                              </td>


                              <td className="
                                px-4
                                py-4
                                text-right
                                text-sm
                                text-slate-500
                              ">
                                {formatDate(
                                  candidate.created_at
                                )}
                              </td>

                            </tr>

                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                )}

              </motion.section>

            </>

          )}

        </div>

      </AppLayout>

    </ProtectedRoute>
  );
}


function OutcomeCard({
  icon: Icon,
  label,
  value,
  helper,
  className,
}) {
  return (
    <div className="
      rounded-2xl
      border
      border-slate-200
      p-4
    ">

      <div
        className={`
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          ${className}
        `}
      >
        <Icon size={18} />
      </div>


      <p className="
        mt-4
        text-sm
        font-medium
        text-slate-500
      ">
        {label}
      </p>


      <p className="
        mt-1
        text-2xl
        font-bold
        text-slate-900
      ">
        {value}
      </p>


      <p className="
        mt-1
        text-xs
        text-slate-500
      ">
        {helper}
      </p>

    </div>
  );
}


function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}
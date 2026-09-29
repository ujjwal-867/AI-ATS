"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

import { getAnalytics } from "@/services/analytics.service";

export default function HiringAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        setError("");

        const response = await getAnalytics();

        setAnalytics(response);
      } catch (err) {
        console.error("Analytics loading error:", err);

        setError(
          err?.message || "Unable to load hiring analytics."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  const chartData = useMemo(() => {
    if (!analytics) {
      return [];
    }

    /*
      Backend response:
      {
        trend: [...]
      }
    */

    if (Array.isArray(analytics.trend)) {
      return analytics.trend;
    }

    /*
      Support alternative response shapes
      so the dashboard does not crash if the
      API returns { data: { trend: [...] } }.
    */

    if (Array.isArray(analytics?.data?.trend)) {
      return analytics.data.trend;
    }

    if (Array.isArray(analytics)) {
      return analytics;
    }

    return [];
  }, [analytics]);

  const visibleData = useMemo(() => {
    return Array.isArray(chartData)
      ? chartData.slice(-6)
      : [];
  }, [chartData]);

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="h-6 w-48 animate-pulse rounded bg-slate-100" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-slate-100" />
          </div>

          <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />
        </div>

        <div className="h-[300px] animate-pulse rounded-xl bg-slate-50" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <div className="mb-2 text-sm font-semibold text-red-600">
          Unable to load hiring analytics
        </div>

        <p className="text-sm text-slate-500">
          {error}
        </p>
      </section>
    );
  }

  if (!visibleData.length) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Hiring Analytics
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Recruitment activity over the last six months
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
            <TrendingUp
              size={20}
              className="text-blue-600"
            />
          </div>
        </div>

        <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700">
              No hiring data yet
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Candidate activity will appear here once recruitment data is available.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Hiring Analytics
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Recruitment activity over the last six months
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
          <TrendingUp
            size={20}
            className="text-blue-600"
          />
        </div>
      </div>

      {/* Important: explicit height prevents Recharts -1 width/height */}
      <div className="h-[300px] min-h-[300px] w-full min-w-0">
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          minHeight={0}
        >
          <AreaChart
            data={visibleData}
            margin={{
              top: 10,
              right: 10,
              left: -10,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id="hiringGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#2563EB"
                  stopOpacity={0.25}
                />

                <stop
                  offset="100%"
                  stopColor="#2563EB"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E2E8F0"
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 12,
                fill: "#64748B",
              }}
            />

            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 12,
                fill: "#64748B",
              }}
            />

            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
                boxShadow:
                  "0 10px 30px rgba(15, 23, 42, 0.08)",
              }}
              labelStyle={{
                color: "#0F172A",
                fontWeight: 600,
              }}
            />

            <Area
              type="monotone"
              dataKey="applications"
              name="Applications"
              stroke="#2563EB"
              strokeWidth={3}
              fill="url(#hiringGradient)"
              activeDot={{
                r: 5,
              }}
            />

            <Area
              type="monotone"
              dataKey="interviews"
              name="Interviews"
              stroke="#16A34A"
              strokeWidth={2}
              fill="transparent"
              activeDot={{
                r: 4,
              }}
            />

            <Area
              type="monotone"
              dataKey="selected"
              name="Selected"
              stroke="#D4AF37"
              strokeWidth={2}
              fill="transparent"
              activeDot={{
                r: 4,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-5 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
          Applications
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-green-600" />
          Interviews
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#D4AF37]" />
          Selected
        </div>
      </div>
    </motion.section>
  );
}
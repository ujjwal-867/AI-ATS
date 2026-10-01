"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Users,
  Clock,
  Sparkles,
  ArrowUpRight,
  Loader2,
} from "lucide-react";

export default function AIInsights({ stats }) {

  if (!stats) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );
  }

  const insights = [
    {
      title: "Average ATS Score",
      value: `${stats.averageATS ?? 0}%`,
      subtitle: "Overall candidate quality",
      icon: Brain,
      bg: "bg-blue-50",
      color: "text-blue-600",
    },
    {
      title: "Total Candidates",
      value: stats.totalCandidates ?? 0,
      subtitle: "Registered applicants",
      icon: Users,
      bg: "bg-indigo-50",
      color: "text-indigo-600",
    },
    {
      title: "Pending Review",
      value: stats.pending ?? 0,
      subtitle: "Waiting for screening",
      icon: Clock,
      bg: "bg-green-50",
      color: "text-green-600",
    },
    {
      title: "Shortlisted",
      value: stats.shortlisted ?? 0,
      subtitle: "Ready for next stage",
      icon: Sparkles,
      bg: "bg-purple-50",
      color: "text-purple-600",
    },
  ];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Recruitment Insights
          </h2>
          <p className="mt-2 text-slate-500">
            Live recruitment overview
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
          Live
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {insights.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -4 }}
              className="min-h-[120px] rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:bg-white hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.bg}`}>
                    <Icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{item.title}</p>
                    <h3 className="mt-1 text-3xl font-bold text-slate-900">{item.value}</h3>
                    <p className="text-sm text-slate-500">{item.subtitle}</p>
                  </div>
                </div>
                <ArrowUpRight size={18} className="text-green-600" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
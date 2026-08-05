"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Target,
  UserCheck,
  UserX,
  Clock,
} from "lucide-react";

import StatsCard from "./StatsCard";
import Charts from "./Charts";

export default function Analytics() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/stats");
        const data = await response.json();

        setStats(data);
      } catch (error) {
        console.log(error);
      }
    }

    fetchStats();
  }, []);

  if (!stats) {
    return (
      <div className="flex h-80 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="mt-4 text-slate-400">
            Loading Analytics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <StatsCard
          title="Candidates"
          value={stats.totalCandidates}
          icon={Users}
          color="text-blue-400"
          trend="+12%"
        />

        <StatsCard
          title="Average ATS"
          value={`${stats.averageScore}%`}
          icon={Target}
          color="text-green-400"
          trend="+5%"
        />

        <StatsCard
          title="Shortlisted"
          value={stats.shortlisted}
          icon={UserCheck}
          color="text-emerald-400"
          trend="+8%"
        />

        <StatsCard
          title="Rejected"
          value={stats.rejected}
          icon={UserX}
          color="text-red-400"
          trend="-2%"
        />

        <StatsCard
          title="Pending"
          value={stats.pending}
          icon={Clock}
          color="text-yellow-400"
          trend="+4%"
        />
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <h2 className="mb-2 text-2xl font-bold text-white">
          Recruitment Analytics
        </h2>

        <p className="mb-6 text-slate-400">
          AI-powered hiring insights and recruitment statistics.
        </p>

        <Charts stats={stats} />
      </div>
    </div>
  );
}
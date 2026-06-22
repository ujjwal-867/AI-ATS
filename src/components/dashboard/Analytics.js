"use client";

import { useEffect, useState } from "react";
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
      <div className="text-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <StatsCard
          title="Total Candidates"
          value={stats.totalCandidates}
        />

        <StatsCard
          title="Average ATS Score"
          value={`${stats.averageScore}%`}
        />

        <StatsCard
          title="Shortlisted"
          value={stats.shortlisted}
        />

        <StatsCard
          title="Rejected"
          value={stats.rejected}
        />

        <StatsCard
          title="Pending"
          value={stats.pending}
        />
      </div>

      <Charts stats={stats} />
    </>
  );
}
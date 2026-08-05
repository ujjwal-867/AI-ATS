"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardHeader from "@/components/dashboard/header/DashboardHeader";
import DashboardStats from "@/components/dashboard/stats/DashboardStats";
import CandidateTable from "@/components/dashboard/CandidateTable";
import HiringPipeline from "@/components/dashboard/pipeline/HiringPipeline";
import AIInsights from "@/components/dashboard/insights/AIInsights";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <DashboardHeader
        user={user}
        onLogout={handleLogout}
      />

      <main className="space-y-10 p-8">

        {/* Dashboard Statistics */}
        <DashboardStats />

        {/* Candidate Table + Pipeline */}
        <div className="grid gap-8 xl:grid-cols-4">

          <div className="xl:col-span-3">
            <CandidateTable />
          </div>

          <HiringPipeline />

        </div>

        {/* AI Insights */}
        <AIInsights />

      </main>
    </div>
  );
}
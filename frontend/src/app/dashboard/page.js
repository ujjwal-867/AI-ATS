"use client";

import { useEffect, useState } from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";

import {
  getStats,
  getCandidateById,
} from "@/services/api";

import DashboardHeader from "@/components/dashboard/header/DashboardHeader";
import DashboardStats from "@/components/dashboard/stats/DashboardStats";
import HiringAnalytics from "@/components/dashboard/charts/HiringAnalytics";
import HiringPipeline from "@/components/dashboard/pipeline/HiringPipeline";
import AIInsights from "@/components/dashboard/insights/AIInsights";
import CandidateTable from "@/components/dashboard/CandidateTable";
import UpcomingInterviews from "@/components/dashboard/interviews/UpcomingInterviews";
import RecentActivity from "@/components/dashboard/activity/RecentActivity";

import CandidateProfileDrawer from "@/components/candidate-profile/CandidateProfileDrawer";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getStats();
        setStats(data);
      } catch (error) {
        console.error("Stats error:", error);
      }
    }

    loadStats();
  }, []);

  async function openCandidate(id) {
    try {
      const data = await getCandidateById(id);

      setSelectedCandidate(data);
      setDrawerOpen(true);
    } catch (error) {
      console.error("Candidate error:", error);
    }
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="mx-auto w-full max-w-[1500px] space-y-6">

          {/* Dashboard heading */}
          <DashboardHeader />

          {/* Overview cards */}
          <DashboardStats stats={stats} />

          {/* Analytics */}
          <HiringAnalytics />

          {/* Pipeline + AI */}
          <div className="grid grid-cols-1 gap-6 2xl:grid-cols-12">

            <section className="min-w-0 2xl:col-span-8">
              <HiringPipeline />
            </section>

            <section className="min-w-0 2xl:col-span-4">
              <AIInsights stats={stats} />
            </section>

          </div>

          {/* Candidates */}
          <CandidateTable
            onViewCandidate={openCandidate}
          />

          {/* Bottom sections */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            <UpcomingInterviews />

            <RecentActivity />

          </div>

        </div>

        <CandidateProfileDrawer
          open={drawerOpen}
          candidate={selectedCandidate}
          onClose={() => setDrawerOpen(false)}
        />
      </AppLayout>
    </ProtectedRoute>
  );
}
"use client";

import { useEffect,useState } from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";

import { getStats } from "@/services/api";

import DashboardHeader from "@/components/dashboard/header/DashboardHeader";
import DashboardStats from "@/components/dashboard/stats/DashboardStats";
import HiringAnalytics from "@/components/dashboard/charts/HiringAnalytics";
import HiringPipeline from "@/components/dashboard/pipeline/HiringPipeline";
import AIInsights from "@/components/dashboard/insights/AIInsights";
import CandidateTable from "@/components/dashboard/CandidateTable";
import UpcomingInterviews from "@/components/dashboard/interviews/UpcomingInterviews";
import RecentActivity from "@/components/dashboard/activity/RecentActivity";


export default function DashboardPage(){

  const [stats,setStats]=useState(null);


  useEffect(()=>{

    async function loadStats(){

      try{
        const data=await getStats();
        setStats(data);
      }
      catch(error){
        console.log("Stats error",error);
      }

    }

    loadStats();

  },[]);


  return(
    <ProtectedRoute>

      <AppLayout>

        <div className="mx-auto max-w-[1700px] space-y-6">

          <DashboardHeader />

          <DashboardStats stats={stats}/>

          <HiringAnalytics />


          <div className="grid gap-6 2xl:grid-cols-12">

            <div className="2xl:col-span-8">
              <HiringPipeline/>
            </div>

            <div className="2xl:col-span-4">
              <AIInsights stats={stats}/>
            </div>

          </div>


          <CandidateTable/>


          <div className="grid gap-6 lg:grid-cols-2">

            <UpcomingInterviews/>

            <RecentActivity/>

          </div>


        </div>

      </AppLayout>

    </ProtectedRoute>
  );
}
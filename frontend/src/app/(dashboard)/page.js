"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import DashboardHeader from "@/components/dashboard/header/DashboardHeader";
import DashboardStats from "@/components/dashboard/stats/DashboardStats";
import CandidateTable from "@/components/dashboard/CandidateTable";
import HiringPipeline from "@/components/dashboard/pipeline/HiringPipeline";
import AIInsights from "@/components/dashboard/insights/AIInsights";


export default function DashboardPage() {

  const router = useRouter();


  const [user] = useState(() => {

    if (typeof window === "undefined") {
      return null;
    }

    const userData = localStorage.getItem("user");

    return userData
      ? JSON.parse(userData)
      : null;

  });



  if (
    typeof window !== "undefined" &&
    !localStorage.getItem("token")
  ) {
    router.replace("/login");
    return null;
  }



  function handleLogout() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    router.replace("/login");

  }



  return (

    <div className="
      min-h-screen
      bg-white
    ">


      <DashboardHeader
        user={user}
        onLogout={handleLogout}
      />



      <main
        className="
          space-y-16
          px-10
          py-12
          lg:px-14
        "
      >


        {/* Statistics */}

        <section>

          <DashboardStats />

        </section>




        {/* Candidate + Pipeline */}

        <section
          className="
            grid
            gap-10
            xl:grid-cols-4
          "
        >


          <div
            className="
              xl:col-span-3
            "
          >

            <CandidateTable />

          </div>



          <HiringPipeline />


        </section>





        {/* AI Insights */}

        <section
          className="
            pt-4
          "
        >

          <AIInsights />

        </section>



      </main>


    </div>

  );

}
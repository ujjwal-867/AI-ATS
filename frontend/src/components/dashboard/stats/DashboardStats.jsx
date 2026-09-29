"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
  Users,
  BriefcaseBusiness,
  CalendarCheck,
  Brain,
  TrendingUp,
  Loader2,
} from "lucide-react";

import { getStats } from "@/services/api";


const config = [
  {
    key: "totalCandidates",
    title: "Total Candidates",
    icon: Users,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    subtitle: "registered candidates",
  },
  {
    key: "activeJobs",
    title: "Active Jobs",
    icon: BriefcaseBusiness,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    subtitle: "available openings",
  },
  {
    key: "interviews",
    title: "Interviews",
    icon: CalendarCheck,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    subtitle: "scheduled interviews",
  },
  {
    key: "averageATS",
    title: "Average ATS",
    icon: Brain,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    subtitle: "candidate score",
  },
];


function StatCard({ item, value, index }) {
  const Icon = item.icon;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: index * 0.08,
        duration: 0.35,
      }}
      whileHover={{
        y: -4,
      }}
      className="
        h-[150px]
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-6
        shadow-sm
        transition-shadow
        duration-200
        hover:shadow-md
      "
    >

      <div className="
        flex
        items-start
        justify-between
      ">

        <div>

          <p className="
            text-sm
            font-semibold
            text-slate-500
          ">
            {item.title}
          </p>


          <h2 className="
            mt-3
            text-5xl
            font-bold
            tracking-tight
            text-slate-900
          ">
            {item.key === "averageATS"
              ? `${value}%`
              : value
            }
          </h2>

        </div>


        <div
          className={`
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-2xl
            ${item.iconBg}
          `}
        >
          <Icon
            className={`
              h-6
              w-6
              ${item.iconColor}
            `}
          />
        </div>

      </div>


      <div className="
        mt-3
        flex
        items-center
        gap-2
      ">

        <TrendingUp
          size={16}
          className="text-green-600"
        />

        <span className="
          text-sm
          text-slate-500
        ">
          {item.subtitle}
        </span>

      </div>

    </motion.div>
  );
}


export default function DashboardStats() {

  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);


  useEffect(() => {

    let mounted = true;


    async function loadStats() {

      try {

        setLoading(true);
        setError(false);

        const data = await getStats();


        if (!mounted) return;

        setStats(data);

      } catch (error) {

        console.error(
          "Dashboard stats error:",
          error
        );

        if (!mounted) return;

        setError(true);

      } finally {

        if (mounted) {
          setLoading(false);
        }

      }

    }


    loadStats();


    return () => {
      mounted = false;
    };

  }, []);


  /*
   * LOADING
   */

  if (loading) {

    return (
      <section className="
        grid
        gap-8
        md:grid-cols-2
        xl:grid-cols-4
      ">

        {config.map((item) => (

          <div
            key={item.key}
            className="
              h-[150px]
              animate-pulse
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-6
            "
          >

            <div className="
              flex
              items-start
              justify-between
            ">

              <div className="space-y-3">

                <div className="
                  h-4
                  w-32
                  rounded
                  bg-slate-100
                />

                <div className="
                  h-12
                  w-20
                  rounded
                  bg-slate-100
                />

              </div>


              <div className="
                h-12
                w-12
                rounded-2xl
                bg-slate-100
              " />

            </div>


            <div className="
              mt-4
              h-4
              w-36
              rounded
              bg-slate-100
            " />

          </div>

        ))}

      </section>
    );
  }


  /*
   * ERROR
   */

  if (error) {

    return (
      <section className="
        rounded-3xl
        border
        border-red-100
        bg-white
        p-8
      ">

        <div className="
          flex
          items-center
          gap-3
          text-sm
          text-red-600
        ">

          <Loader2 size={18} />

          <span>
            Unable to load dashboard statistics.
          </span>

        </div>

      </section>
    );
  }


  /*
   * NO DATA
   */

  if (!stats) {
    return null;
  }


  /*
   * DASHBOARD STATS
   */

  return (

    <section className="
      grid
      gap-8
      md:grid-cols-2
      xl:grid-cols-4
    ">

      {config.map((item, index) => (

        <StatCard
          key={item.key}
          item={item}
          value={stats[item.key] ?? 0}
          index={index}
        />

      ))}

    </section>

  );
}
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
    color: "bg-blue-50",
    iconColor: "text-blue-600",
    subtitle: "registered candidates",
  },
  {
    key: "activeJobs",
    title: "Active Jobs",
    icon: BriefcaseBusiness,
    color: "bg-[#FFF8E1]",
    iconColor: "text-[#D4AF37]",
    subtitle: "available openings",
  },
  {
    key: "interviews",
    title: "Interviews",
    icon: CalendarCheck,
    color: "bg-green-50",
    iconColor: "text-green-600",
    subtitle: "scheduled interviews",
  },
  {
    key: "averageATS",
    title: "Average ATS",
    icon: Brain,
    color: "bg-purple-50",
    iconColor: "text-purple-600",
    subtitle: "candidate score",
  },
];


function Card({ item, value, index }) {

  const Icon = item.icon;

  return (
    <motion.div
      initial={{
        opacity:0,
        y:15,
      }}

      animate={{
        opacity:1,
        y:0,
      }}

      transition={{
        delay:index * 0.08,
      }}

      whileHover={{
        y:-4,
      }}

      className="
      rounded-2xl
      border
      border-slate-200
      bg-white
      p-4
      shadow-sm
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
          text-slate-500
          ">
            {item.title}
          </p>


          <h2 className="
          mt-1
          text-4xl
          font-bold
          text-[#111827]
          ">
            {
              item.key === "averageATS"
              ? `${value}%`
              : value
            }
          </h2>

        </div>


        <div className={`
          rounded-xl
          ${item.color}
          p-3
        `}>

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
          className="
          h-4
          w-4
          text-green-600
          "
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



export default function DashboardStats(){

  const [stats,setStats] = useState(null);
  const [loading,setLoading] = useState(true);


  useEffect(()=>{

    async function load(){

      try{

        const data = await getStats();

        setStats(data);

      }
      catch(error){

        console.log(
          "Stats error",
          error
        );

      }
      finally{

        setLoading(false);

      }

    }


    load();

  },[]);



  if(loading){

    return (

      <div className="flex justify-center p-4">

        <Loader2
          className="
          animate-spin
          text-[#D4AF37]
          "
        />

      </div>

    );

  }


  if(!stats)
    return null;



  return (

    <section className="
    grid
    gap-3
    md:grid-cols-2
    xl:grid-cols-4
    ">

      {
        config.map(
          (item,index)=>(

            <Card
              key={item.key}
              item={item}
              value={
                stats[item.key] ?? 0
              }
              index={index}
            />

          )
        )
      }

    </section>

  );

}
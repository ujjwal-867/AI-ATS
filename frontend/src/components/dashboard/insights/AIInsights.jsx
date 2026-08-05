"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Award,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  Loader2,
} from "lucide-react";

import { getStats } from "@/services/api";


export default function AIInsights(){

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
          "AI insights error",
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

      <div className="
      flex
      justify-center
      p-4
      ">

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



  const insights = [
    {
      title:"Average ATS Score",
      value:`${stats.averageATS}%`,
      subtitle:"Across all applicants",
      icon:Brain,
      color:"bg-blue-50",
      iconColor:"text-blue-600",
    },
    {
      title:"Total Candidates",
      value:stats.totalCandidates,
      subtitle:"Registered applicants",
      icon:Award,
      color:"bg-[#FFF8E1]",
      iconColor:"text-[#D4AF37]",
    },
    {
      title:"Pending Applications",
      value:stats.pending,
      subtitle:"Waiting for review",
      icon:TrendingUp,
      color:"bg-green-50",
      iconColor:"text-green-600",
    },
    {
      title:"Shortlisted",
      value:stats.shortlisted,
      subtitle:"Candidates shortlisted",
      icon:Sparkles,
      color:"bg-purple-50",
      iconColor:"text-purple-600",
    },
  ];



  return (

    <section className="
    rounded-2xl
    border
    border-slate-200
    bg-white
    p-5
    shadow-sm
    h-full
    ">


      <div className="
      mb-5
      flex
      items-center
      justify-between
      ">

        <div>

          <h2 className="
          text-2xl
          font-bold
          text-[#111827]
          ">
            AI Insights
          </h2>

          <p className="
          mt-1
          text-sm
          text-slate-500
          ">
            Intelligent recruitment insights
          </p>

        </div>


        <span className="
        rounded-full
        bg-[#FFF8E1]
        px-3
        py-1
        text-xs
        font-semibold
        text-[#B8860B]
        ">
          AI Live
        </span>


      </div>



      <div className="space-y-3">


        {
          insights.map(
            (item,index)=>{

              const Icon=item.icon;


              return (

                <motion.div

                  key={item.title}

                  initial={{
                    opacity:0,
                    y:10,
                  }}

                  animate={{
                    opacity:1,
                    y:0,
                  }}

                  transition={{
                    delay:index*0.08,
                  }}

                  className="
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  p-3
                  "

                >

                  <div className="
                  flex
                  items-center
                  justify-between
                  ">


                    <div className="
                    flex
                    items-center
                    gap-3
                    ">


                      <div className={`
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      ${item.color}
                      `}>

                        <Icon
                          className={`
                          h-5
                          w-5
                          ${item.iconColor}
                          `}
                        />

                      </div>


                      <div>

                        <p className="
                        text-xs
                        text-slate-500
                        ">
                          {item.title}
                        </p>

                        <h3 className="
                        font-bold
                        text-[#111827]
                        ">
                          {item.value}
                        </h3>

                        <p className="
                        text-xs
                        text-slate-500
                        ">
                          {item.subtitle}
                        </p>

                      </div>


                    </div>


                    <ArrowUpRight
                      size={18}
                      className="
                      text-green-600
                      "
                    />


                  </div>


                </motion.div>

              );

            }
          )
        }


      </div>


    </section>

  );

}
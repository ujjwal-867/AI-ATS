"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
  FileText,
  Search,
  Users,
  BadgeCheck,
  Trophy,
  Loader2,
} from "lucide-react";

import { getStats } from "@/services/api";


const stages = [
  {
    title: "Applied",
    icon: FileText,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Screening",
    icon: Search,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
  },
  {
    title: "Interview",
    icon: Users,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    title: "Offer",
    icon: BadgeCheck,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    title: "Hired",
    icon: Trophy,
    color: "text-green-600",
    bg: "bg-green-50",
  },
];




export default function HiringPipeline() {

  const [pipeline, setPipeline] = useState({});
  const [loading, setLoading] = useState(true);



  useEffect(() => {

    async function loadPipeline() {

      try {

        const data = await getStats();

        setPipeline(
          data.pipeline || {}
        );

      } catch (error) {

        console.log(
          "Pipeline error",
          error
        );

      } finally {

        setLoading(false);

      }

    }


    loadPipeline();

  }, []);




  if (loading) {

    return (

      <div className="
        flex
        justify-center
        py-10
      ">

        <Loader2
          className="
            animate-spin
            text-blue-600
          "
        />

      </div>

    );

  }



  return (

    <section className="
      rounded-3xl
      border
      border-slate-200
      bg-white
      p-8
      shadow-sm
    ">



      <div className="
        mb-8
      ">

        <h2 className="
          text-3xl
          font-bold
          tracking-tight
          text-slate-900
        ">
          Hiring Pipeline
        </h2>


        <p className="
          mt-2
          text-slate-500
        ">
          Track candidate movement through recruitment stages.
        </p>

      </div>





      <div className="
        grid
        gap-5
        lg:grid-cols-5
      ">


        {stages.map((stage,index)=>{


          const Icon = stage.icon;


          return (

            <motion.div

              key={stage.title}


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
                y:-5,
              }}



              className="
                min-h-[140px]
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-6
                transition
                hover:shadow-lg
              "

            >



              <div className={`
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                ${stage.bg}
              `}>

                <Icon
                  className={`
                    h-6
                    w-6
                    ${stage.color}
                  `}
                />

              </div>





              <h3 className="
                mt-5
                text-lg
                font-bold
                text-slate-900
              ">
                {stage.title}
              </h3>





              <p className="
                mt-2
                text-sm
                text-slate-500
              ">

                <span className="
                  text-2xl
                  font-bold
                  text-slate-900
                ">
                  {stage.title === "Hired"
                    ? (pipeline?.Hired ?? pipeline?.Selected ?? 0)
                    : (pipeline[stage.title] || 0)}
                </span>

                {" "}Candidates

              </p>



            </motion.div>

          );


        })}


      </div>


    </section>

  );

}
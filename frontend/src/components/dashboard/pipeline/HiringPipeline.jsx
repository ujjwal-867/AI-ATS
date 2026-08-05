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
    color: "#3B82F6",
  },
  {
    title: "Screening",
    icon: Search,
    color: "#06B6D4",
  },
  {
    title: "Interview",
    icon: Users,
    color: "#D4AF37",
  },
  {
    title: "Selected",
    icon: BadgeCheck,
    color: "#22C55E",
  },
  {
    title: "Rejected",
    icon: Trophy,
    color: "#EF4444",
  },
];


export default function HiringPipeline(){

  const [pipeline,setPipeline] = useState({});
  const [loading,setLoading] = useState(true);


  useEffect(()=>{

    async function load(){

      try{

        const data = await getStats();

        setPipeline(
          data.pipeline || {}
        );

      }
      catch(error){

        console.log(
          "Pipeline error",
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



  return (

    <section className="
    rounded-2xl
    border
    border-slate-200
    bg-white
    p-4
    shadow-sm
    ">

      <h2 className="
      text-2xl
      font-bold
      text-[#111827]
      ">
        Hiring Pipeline
      </h2>


      <p className="
      mt-1
      text-slate-500
      ">
        Track candidate progress.
      </p>



      <div className="
      mt-4
      grid
      gap-3
      lg:grid-cols-5
      ">


        {
          stages.map(
            (stage,index)=>{

              const Icon = stage.icon;


              return (

                <motion.div

                  key={stage.title}

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
                  bg-slate-50
                  p-3
                  "

                >

                  <div
                    className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    "
                    style={{
                      backgroundColor:
                      `${stage.color}20`
                    }}
                  >

                    <Icon
                      size={18}
                      style={{
                        color:stage.color
                      }}
                    />

                  </div>



                  <h3 className="
                  mt-2
                  font-bold
                  ">
                    {stage.title}
                  </h3>



                  <p className="
                  text-sm
                  text-slate-500
                  ">
                    {
                      pipeline[stage.title] || 0
                    }
                    {" "}
                    Candidates
                  </p>


                </motion.div>

              );

            }
          )
        }


      </div>


    </section>

  );

}
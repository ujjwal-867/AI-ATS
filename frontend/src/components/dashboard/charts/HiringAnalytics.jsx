"use client";

import { useEffect,useState } from "react";
import { motion } from "framer-motion";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Line,
} from "recharts";
import { Loader2 } from "lucide-react";

import { getAnalytics } from "@/services/api";


export default function HiringAnalytics(){

  const [data,setData] = useState([]);
  const [loading,setLoading] = useState(true);


  useEffect(()=>{

    async function loadAnalytics(){

      try{

        const response = await getAnalytics();

        setData(response);

      }catch(error){

        console.log(
          "Analytics error",
          error
        );

      }finally{

        setLoading(false);

      }

    }


    loadAnalytics();

  },[]);



  if(loading){

    return (

      <div className="
      flex
      justify-center
      p-3
      ">

        <Loader2
          className="
          animate-spin
          text-[#D4AF37]
          "
          size={28}
        />

      </div>

    );

  }



  return (

    <motion.section

      initial={{
        opacity:0,
        y:10,
      }}

      animate={{
        opacity:1,
        y:0,
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
      mb-3
      flex
      items-center
      justify-between
      ">

        <div>

          <h2 className="
          text-xl
          font-bold
          text-[#111827]
          ">
            Hiring Analytics
          </h2>


          <p className="
          text-sm
          text-slate-500
          ">
            Recruitment performance
          </p>

        </div>


      </div>



      {
        data.length === 0 ?

        (

          <div className="
          flex
          h-[220px]
          items-center
          justify-center
          text-sm
          text-slate-500
          ">
            No analytics data available
          </div>

        )

        :

        (

          <div className="
          h-[240px]
          ">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <AreaChart data={data}>


                <defs>

                  <linearGradient
                    id="applications"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="5%"
                      stopColor="#D4AF37"
                      stopOpacity={0.3}
                    />

                    <stop
                      offset="95%"
                      stopColor="#D4AF37"
                      stopOpacity={0}
                    />

                  </linearGradient>

                </defs>



                <CartesianGrid
                  strokeDasharray="3 3"
                />


                <XAxis
                  dataKey="month"
                  fontSize={12}
                />


                <YAxis
                  fontSize={12}
                />


                <Tooltip />



                <Area

                  type="monotone"

                  dataKey="applications"

                  stroke="#D4AF37"

                  strokeWidth={3}

                  fill="url(#applications)"

                />



                <Line

                  type="monotone"

                  dataKey="hired"

                  stroke="#22C55E"

                  strokeWidth={3}

                />


              </AreaChart>


            </ResponsiveContainer>


          </div>

        )

      }


    </motion.section>

  );

}
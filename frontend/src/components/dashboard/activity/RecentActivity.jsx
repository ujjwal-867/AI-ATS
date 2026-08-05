"use client";

import {useEffect,useState} from "react";
import {
  Upload,
  Sparkles,
  CalendarPlus,
  CheckCircle,
  Loader2,
} from "lucide-react";

import {getActivity} from "@/services/api";

const icons={
  upload:Upload,
  ai:Sparkles,
  interview:CalendarPlus,
  hired:CheckCircle,
};

export default function RecentActivity(){

  const [activities,setActivities]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{

    async function loadActivity(){

      try{
        const data=await getActivity();
        setActivities(data);
      }
      catch(error){
        console.log("Activity error",error);
      }
      finally{
        setLoading(false);
      }

    }

    loadActivity();

  },[]);


  if(loading){
    return(
      <div className="flex justify-center p-3">
        <Loader2 className="animate-spin text-[#D4AF37]"/>
      </div>
    );
  }


  return(
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

      <h2 className="mb-3 text-xl font-bold text-[#111827]">
        Recent Activity
      </h2>

      {activities.length===0 ? (

        <div className="rounded-xl bg-slate-50 p-3 text-center text-sm text-slate-500">
          No recent activity
        </div>

      ) : (

        <div className="space-y-2">

          {activities.map((item,index)=>{

            const Icon=icons[item.type] || Upload;

            return(
              <div
                key={index}
                className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
              >

                <div className="rounded-xl bg-[#FFF7DA] p-2">
                  <Icon
                    size={16}
                    className="text-[#D4AF37]"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-[#111827]">
                    {item.title}
                  </p>

                  <p className="text-xs text-slate-500">
                    {item.time}
                  </p>
                </div>

              </div>
            );

          })}

        </div>

      )}

    </section>
  );
}
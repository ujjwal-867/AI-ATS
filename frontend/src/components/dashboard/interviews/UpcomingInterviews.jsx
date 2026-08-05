"use client";

import {useEffect,useState} from "react";
import {CalendarDays,Clock,Video,Loader2} from "lucide-react";
import {getInterviewCandidates} from "@/services/api";

export default function UpcomingInterviews(){

const [interviews,setInterviews]=useState([]);
const [loading,setLoading]=useState(true);

useEffect(()=>{
async function load(){
try{
const data=await getInterviewCandidates();
setInterviews(data);
}catch(error){
console.log("Interview error",error);
}finally{
setLoading(false);
}
}
load();
},[]);

if(loading)
return(
<div className="flex justify-center p-4">
<Loader2 className="animate-spin text-[#D4AF37]"/>
</div>
);

return(
<section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

<div className="mb-4 flex items-center justify-between">
<h2 className="text-xl font-bold text-[#111827]">
Upcoming Interviews
</h2>
<CalendarDays className="text-[#D4AF37]"/>
</div>

{
interviews.length===0?

<div className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
No interviews scheduled
</div>

:

<div className="space-y-3">

{interviews.map((item)=>(

<div key={item.id} className="rounded-xl border border-slate-200 p-3">

<h3 className="font-semibold">
{item.name}
</h3>

<p className="text-sm text-slate-500">
{item.email}
</p>

<div className="mt-3 flex items-center justify-between text-sm">

<div className="flex items-center gap-2">
<Clock size={14}/>
{item.interview_date}
</div>

{item.meeting_link&&(
<a
href={item.meeting_link}
target="_blank"
className="flex items-center gap-1 font-medium text-green-600"
>
<Video size={14}/>
Join
</a>
)}

</div>

</div>

))}

</div>

}

</section>
);
}
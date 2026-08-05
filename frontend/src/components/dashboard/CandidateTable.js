"use client";

import {useEffect,useMemo,useState} from "react";
import {
  Search,
  Eye,
  CalendarPlus,
  Mail,
  Phone,
  Star,
  Loader2,
} from "lucide-react";

import {getCandidates} from "@/services/api";


function badge(status){

if(status==="Hired")
return "bg-green-100 text-green-700";

if(status==="Interview")
return "bg-blue-100 text-blue-700";

if(status==="Screening")
return "bg-yellow-100 text-yellow-700";

if(status==="Rejected")
return "bg-red-100 text-red-700";

return "bg-slate-100 text-slate-700";

}


export default function CandidateTable(){

const [candidates,setCandidates]=useState([]);
const [search,setSearch]=useState("");
const [loading,setLoading]=useState(true);


useEffect(()=>{

async function load(){

try{

const data=await getCandidates();

setCandidates(data);

}catch(error){

console.log(
"Candidates error",
error
);

}finally{

setLoading(false);

}

}

load();

},[]);



const filtered=useMemo(()=>{

return candidates.filter((c)=>
(
`${c.name} ${c.email} ${c.status}`
)
.toLowerCase()
.includes(
search.toLowerCase()
)
);

},[search,candidates]);



if(loading)

return(
<div className="flex justify-center p-4">
<Loader2 className="animate-spin text-[#D4AF37]"/>
</div>
);



return(

<section className="
rounded-2xl
border
border-slate-200
bg-white
shadow-sm
">


<div className="
flex
items-center
justify-between
border-b
p-4
">


<div>

<h2 className="
text-xl
font-bold
text-[#111827]
">
Recent Candidates
</h2>

<p className="text-sm text-slate-500">
AI ranked applicants
</p>

</div>


<div className="relative">

<Search
size={16}
className="
absolute
left-3
top-1/2
-translate-y-1/2
text-slate-400
"
/>


<input

value={search}

onChange={(e)=>setSearch(e.target.value)}

placeholder="Search..."

className="
h-10
w-64
rounded-xl
border
pl-9
pr-3
outline-none
focus:border-[#D4AF37]
"

/>

</div>


</div>



<div className="divide-y">


{
filtered.map((candidate)=>(


<div

key={candidate.id}

className="
flex
items-center
justify-between
p-4
hover:bg-[#FFFDF5]
"

>


<div className="
flex
items-center
gap-4
">


<div className="
flex
h-12
w-12
items-center
justify-center
rounded-full
bg-[#D4AF37]
font-bold
text-black
">

{candidate.name?.charAt(0)}

</div>



<div>

<h3 className="
font-semibold
text-[#111827]
">
{candidate.name}
</h3>


<p className="text-sm text-slate-500">
{candidate.email}
</p>


<div className="
mt-1
flex
gap-3
text-xs
text-slate-500
">

<Phone size={12}/>

{candidate.phone || "N/A"}

</div>


</div>


</div>



<div className="
flex
items-center
gap-3
">


<div className="
flex
items-center
gap-1
rounded-full
bg-[#FFF7DA]
px-3
py-1
">

<Star
size={14}
className="text-[#D4AF37]"
/>

<b>
{candidate.ats_score}%
</b>

</div>



<span className={`
rounded-full
px-3
py-1
text-xs
font-semibold
${badge(candidate.status)}
`}>

{candidate.status}

</span>



<button className="
rounded-lg
border
p-2
hover:border-[#D4AF37]
">

<Eye size={16}/>

</button>



<button className="
rounded-lg
bg-green-600
p-2
text-white
">

<CalendarPlus size={16}/>

</button>


</div>


</div>


))

}


</div>


</section>

);

}
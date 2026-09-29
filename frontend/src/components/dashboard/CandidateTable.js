"use client";

import {useEffect,useMemo,useState} from "react";

import {
  Search,
  Eye,
  CalendarPlus,
  Mail,
  Star,
} from "lucide-react";

import {getCandidates} from "@/services/api";


function badge(status){

if(status==="Hired")
return "bg-green-50 text-green-600";

if(status==="Interview")
return "bg-blue-50 text-blue-600";

if(status==="Screening")
return "bg-cyan-50 text-cyan-600";

return "bg-slate-50 text-slate-600";

}



export default function CandidateTable({
  onViewCandidate
}){


const [data,setData]=useState([]);
const [search,setSearch]=useState("");



useEffect(()=>{

async function load(){

try{

const result=await getCandidates();

setData(result);

}
catch(error){

console.log(
"Candidates error",
error
);

}

}

load();

},[]);




const candidates=useMemo(()=>{

return data.filter((c)=>

`${c.name}${c.email}${c.status}`
.toLowerCase()
.includes(
search.toLowerCase()
)

);

},[
data,
search
]);



return(

<section className="
bg-white
py-6
">


<div className="
mb-8
flex
items-center
justify-between
">


<div>

<h2 className="
text-3xl
font-bold
text-slate-900
">

Recent Candidates

</h2>


<p className="
mt-2
text-slate-500
">

AI ranked applicants

</p>


</div>



<div className="
relative
">


<Search

size={16}

className="
absolute
left-4
top-1/2
-translate-y-1/2
text-slate-400
"

/>



<input

value={search}

onChange={(e)=>
setSearch(e.target.value)
}

placeholder="Search candidates"

className="
h-11
w-64
rounded-xl
bg-slate-50
pl-11
pr-4
text-sm
text-slate-900
focus:bg-white
"

/>


</div>


</div>





<div className="
space-y-4
">


{
candidates.map((c)=>(


<div

key={c.id}

className="
flex
items-center
justify-between
rounded-2xl
bg-white
p-5
transition
hover:bg-slate-50
"


>



<div className="
flex
items-center
gap-5
">


<div className="
flex
h-12
w-12
items-center
justify-center
rounded-full
bg-blue-50
font-bold
text-blue-600
">

{c.name?.[0]}

</div>




<div>


<h3 className="
font-semibold
text-slate-900
">

{c.name}

</h3>


<p className="
text-sm
text-slate-500
">

{c.email}

</p>



<p className="
mt-1
text-xs
text-slate-400
">

<Mail
size={12}
className="inline mr-1"
/>

{c.phone}

</p>


</div>


</div>





<div className="
flex
items-center
gap-4
">


<span className="
flex
items-center
gap-1
rounded-full
bg-blue-50
px-3
py-1
text-sm
font-semibold
text-blue-600
">

<Star size={13}/>

{c.ats_score || 0}%

</span>




<span className={`
rounded-full
px-3
py-1
text-sm
font-medium
${badge(c.status)}
`}>

{c.status}

</span>




<button

onClick={()=>
onViewCandidate(c.id)
}

className="
rounded-xl
bg-slate-50
p-3
text-slate-600
hover:bg-blue-50
hover:text-blue-600
"

>

<Eye size={16}/>

</button>





<a

href={`/interviews?candidate=${c.id}`}

className="
rounded-xl
bg-green-600
p-3
text-white
hover:bg-green-700
"

>

<CalendarPlus size={16}/>

</a>



</div>


</div>


))

}


</div>


</section>

);

}
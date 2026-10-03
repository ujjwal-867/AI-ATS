"use client";


import {
  useState
} from "react";


import AppLayout from "@/components/layout/AppLayout";
import DashboardHeader from "@/components/dashboard/header/DashboardHeader";

import {
  createJob
} from "@/services/api";

import {
  useRouter
} from "next/navigation";



export default function CreateJobPage(){


const router = useRouter();


const [form,setForm]=useState({

title:"",
company:"",
description:"",
skills:""

});


const [loading,setLoading]=useState(false);



function handleChange(e){

setForm({

...form,

[e.target.name]:e.target.value

});

}




async function submit(e){

e.preventDefault();


try{


setLoading(true);


await createJob({

title:form.title,

company:form.company,

description:form.description,

      skills: form.skills
        ? form.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean)
        : [],

});


router.push("/jobs");


}

catch(error){

console.log(error);

alert(
"Failed to create job"
);

}

finally{

setLoading(false);

}


}





return (

<AppLayout>


<div
className="
mx-auto
max-w-[1700px]
space-y-8
"
>


<DashboardHeader/>




<div
className="
rounded-3xl
border
bg-white
p-10
"
>


<h1
className="
text-4xl
font-bold
text-slate-900
"
>

Create Job

</h1>



<p
className="
mt-3
text-slate-500
"
>

Add a new recruitment position

</p>





<form

onSubmit={submit}

className="
mt-8
space-y-5
"

>


<input

name="title"

onChange={handleChange}

placeholder="Job Title"

className="
w-full
rounded-xl
border
p-4
"

/>




<input

name="company"

onChange={handleChange}

placeholder="Company"

className="
w-full
rounded-xl
border
p-4
"

/>




<textarea

name="description"

onChange={handleChange}

placeholder="Job Description"

className="
h-32
w-full
rounded-xl
border
p-4
"

/>





<input

name="skills"

onChange={handleChange}

placeholder="Skills (React, Next.js, Python)"

className="
w-full
rounded-xl
border
p-4
"

/>





<button

disabled={loading}

className="
rounded-xl
bg-blue-600
px-10
py-4
font-bold
text-white
"

>

{
loading
?
"Creating..."
:
"Create Job"
}


</button>



</form>


</div>


</div>


</AppLayout>

);

}
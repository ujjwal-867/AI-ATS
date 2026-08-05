"use client";

import {useEffect,useState} from "react";
import {useParams} from "next/navigation";

import {
  User,
  Mail,
  Phone,
  Star,
  FileText,
  Download,
} from "lucide-react";

import {getCandidateById} from "@/services/api";


export default function CandidateProfile(){

  const {id}=useParams();

  const [candidate,setCandidate]=useState(null);


  useEffect(()=>{

    async function load(){

      const data=await getCandidateById(id);

      setCandidate(data);

    }

    if(id) load();

  },[id]);


  if(!candidate){

    return(
      <div className="p-5">
        Loading...
      </div>
    );

  }


  const skills=JSON.parse(candidate.skills || "[]");
  const certifications=JSON.parse(candidate.certifications || "[]");
  const education=JSON.parse(candidate.education || "{}");
  const experience=JSON.parse(candidate.experience || "{}");


  return(

    <div className="space-y-4 p-5">


      {/* Header */}

      <section className="rounded-2xl border bg-white p-4">

        <div className="flex justify-between">

          <div>

            <h1 className="text-2xl font-bold">
              {candidate.name}
            </h1>

            <p className="text-slate-500">
              {candidate.status}
            </p>

          </div>


          <div className="rounded-xl bg-yellow-100 p-3">

            <Star className="text-yellow-600"/>

            <span className="font-bold">
              {candidate.ats_score}%
            </span>

          </div>


        </div>


        <div className="mt-3 space-y-1 text-sm">

          <p>
            <Mail className="mr-2 inline" size={15}/>
            {candidate.email}
          </p>

          <p>
            <Phone className="mr-2 inline" size={15}/>
            {candidate.phone}
          </p>

        </div>

      </section>



      {/* Resume */}

      <section className="rounded-2xl border bg-white p-4">

        <h2 className="mb-3 font-bold">
          Resume
        </h2>


        <a
          href={`http://127.0.0.1:8000/${candidate.resume_url}`}
          target="_blank"
          className="inline-flex items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2"
        >

          <FileText size={16}/>

          View Resume

        </a>


      </section>



      {/* Skills */}

      <section className="rounded-2xl border bg-white p-4">

        <h2 className="mb-3 font-bold">
          Skills
        </h2>


        <div className="flex flex-wrap gap-2">

          {skills.map(skill=>(

            <span
              key={skill}
              className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
            >
              {skill}
            </span>

          ))}

        </div>


      </section>



      {/* Education */}

      <section className="rounded-2xl border bg-white p-4">

        <h2 className="font-bold">
          Education
        </h2>

        <p className="mt-2 text-sm">
          {education.degree}
        </p>

        <p className="text-sm text-slate-500">
          {education.years?.join(" - ")}
        </p>


      </section>



      {/* Experience */}

      <section className="rounded-2xl border bg-white p-4">

        <h2 className="font-bold">
          Experience
        </h2>

        <p className="mt-2 text-sm">
          {experience.job_titles?.join(", ")}
        </p>

        <p className="text-sm text-slate-500">
          {experience.years} years
        </p>


      </section>



      {/* Certifications */}

      <section className="rounded-2xl border bg-white p-4">

        <h2 className="font-bold">
          Certifications
        </h2>


        <ul className="mt-2 list-disc pl-5 text-sm">

          {certifications.map((item,index)=>(

            <li key={index}>
              {item}
            </li>

          ))}

        </ul>


      </section>


    </div>

  );

}
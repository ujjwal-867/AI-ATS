"use client";

import {useEffect,useState} from "react";
import {useParams} from "next/navigation";
import {
  Mail,
  Phone,
  Star,
  GraduationCap,
  Briefcase,
  Award,
} from "lucide-react";

import {getCandidateById} from "@/services/api";
import ResumeViewer from "@/components/candidate-profile/ResumeViewer";


function parseJSON(data,fallback="{}"){
  try{
    return JSON.parse(data || fallback);
  }
  catch{
    return JSON.parse(fallback);
  }
}


export default function CandidateProfile(){

  const {id}=useParams();
  const [candidate,setCandidate]=useState(null);


  useEffect(()=>{

    if(!id) return;

    getCandidateById(id)
      .then(setCandidate)
      .catch(console.log);

  },[id]);


  if(!candidate)
    return <div className="p-4 text-sm">Loading...</div>;


  const skills=parseJSON(candidate.skills,"[]");
  const education=parseJSON(candidate.education);
  const experience=parseJSON(candidate.experience);
  const certifications=parseJSON(candidate.certifications,"[]");


  return (

    <main className="page-background min-h-screen p-4">

      <div className="mx-auto max-w-4xl space-y-2">


        <section className="rounded-2xl border bg-white p-4 card-shadow">

          <div className="flex justify-between">

            <div>

              <h1 className="text-2xl font-bold">
                {candidate.name}
              </h1>

              <p className="text-sm text-slate-500">
                {candidate.status}
              </p>


              <div className="mt-2 space-y-1 text-sm text-slate-600">

                <p>
                  <Mail size={14} className="mr-2 inline"/>
                  {candidate.email}
                </p>

                <p>
                  <Phone size={14} className="mr-2 inline"/>
                  {candidate.phone}
                </p>

              </div>

            </div>


            <div className="rounded-xl bg-[#FFF8E1] p-3 text-center">

              <Star
                size={18}
                className="mx-auto text-[#D4AF37]"
              />

              <h2 className="text-2xl font-bold">
                {candidate.ats_score}%
              </h2>

              <p className="text-xs text-slate-500">
                ATS
              </p>

            </div>

          </div>

        </section>


        <ResumeViewer
          resumeUrl={candidate.resume_url}
        />


        <section className="rounded-2xl border bg-white p-3 card-shadow">

          <h2 className="mb-2 font-bold">
            Skills
          </h2>


          <div className="flex flex-wrap gap-1">

            {
              skills.map(skill=>(

                <span
                  key={skill}
                  className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700"
                >
                  {skill}
                </span>

              ))
            }

          </div>

        </section>


        <div className="grid gap-2 md:grid-cols-2">


          <section className="rounded-2xl border bg-white p-3 card-shadow">

            <div className="flex items-center gap-2">

              <GraduationCap size={18} className="text-[#D4AF37]"/>

              <h2 className="font-bold">
                Education
              </h2>

            </div>


            <p className="mt-2 text-sm">
              {education.degree}
            </p>

            <p className="text-xs text-slate-500">
              {education.years?.join(" - ")}
            </p>

          </section>



          <section className="rounded-2xl border bg-white p-3 card-shadow">

            <div className="flex items-center gap-2">

              <Briefcase size={18} className="text-[#D4AF37]"/>

              <h2 className="font-bold">
                Experience
              </h2>

            </div>


            <p className="mt-2 text-sm">
              {experience.job_titles?.join(", ")}
            </p>

            <p className="text-xs text-slate-500">
              {experience.years || 0} years
            </p>

          </section>


        </div>



        <section className="rounded-2xl border bg-white p-3 card-shadow">

          <div className="flex items-center gap-2">

            <Award size={18} className="text-[#D4AF37]"/>

            <h2 className="font-bold">
              Certifications
            </h2>

          </div>


          <ul className="mt-2 space-y-1 text-sm">

            {
              certifications.map((item,index)=>(
                <li key={index}>
                  • {item}
                </li>
              ))
            }

          </ul>

        </section>


      </div>

    </main>

  );

}
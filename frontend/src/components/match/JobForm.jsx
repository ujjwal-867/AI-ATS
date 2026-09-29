"use client";

import JDInput from "./JDInput";

import { createJob } from "@/services/api";


export default function JobForm({
  jobTitle,
  setJobTitle,
  company,
  setCompany,
  experience,
  setExperience,
  jobDescription,
  setJobDescription,
  onAnalyze,
  loading,
  setJobId,
}) {


  async function handleCreateJob(){

    try{

      const job = await createJob({

        title: jobTitle,

        company,

        location:"Remote",

        employment_type:"Full Time",

        experience,

        salary:"",

        description:jobDescription,

      });


      setJobId(job.id);


      onAnalyze(job.id);


    }
    catch(error){

      console.log(
        "Job creation error",
        error
      );

    }

  }



  return (

    <div className="rounded-3xl bg-white p-6">


      <div className="mb-5">

        <h2 className="text-xl font-bold text-slate-900">
          Job Information
        </h2>

        <p className="text-sm text-slate-500">
          Enter job details and rank candidates using AI.
        </p>

      </div>



      <div className="space-y-4">


        <input

          value={jobTitle}

          onChange={(e)=>setJobTitle(e.target.value)}

          placeholder="Job Title"

          className="
          w-full
          rounded-xl
          bg-slate-50
          px-4
          py-3
          "

        />



        <input

          value={company}

          onChange={(e)=>setCompany(e.target.value)}

          placeholder="Company"

          className="
          w-full
          rounded-xl
          bg-slate-50
          px-4
          py-3
          "

        />



        <select

          value={experience}

          onChange={(e)=>setExperience(e.target.value)}

          className="
          w-full
          rounded-xl
          bg-slate-50
          px-4
          py-3
          "

        >

          <option>0-2 Years</option>
          <option>2-4 Years</option>
          <option>4-6 Years</option>
          <option>6+ Years</option>

        </select>




        <JDInput

          jobDescription={jobDescription}

          setJobDescription={setJobDescription}

        />




        <button

          onClick={handleCreateJob}

          disabled={loading}

          className="
          w-full
          rounded-xl
          bg-blue-600
          py-3
          font-semibold
          text-white
          "

        >

          {
            loading
            ? "Analyzing..."
            : "Analyze Candidates"
          }

        </button>


      </div>


    </div>

  );
}
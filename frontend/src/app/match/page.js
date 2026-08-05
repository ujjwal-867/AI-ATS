"use client";

import {useEffect,useState} from "react";
import {CheckCircle,XCircle,Loader2} from "lucide-react";
import {getJobs,getRanking} from "@/services/api";

export default function MatchSection(){

  const [jobs,setJobs]=useState([]);
  const [jobId,setJobId]=useState("");
  const [results,setResults]=useState([]);
  const [loading,setLoading]=useState(false);

  useEffect(()=>{
    async function loadJobs(){
      try{
        const data=await getJobs();
        setJobs(data);
        if(data.length)setJobId(data[0].id);
      }catch(error){
        console.log("Jobs error",error);
      }
    }
    loadJobs();
  },[]);

  async function runMatching(){
    if(!jobId)return;

    try{
      setLoading(true);
      const data=await getRanking(jobId);
      setResults(data);
    }catch(error){
      console.log("Matching error",error);
    }finally{
      setLoading(false);
    }
  }

  return(
    <div className="rounded-2xl bg-white p-4">

      <div className="flex gap-3">
        <select
          value={jobId}
          onChange={(e)=>setJobId(e.target.value)}
          className="flex-1 rounded-xl border p-2"
        >
          {jobs.map(job=>(
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>

        <button
          onClick={runMatching}
          className="rounded-xl bg-[#D4AF37] px-4 font-semibold text-black"
        >
          Match
        </button>
      </div>

      {loading&&(
        <div className="flex justify-center p-3">
          <Loader2 className="animate-spin"/>
        </div>
      )}

      <div className="mt-4 space-y-2">
        {results.map(candidate=>(
          <div
            key={candidate.candidate_id}
            className="rounded-xl border p-3"
          >

            <div className="flex justify-between">
              <h2 className="font-bold">
                {candidate.candidate_name}
              </h2>

              <span className="font-bold text-green-600">
                {candidate.match_score}%
              </span>
            </div>

            <p className="text-sm text-slate-500">
              {candidate.recommendation}
            </p>

            <div className="mt-2 flex flex-wrap gap-1">
              {candidate.matched_skills.map(skill=>(
                <span
                  key={skill}
                  className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700"
                >
                  <CheckCircle size={12} className="inline mr-1"/>
                  {skill}
                </span>
              ))}

              {candidate.missing_skills.map(skill=>(
                <span
                  key={skill}
                  className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-700"
                >
                  <XCircle size={12} className="inline mr-1"/>
                  {skill}
                </span>
              ))}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
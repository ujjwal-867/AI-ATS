"use client";

import {useEffect,useState} from "react";
import Link from "next/link";
import SearchFilter from "./SearchFilter";

export default function CandidateTable(){

  const [candidates,setCandidates]=useState([]);
  const [search,setSearch]=useState("");
  const [status,setStatus]=useState("All");
  const [minScore,setMinScore]=useState("");

  useEffect(()=>{

    async function fetchCandidates(){

      try{

        const response=await fetch(
          "http://127.0.0.1:8000/api/candidates/"
        );

        const data=await response.json();

        setCandidates(data);

      }catch(error){

        console.log(error);

      }

    }

    fetchCandidates();

  },[]);


  const filteredCandidates=candidates.filter(candidate=>{

    const matchSearch=
      candidate.name
      ?.toLowerCase()
      .includes(search.toLowerCase());


    const matchStatus=
      status==="All" ||
      candidate.status===status ||
      (status==="Hired" && candidate.status==="Selected") ||
      (status==="Selected" && candidate.status==="Hired");


    const matchScore=
      minScore==="" ||
      candidate.ats_score>=Number(minScore);


    return (
      matchSearch &&
      matchStatus &&
      matchScore
    );

  });


  return(
    <>

      <SearchFilter
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        minScore={minScore}
        setMinScore={setMinScore}
      />


      <div className="overflow-x-auto rounded-2xl bg-slate-900 p-4">

        <table className="w-full text-white">

          <thead>
            <tr className="border-b border-slate-700">

              <th className="p-3 text-left">
                Name
              </th>

              <th className="p-3 text-left">
                Email
              </th>

              <th className="p-3">
                ATS
              </th>

              <th className="p-3">
                Status
              </th>

              <th className="p-3">
                Action
              </th>

            </tr>
          </thead>


          <tbody>

            {filteredCandidates.map(candidate=>(

              <tr
                key={candidate.id}
                className="border-b border-slate-800"
              >

                <td className="p-3">
                  {candidate.name}
                </td>


                <td className="p-3">
                  {candidate.email}
                </td>


                <td className="p-3 text-center">
                  {candidate.ats_score}%
                </td>


                <td className="p-3 text-center">
                  {candidate.status}
                </td>


                <td className="p-3 text-center">

                  <Link
                    href={`/candidates/${candidate.id}`}
                    className="
                    rounded-xl
                    bg-indigo-600
                    px-3
                    py-1
                    text-sm
                    "
                  >
                    View
                  </Link>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </>
  );
}
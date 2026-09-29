"use client";

import { useState } from "react";

import JobForm from "./JobForm";
import MatchResults from "./MatchResults";
import RecommendationCard from "./RecommendationCard";
import CandidateProfileDrawer from "@/components/candidate-profile/CandidateProfileDrawer";

import { getRanking } from "@/services/api";


export default function MatchSection() {


  const [jobId,setJobId] = useState("");

  const [jobTitle,setJobTitle] = useState("");
  const [company,setCompany] = useState("");
  const [experience,setExperience] = useState("0-2 Years");
  const [jobDescription,setJobDescription] = useState("");

  const [results,setResults] = useState([]);

  const [loading,setLoading] = useState(false);


  const [selectedCandidate,setSelectedCandidate] = useState(null);
  const [isDrawerOpen,setIsDrawerOpen] = useState(false);



  async function handleMatch(id){

    if(!id) return;


    try{

      setLoading(true);


      const data = await getRanking(id);


      setResults(
        data.ranking || []
      );


    }
    catch(error){

      console.log(
        "Ranking error",
        error
      );

    }
    finally{

      setLoading(false);

    }

  }




  function handleViewProfile(candidate){

    setSelectedCandidate(candidate);

    setIsDrawerOpen(true);

  }




  function handleCloseDrawer(){

    setSelectedCandidate(null);

    setIsDrawerOpen(false);

  }




  return (

    <>


      <div className="space-y-5">


        <div className="grid gap-5 xl:grid-cols-3">


          <div className="xl:col-span-2">


            <JobForm

              jobTitle={jobTitle}
              setJobTitle={setJobTitle}


              company={company}
              setCompany={setCompany}


              experience={experience}
              setExperience={setExperience}


              jobDescription={jobDescription}
              setJobDescription={setJobDescription}


              setJobId={setJobId}


              onAnalyze={handleMatch}


              loading={loading}

            />


          </div>



          <RecommendationCard

            results={results}

          />


        </div>




        <MatchResults

          results={results}

          onViewProfile={handleViewProfile}

        />



      </div>




      <CandidateProfileDrawer

        open={isDrawerOpen}

        candidate={selectedCandidate}

        onClose={handleCloseDrawer}

      />


    </>

  );

}
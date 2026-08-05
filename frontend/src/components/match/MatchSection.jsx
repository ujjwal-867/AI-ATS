"use client";

import { useState } from "react";

import JobForm from "./JobForm";
import MatchResults from "./MatchResults";
import RecommendationCard from "./RecommendationCard";
import CandidateProfileDrawer from "@/components/candidate-profile/CandidateProfileDrawer";

export default function MatchSection() {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [experience, setExperience] = useState("0-2 Years");
  const [jobDescription, setJobDescription] = useState("");

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Drawer State
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  async function handleMatch() {
    if (!jobDescription.trim()) return;

    try {
      setLoading(true);

      const response = await fetch("/api/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobTitle,
          company,
          experience,
          jobDescription,
        }),
      });

      const data = await response.json();

      setResults(data.results || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function handleViewProfile(candidate) {
    setSelectedCandidate(candidate);
    setIsDrawerOpen(true);
  }

  function handleCloseDrawer() {
    setSelectedCandidate(null);
    setIsDrawerOpen(false);
  }

  return (
    <>
      <div className="space-y-10">
        <div className="grid gap-8 xl:grid-cols-3">
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
              onAnalyze={handleMatch}
              loading={loading}
            />
          </div>

          <RecommendationCard results={results} />
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
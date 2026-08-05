"use client";

import CandidateCard from "./cards/CandidateCard";
import SectionCard from "@/components/shared/SectionCard";

export default function MatchResults({
  results,
  onViewProfile,
}) {
  if (!results.length) {
    return (
      <SectionCard
        title="Candidate Rankings"
        subtitle="Matching results will appear here after analysis."
      >
        <div className="flex h-56 items-center justify-center rounded-2xl border-2 border-dashed border-slate-700">
          <p className="text-lg text-slate-400">
            No candidates analyzed yet.
          </p>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Candidate Rankings"
      subtitle={`${results.length} Candidate${
        results.length > 1 ? "s" : ""
      } Found`}
    >
      <div className="space-y-6">
        {results.map((candidate, index) => (
          <CandidateCard
            key={candidate._id}
            candidate={candidate}
            rank={index}
            onViewProfile={onViewProfile}
          />
        ))}
      </div>
    </SectionCard>
  );
}
"use client";

import {
  Trophy,
  Brain,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import SectionCard from "@/components/shared/SectionCard";
import ProgressBar from "@/components/shared/ProgressBar";
import StatusBadge from "@/components/shared/StatusBadge";

export default function RecommendationCard({ results }) {
  if (!results.length) {
    return (
      <SectionCard
        title="AI Recommendation"
        subtitle="Analyze a job description to receive an AI recommendation."
      >
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Brain className="mb-4 h-16 w-16 text-indigo-400" />

          <p className="max-w-sm text-slate-400">
            AI will recommend the strongest candidate
            based on skills, ATS score and job
            description.
          </p>
        </div>
      </SectionCard>
    );
  }

  const bestCandidate = results[0];

  const confidence =
    bestCandidate.matchScore >= 90
      ? "HIGH"
      : bestCandidate.matchScore >= 70
      ? "MEDIUM"
      : "LOW";

  const recommendation =
    bestCandidate.matchScore >= 85
      ? "Proceed to Technical Interview"
      : bestCandidate.matchScore >= 70
      ? "Keep for Next Round"
      : "Not Recommended";

  return (
    <SectionCard
      title="AI Recommendation"
      subtitle="Top candidate selected by AI"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500/20">
          <Trophy className="h-8 w-8 text-yellow-400" />
        </div>

        <div>
          <h3 className="text-xl font-bold text-white">
            {bestCandidate.name}
          </h3>

          <p className="text-slate-400">
            Best Candidate
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-slate-300">
            Match Score
          </span>

          <span className="font-bold text-white">
            {bestCandidate.matchScore}%
          </span>
        </div>

        <ProgressBar value={bestCandidate.matchScore} />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <span className="text-slate-300">
          Confidence
        </span>

        <StatusBadge status={confidence} />
      </div>

      <div className="mt-8 rounded-2xl bg-indigo-950/40 p-4">
        <h4 className="font-semibold text-indigo-300">
          Recommendation
        </h4>

        <p className="mt-2 text-white">
          {recommendation}
        </p>
      </div>

      <div className="mt-8">
        <h4 className="mb-3 font-semibold text-green-400">
          Strengths
        </h4>

        <div className="space-y-2">
          {bestCandidate.matchedSkills
            .slice(0, 4)
            .map((skill) => (
              <div
                key={skill}
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4 text-green-400" />

                <span className="text-slate-200">
                  {skill}
                </span>
              </div>
            ))}
        </div>
      </div>

      <div className="mt-8">
        <h4 className="mb-3 font-semibold text-red-400">
          Missing Skills
        </h4>

        <div className="space-y-2">
          {bestCandidate.missingSkills.length ? (
            bestCandidate.missingSkills
              .slice(0, 4)
              .map((skill) => (
                <div
                  key={skill}
                  className="flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4 text-red-400" />

                  <span className="text-slate-200">
                    {skill}
                  </span>
                </div>
              ))
          ) : (
            <p className="text-green-400">
              No missing skills 🎉
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950 p-4">
        <h4 className="font-semibold text-indigo-400">
          AI Summary
        </h4>

        <p className="mt-2 text-sm leading-7 text-slate-300">
          This candidate demonstrates a strong alignment
          with the required technical skills and is the
          highest-ranked applicant. Based on the current
          evaluation, the candidate is recommended to
          proceed to the next stage of the hiring process.
        </p>
      </div>
    </SectionCard>
  );
}
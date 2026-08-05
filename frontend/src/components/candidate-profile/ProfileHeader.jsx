"use client";

import { Mail, Award } from "lucide-react";
import ProgressBar from "@/components/shared/ProgressBar";
import StatusBadge from "@/components/shared/StatusBadge";

export default function ProfileHeader({ candidate }) {
  if (!candidate) return null;

  const confidence =
    candidate.matchScore >= 90
      ? "HIGH"
      : candidate.matchScore >= 70
      ? "MEDIUM"
      : "LOW";

  return (
    <div className="border-b border-slate-800 pb-6">
      <div className="flex items-center gap-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600 text-3xl font-bold text-white">
          {candidate.name?.charAt(0)?.toUpperCase() || "?"}
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white">
            {candidate.name}
          </h2>

          <div className="mt-2 flex items-center gap-2 text-slate-400">
            <Mail className="h-4 w-4" />
            <span>{candidate.email}</span>
          </div>

          <div className="mt-4">
            <StatusBadge status={confidence} />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-slate-300">
            Match Score
          </span>

          <span className="font-semibold text-white">
            {candidate.matchScore}%
          </span>
        </div>

        <ProgressBar value={candidate.matchScore} />
      </div>

      <div className="mt-6 flex items-center gap-2 text-indigo-300">
        <Award className="h-5 w-5" />
        <span>AI Recommended Candidate</span>
      </div>
    </div>
  );
}
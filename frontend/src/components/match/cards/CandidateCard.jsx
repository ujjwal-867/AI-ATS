"use client";

import {
  Eye,
  Trophy,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function CandidateCard({
  candidate,
  rank,
  onViewProfile,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 font-bold text-white">
              #{rank + 1}
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">
                {candidate.name}
              </h2>

              <p className="text-slate-400">
                {candidate.email}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => onViewProfile(candidate)}
          className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-slate-300 transition hover:border-indigo-500 hover:text-white"
        >
          <Eye className="h-4 w-4" />
          View Profile
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {candidate.matchedSkills?.map((skill) => (
          <span
            key={skill}
            className="flex items-center gap-1 rounded-full bg-green-900/40 px-3 py-1 text-sm text-green-300"
          >
            <CheckCircle2 className="h-4 w-4" />
            {skill}
          </span>
        ))}
      </div>

      {candidate.missingSkills?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {candidate.missingSkills.map((skill) => (
            <span
              key={skill}
              className="flex items-center gap-1 rounded-full bg-red-900/40 px-3 py-1 text-sm text-red-300"
            >
              <XCircle className="h-4 w-4" />
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-yellow-400">
          <Trophy className="h-5 w-5" />
          <span className="font-medium">
            Match Score
          </span>
        </div>

        <div className="rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white">
          {candidate.matchScore}%
        </div>
      </div>
    </div>
  );
}
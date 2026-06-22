"use client";

import { useState } from "react";

export default function MatchSection() {
  const [jobDescription, setJobDescription] =
    useState("");

  const [results, setResults] = useState([]);

  async function handleMatch() {
    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription,
        }),
      });

      const data = await response.json();

      setResults(data.results);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
      <textarea
        rows={8}
        value={jobDescription}
        onChange={(e) =>
          setJobDescription(e.target.value)
        }
        placeholder="Paste Job Description..."
        className="w-full rounded-2xl border border-slate-700 bg-slate-900 p-5 text-white outline-none"
      />

      <button
        onClick={handleMatch}
        className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
      >
        Match Candidates
      </button>

      <div className="mt-10 space-y-6">
        {results.map((candidate) => (
          <div
            key={candidate._id}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
          >
            <h2 className="text-2xl font-bold text-white">
              {candidate.name}
            </h2>

            <p className="mt-2 text-slate-400">
              {candidate.email}
            </p>

            <div className="mt-4">
              <span className="rounded-xl bg-green-600 px-4 py-2 text-white">
                Match Score: {candidate.matchScore}%
              </span>
            </div>

            <div className="mt-6">
              <h3 className="mb-2 font-semibold text-green-400">
                Matched Skills
              </h3>

              <div className="flex flex-wrap gap-2">
                {candidate.matchedSkills.map(
                  (skill) => (
                    <span
                      key={skill}
                      className="rounded-lg bg-green-800 px-3 py-1 text-white"
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="mb-2 font-semibold text-red-400">
                Missing Skills
              </h3>

              <div className="flex flex-wrap gap-2">
                {candidate.missingSkills.map(
                  (skill) => (
                    <span
                      key={skill}
                      className="rounded-lg bg-red-800 px-3 py-1 text-white"
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
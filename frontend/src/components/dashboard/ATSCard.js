"use client";

import { useState } from "react";

export default function ATSCard() {
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);

  function calculateScore() {
    const skills = [
      "react",
      "javascript",
      "node",
      "mongodb",
      "express",
      "tailwind",
      "nextjs",
      "python",
      "docker",
      "aws",
    ];

    const text = jobDescription.toLowerCase();

    const matched = skills.filter((skill) =>
      text.includes(skill)
    );

    const missing = skills.filter(
      (skill) => !matched.includes(skill)
    );

    const score = Math.round(
      (matched.length / skills.length) * 100
    );

    setResult({
      score,
      matched,
      missing,
    });
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
      <h1 className="mb-6 text-3xl font-bold text-white">
        ATS Score Engine
      </h1>

      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste Job Description..."
        className="mb-4 h-40 w-full rounded-xl bg-slate-800 p-4 text-white outline-none"
      />

      <button
        onClick={calculateScore}
        className="rounded-xl bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
      >
        Calculate ATS Score
      </button>

      {result && (
        <div className="mt-8">
          <h2 className="text-4xl font-bold text-green-400">
            ATS Score: {result.score}%
          </h2>

          <div className="mt-6">
            <h3 className="text-xl text-white">
              Matched Skills
            </h3>

            <ul className="mt-2 text-green-400">
              {result.matched.map((skill) => (
                <li key={skill}>✓ {skill}</li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <h3 className="text-xl text-white">
              Missing Skills
            </h3>

            <ul className="mt-2 text-red-400">
              {result.missing.map((skill) => (
                <li key={skill}>✗ {skill}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
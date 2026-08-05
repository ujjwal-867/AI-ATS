"use client";

import JDInput from "./JDInput";

export default function JobForm({
  jobTitle,
  setJobTitle,
  company,
  setCompany,
  experience,
  setExperience,
  jobDescription,
  setJobDescription,
  onAnalyze,
  loading,
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">
          Job Information
        </h2>

        <p className="mt-2 text-slate-400">
          Enter the job details and let AI find the
          best candidates.
        </p>
      </div>

      <div className="space-y-6">
        {/* Job Title */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Job Title
          </label>

          <input
            type="text"
            value={jobTitle}
            onChange={(e) =>
              setJobTitle(e.target.value)
            }
            placeholder="Frontend Developer"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
          />
        </div>

        {/* Company */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Company
          </label>

          <input
            type="text"
            value={company}
            onChange={(e) =>
              setCompany(e.target.value)
            }
            placeholder="Google"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
          />
        </div>

        {/* Experience */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Experience Required
          </label>

          <select
            value={experience}
            onChange={(e) =>
              setExperience(e.target.value)
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
          >
            <option>0-2 Years</option>
            <option>2-4 Years</option>
            <option>4-6 Years</option>
            <option>6-8 Years</option>
            <option>8+ Years</option>
          </select>
        </div>

        {/* Job Description */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Job Description
          </label>

          <JDInput
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
          />
        </div>

        <button
          onClick={onAnalyze}
          disabled={loading}
          className="w-full rounded-xl bg-indigo-600 px-6 py-4 text-lg font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Analyzing Candidates..."
            : "Analyze Candidates"}
        </button>
      </div>
    </div>
  );
}
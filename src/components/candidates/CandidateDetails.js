"use client";

import InterviewScheduler from "./InterviewScheduler";

export default function CandidateDetails({ candidate }) {
  if (!candidate) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <h1 className="text-white text-2xl">
          Candidate not found
        </h1>
      </div>
    );
  }

  async function updateStatus(status) {
    try {
      await fetch(
        `/api/candidates/${candidate._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      location.reload();
    } catch (error) {
      console.log(error);
    }
  }

  async function deleteCandidate() {
    try {
      await fetch(
        `/api/candidates/${candidate._id}`,
        {
          method: "DELETE",
        }
      );

      window.location.href = "/candidates";
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-slate-900 p-8 text-white">
        <h1 className="text-4xl font-bold">
          {candidate.name}
        </h1>

        <p className="mt-2 text-slate-400">
          {candidate.email}
        </p>

        <p className="text-slate-400">
          {candidate.phone}
        </p>

        <div className="mt-8">
          <h2 className="mb-2 text-xl font-semibold">
            ATS Score
          </h2>

          <p className="text-3xl text-green-400">
            {candidate.score}%
          </p>
        </div>

        <div className="mt-8">
          <h2 className="mb-3 text-xl font-semibold">
            Skills
          </h2>

          <div className="flex flex-wrap gap-2">
            {candidate.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-xl bg-slate-800 px-3 py-1"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-3 text-xl font-semibold">
            Status
          </h2>

          <p>{candidate.status}</p>
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={() =>
              updateStatus("Shortlisted")
            }
            className="rounded-xl bg-green-600 px-5 py-2"
          >
            Shortlist
          </button>

          <button
            onClick={() =>
              updateStatus("Rejected")
            }
            className="rounded-xl bg-red-600 px-5 py-2"
          >
            Reject
          </button>

          <button
            onClick={deleteCandidate}
            className="rounded-xl bg-slate-700 px-5 py-2"
          >
            Delete
          </button>
        </div>
      </div>

      <InterviewScheduler
        candidateId={candidate._id}
      />

      <div className="rounded-3xl bg-slate-900 p-8 text-white">
        <h2 className="mb-4 text-2xl font-bold">
          Resume Text
        </h2>

        <div className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-6">
          {candidate.resumeText}
        </div>
      </div>
    </div>
  );
}
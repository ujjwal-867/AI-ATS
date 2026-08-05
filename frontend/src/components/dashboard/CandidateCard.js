"use client";

export default function CandidateCard({ candidate }) {
  async function updateStatus(status) {
    try {
      const response = await fetch(
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

      const data = await response.json();

      console.log(data);

      // Refresh page after update
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <h2 className="text-2xl font-bold text-white">
        {candidate.name}
      </h2>

      <p className="mt-2 text-slate-400">
        {candidate.email}
      </p>

      <p className="mt-2 text-slate-400">
        {candidate.phone}
      </p>

      <div className="mt-4">
        <span className="rounded-xl bg-indigo-600 px-3 py-1 text-white">
          ATS Score: {candidate.score}%
        </span>
      </div>

      <div className="mt-4">
        <span
          className={`rounded-xl px-3 py-1 text-white
          ${
            candidate.status === "Shortlisted"
              ? "bg-green-600"
              : candidate.status === "Rejected"
              ? "bg-red-600"
              : "bg-yellow-600"
          }`}
        >
          {candidate.status}
        </span>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => updateStatus("Shortlisted")}
          className="rounded-xl bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Shortlist
        </button>

        <button
          onClick={() => updateStatus("Rejected")}
          className="rounded-xl bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
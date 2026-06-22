"use client";

export default function SearchFilter({
  search,
  setSearch,
  status,
  setStatus,
  minScore,
  setMinScore,
}) {
  return (
    <div className="mb-8 grid gap-4 md:grid-cols-3">
      <input
        type="text"
        placeholder="Search candidate..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="rounded-xl bg-slate-900 p-4 text-white outline-none"
      />

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="rounded-xl bg-slate-900 p-4 text-white outline-none"
      >
        <option value="All">All</option>
        <option value="Pending">Pending</option>
        <option value="Shortlisted">Shortlisted</option>
        <option value="Rejected">Rejected</option>
      </select>

      <input
        type="number"
        placeholder="Minimum ATS Score"
        value={minScore}
        onChange={(e) => setMinScore(e.target.value)}
        className="rounded-xl bg-slate-900 p-4 text-white outline-none"
      />
    </div>
  );
}
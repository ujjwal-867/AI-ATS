import CandidateTable from "@/components/candidates/CandidateTable";

export default function CandidatePage() {
  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <h1 className="mb-8 text-4xl font-bold text-white">
        Candidates
      </h1>

      <CandidateTable />
    </div>
  );
}
import CandidateList from "@/components/dashboard/CandidateList";

export default function CandidatesPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <h1 className="mb-8 text-4xl font-bold text-white">
        Candidates
      </h1>

      <CandidateList />
    </div>
  );
}
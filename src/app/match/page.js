import MatchSection from "@/components/dashboard/MatchSection";

export default function MatchPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <h1 className="mb-8 text-4xl font-bold text-white">
        AI Candidate Matching
      </h1>

      <MatchSection />
    </div>
  );
}
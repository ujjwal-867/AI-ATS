import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";
import CandidateCard from "@/components/dashboard/CandidateCard";

export default function CandidatesPage() {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <div className="flex-1">
        <Navbar />

        <main className="grid gap-6 p-8 md:grid-cols-2 xl:grid-cols-3">

          <CandidateCard
            name="John Doe"
            role="Frontend Developer"
            score={92}
          />

          <CandidateCard
            name="Jane Smith"
            role="Backend Developer"
            score={86}
          />

          <CandidateCard
            name="Alex Brown"
            role="Data Scientist"
            score={81}
          />

        </main>
      </div>
    </div>
  );
}
import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";
import StatsCard from "@/components/dashboard/StatsCard";
import CandidateTable from "@/components/dashboard/CandidateTable";
export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <div className="flex-1">
        <Navbar />

        <main className="p-8">
          <h1 className="mb-8 text-4xl font-bold text-white">
            AI ATS Dashboard 🚀
          </h1>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <StatsCard
            <div className="mt-10">
  <CandidateTable />
</div>
              title="Total Candidates"
              value="128"
              color="text-blue-400"
            />

            <StatsCard
              title="Active Jobs"
              value="24"
              color="text-green-400"
            />

            <StatsCard
              title="Interviews"
              value="15"
              color="text-yellow-400"
            />

            <StatsCard
              title="Match Rate"
              value="87%"
              color="text-purple-400"
            />
          </div>
        </main>
      </div>
    </div>
  );
}
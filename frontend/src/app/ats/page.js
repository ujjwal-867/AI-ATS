import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import ATSCard from "@/components/dashboard/ATSCard";

export default function ATSPage() {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <div className="flex-1">
        <Navbar />

        <main className="p-8">
          <ATSCard />
        </main>
      </div>
    </div>
  );
}
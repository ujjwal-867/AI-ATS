import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";
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
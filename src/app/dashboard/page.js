"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 p-10 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold">
            Welcome {user?.name} 👋
          </h1>

          <p className="mt-2 text-slate-400">
            AI ATS Dashboard
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-xl bg-red-600 px-5 py-3 hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-4">
        <div className="rounded-3xl bg-slate-900 p-8">
          <h2 className="text-slate-400">Candidates</h2>
          <h1 className="mt-3 text-5xl font-bold">124</h1>
        </div>

        <div className="rounded-3xl bg-slate-900 p-8">
          <h2 className="text-slate-400">Jobs</h2>
          <h1 className="mt-3 text-5xl font-bold">18</h1>
        </div>

        <div className="rounded-3xl bg-slate-900 p-8">
          <h2 className="text-slate-400">ATS Score</h2>
          <h1 className="mt-3 text-5xl font-bold text-green-400">
            86%
          </h1>
        </div>

        <div className="rounded-3xl bg-slate-900 p-8">
          <h2 className="text-slate-400">Uploaded Resumes</h2>
          <h1 className="mt-3 text-5xl font-bold">942</h1>
        </div>
      </div>
    </div>
  );
}
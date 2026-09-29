"use client";

import { useEffect, useState } from "react";

import {
  Download,
  UserPlus,
  BriefcaseBusiness,
} from "lucide-react";

import { useRouter } from "next/navigation";

export default function DashboardHeader() {
  const router = useRouter();

  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error(
        "User loading error:",
        error
      );
    }
  }, []);

  const firstName =
    user?.name?.trim()?.split(" ")[0] ||
    "there";

  const fullName =
    user?.name ||
    "Recruiter";

  const role =
    user?.role ||
    "HR Recruiter";

  function getGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Good Morning";
    }

    if (hour < 17) {
      return "Good Afternoon";
    }

    return "Good Evening";
  }

  function handleAddCandidate() {
    router.push("/candidates");
  }

  function handleCreateJob() {
    router.push("/jobs");
  }

  function handleExport() {
    window.print();
  }

  return (
    <section className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="mb-2 text-sm font-medium text-blue-600">
          {getGreeting()}
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Welcome back, {firstName}
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
          <span>{fullName}</span>

          <span className="text-slate-300">
            •
          </span>

          <span>{role}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <Download size={17} />

          Export Report
        </button>

        <button
          type="button"
          onClick={handleAddCandidate}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <UserPlus size={17} />

          Add Candidate
        </button>

        <button
          type="button"
          onClick={handleCreateJob}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <BriefcaseBusiness size={17} />

          Create Job
        </button>
      </div>
    </section>
  );
}
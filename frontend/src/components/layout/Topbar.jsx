"use client";

import {
  Search,
  Bell,
  Plus,
  ChevronRight,
  Settings,
  CalendarDays,
} from "lucide-react";

export default function Topbar() {
  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const hour = today.getHours();

  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 18
      ? "Good Afternoon"
      : "Good Evening";

  return (
    <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white">

      <div className="flex h-24 items-center justify-between px-8">

        {/* LEFT */}

        <div>

          <div className="flex items-center gap-2 text-sm text-slate-500">

            <span>Dashboard</span>

            <ChevronRight size={15} />

            <span className="font-semibold text-[#D4AF37]">
              Overview
            </span>

          </div>

          <h1 className="mt-2 text-3xl font-bold text-[#111827]">
            {greeting}, Ujjwal 👋
          </h1>

          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">

            <CalendarDays size={16} />

            {formattedDate}

          </div>

        </div>

        {/* RIGHT */}

        <div className="flex items-center gap-5">

          {/* Search */}

          <div className="flex w-96 items-center gap-3 rounded-2xl border border-slate-200 bg-[#F8FAFC] px-5 py-3">

            <Search
              size={18}
              className="text-slate-400"
            />

            <input
              type="text"
              placeholder="Search candidates, jobs..."
              className="w-full bg-transparent text-[#111827] outline-none placeholder:text-slate-400"
            />

          </div>

          {/* Notification */}

          <button className="relative rounded-2xl border border-slate-200 bg-white p-3 transition hover:border-[#D4AF37] hover:bg-[#FFF9E8]">

            <Bell
              size={20}
              className="text-slate-600"
            />

            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-green-500"></span>

          </button>

          {/* Settings */}

          <button className="rounded-2xl border border-slate-200 bg-white p-3 transition hover:border-[#D4AF37] hover:bg-[#FFF9E8]">

            <Settings
              size={20}
              className="text-slate-600"
            />

          </button>

          {/* Profile */}

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2">

            <div className="relative">

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D4AF37] text-lg font-bold text-black">

                U

              </div>

              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></span>

            </div>

            <div>

              <p className="font-semibold text-[#111827]">
                Ujjwal Gupta
              </p>

              <p className="text-sm text-slate-500">
                HR Recruiter
              </p>

            </div>

          </div>

          {/* Button */}

          <button className="flex items-center gap-2 rounded-2xl bg-[#D4AF37] px-6 py-3 font-semibold text-black transition hover:bg-[#E7C75F]">

            <Plus size={18} />

            Create Job

          </button>

        </div>

      </div>

    </header>
  );
}
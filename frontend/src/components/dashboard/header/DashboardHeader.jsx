"use client";

import { motion } from "framer-motion";
import {
  CalendarDays,
  Download,
  Plus,
  Sparkles,
} from "lucide-react";

export default function DashboardHeader() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
        {/* Left */}

        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF8E1] px-4 py-2 text-sm font-semibold text-[#B8860B]">
            <Sparkles size={16} />
            AI Recruitment Platform
          </span>

          <h1 className="mt-5 text-5xl font-bold tracking-tight text-[#111827]">
            Welcome back, Ujjwal 👋
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            Manage hiring from one intelligent dashboard.
          </p>

          <div className="mt-5 flex items-center gap-2 text-slate-500">
            <CalendarDays size={18} />
            <span>{today}</span>
          </div>
        </div>

        {/* Right */}

        <div className="flex flex-wrap items-center gap-4">
          <button className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:border-[#D4AF37] hover:text-[#D4AF37]">
            <Download size={18} />
            Export Report
          </button>

          <button className="flex items-center gap-2 rounded-2xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700">
            <Plus size={18} />
            Add Candidate
          </button>

          <button className="flex items-center gap-2 rounded-2xl bg-[#D4AF37] px-6 py-3 font-semibold text-black transition hover:bg-[#E7C75F]">
            <Plus size={18} />
            Create Job
          </button>
        </div>
      </div>
    </motion.section>
  );
}
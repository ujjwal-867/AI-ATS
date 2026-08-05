"use client";

import { X } from "lucide-react";

import ProfileHeader from "./ProfileHeader";
import ProfileSkills from "./ProfileSkills";
import ProfileTimeline from "./ProfileTimeline";

export default function CandidateProfileDrawer({
  open,
  candidate,
  onClose,
}) {
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 ${
          open
            ? "opacity-100 visible"
            : "opacity-0 invisible"
        }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 z-50 h-screen w-full max-w-xl overflow-y-auto border-l border-slate-800 bg-slate-950 shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <h2 className="text-2xl font-bold text-white">
            Candidate Profile
          </h2>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <ProfileHeader candidate={candidate} />

          <ProfileSkills candidate={candidate} />

          <ProfileTimeline candidate={candidate} />

          <div className="mt-8 flex gap-4">
            <button className="flex-1 rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700">
              Download Resume
            </button>

            <button className="flex-1 rounded-xl border border-slate-700 py-3 font-semibold text-white hover:border-indigo-500">
              Schedule Interview
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
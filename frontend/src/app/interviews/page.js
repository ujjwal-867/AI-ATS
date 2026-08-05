"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  User,
  Video,
  Clock,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import { getInterviewCandidates } from "@/services/api";

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInterviews() {
      try {
        const data = await getInterviewCandidates();
        setInterviews(data);
      } catch (error) {
        console.log("Interview loading error", error);
      } finally {
        setLoading(false);
      }
    }

    loadInterviews();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <Loader2
          className="animate-spin text-[#D4AF37]"
          size={36}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 p-5">
      <div>
        <h1 className="text-3xl font-bold text-[#111827]">
          Interview Dashboard
        </h1>
        <p className="mt-1 text-slate-500">
          Manage scheduled candidate interviews.
        </p>
      </div>

      {interviews.length === 0 ? (
        <div className="rounded-2xl border bg-white p-6 text-center text-slate-500">
          No interviews scheduled yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {interviews.map((candidate, index) => (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#111827]">
                    {candidate.name}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {candidate.email}
                  </p>
                </div>

                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                  Interview
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <CalendarDays size={18} className="text-[#D4AF37]" />
                  {candidate.interview_date}
                </div>

                <div className="flex items-center gap-3">
                  <User size={18} className="text-[#D4AF37]" />
                  {candidate.interviewer}
                </div>

                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-[#D4AF37]" />
                  ATS Score:
                  <b>{candidate.ats_score}%</b>
                </div>
              </div>

              {candidate.meeting_link && (
                <a
                  href={candidate.meeting_link}
                  target="_blank"
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#D4AF37] py-2.5 font-semibold text-black transition hover:bg-[#E7C75F]"
                >
                  <Video size={18} />
                  Join Meeting
                  <ExternalLink size={16} />
                </a>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
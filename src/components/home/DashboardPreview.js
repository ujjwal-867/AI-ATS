"use client";

import { motion } from "framer-motion";

export default function DashboardPreview() {
  return (
    <section className="bg-slate-950 px-8 py-24">
      <div className="mx-auto max-w-7xl">

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mb-16 text-center text-5xl font-bold text-white"
        >
          AI Powered Dashboard
        </motion.h2>

        <div className="grid gap-8 md:grid-cols-2">

          <motion.div
            whileHover={{ scale: 1.03, y: -10 }}
            className="rounded-3xl border border-slate-800 bg-white/5 p-8 backdrop-blur-xl"
          >
            <h3 className="text-xl text-slate-400">
              ATS Match Rate
            </h3>

            <div className="mt-6 text-6xl font-bold text-green-400">
              92%
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03, y: -10 }}
            className="rounded-3xl border border-slate-800 bg-white/5 p-8 backdrop-blur-xl"
          >
            <h3 className="text-xl text-slate-400">
              Candidates
            </h3>

            <div className="mt-6 text-6xl font-bold text-indigo-400">
              128
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
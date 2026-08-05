"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: "⚡",
    title: "AI Resume Parsing",
    description: "Automatically extract skills and experience.",
  },
  {
    icon: "📊",
    title: "ATS Score Analysis",
    description: "Measure resume-job compatibility instantly.",
  },
  {
    icon: "👨‍💼",
    title: "Candidate Ranking",
    description: "Rank applicants based on AI-powered scoring.",
  },
  {
    icon: "🤖",
    title: "Interview Questions",
    description: "Generate technical interview questions with AI.",
  },
];

export default function Features() {
  return (
    <section className="bg-slate-950 px-8 py-24">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-16 text-center text-5xl font-bold text-white">
          Powerful Features
        </h2>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{
                scale: 1.05,
                y: -10,
              }}
              className="rounded-3xl border border-slate-800 bg-white/5 p-8 backdrop-blur-xl"
            >
              <div className="text-5xl">
                {feature.icon}
              </div>

              <h3 className="mt-6 text-2xl font-bold text-white">
                {feature.title}
              </h3>

              <p className="mt-4 text-slate-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
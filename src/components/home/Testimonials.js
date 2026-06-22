"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Senior Recruiter",
    company: "Google",
    text: "AI ATS reduced our hiring time by 60%.",
  },
  {
    name: "Michael Chen",
    role: "HR Manager",
    company: "Amazon",
    text: "The ATS score engine helped us filter candidates faster.",
  },
  {
    name: "Emily Brown",
    role: "Talent Lead",
    company: "Microsoft",
    text: "An excellent AI-powered hiring platform.",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-slate-950 py-24 px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-bold text-center text-white mb-16">
          Trusted by Recruiters
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ y: -10 }}
              className="rounded-3xl border border-slate-800 bg-white/5 backdrop-blur-xl p-8"
            >
              <div className="text-yellow-400 text-xl mb-4">
                ★★★★★
              </div>

              <p className="text-slate-300 mb-6">
                "{item.text}"
              </p>

              <h3 className="text-white font-bold">
                {item.name}
              </h3>

              <p className="text-slate-400 text-sm">
                {item.role} • {item.company}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
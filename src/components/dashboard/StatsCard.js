"use client";

import { motion } from "framer-motion";

export default function StatsCard({
  title,
  value,
  color,
}) {
  return (
    <motion.div
      whileHover={{
        scale: 1.05,
        y: -5,
      }}
      initial={{
        opacity: 0,
        y: 30,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg"
    >
      <h3 className="text-slate-400">
        {title}
      </h3>

      <h1 className={`mt-4 text-4xl font-bold ${color}`}>
        {value}
      </h1>
    </motion.div>
  );
}
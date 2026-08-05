"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color = "text-indigo-400",
  trend = "+0%",
  subtitle = "Compared to last month",
}) {
  return (
    <motion.div
      whileHover={{
        y: -6,
        scale: 1.02,
      }}
      transition={{ duration: 0.2 }}
      className="
        relative
        overflow-hidden
        rounded-3xl
        border
        border-slate-800
        bg-slate-900
        p-6
        shadow-xl
      "
    >
      {/* Background Glow */}
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">
              {title}
            </p>

            <h2 className="mt-3 text-4xl font-bold text-white">
              {value}
            </h2>
          </div>

          {Icon && (
            <div
              className={`rounded-2xl bg-slate-800 p-3 ${color}`}
            >
              <Icon size={28} />
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-500"
            style={{ width: "75%" }}
          />
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-400">
            <TrendingUp size={16} />

            <span className="text-sm font-semibold">
              {trend}
            </span>
          </div>

          <p className="text-xs text-slate-500">
            {subtitle}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
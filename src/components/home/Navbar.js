"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-200/50 bg-white/70 backdrop-blur-xl transition-colors duration-500 dark:border-white/10 dark:bg-slate-950/70">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 text-3xl font-bold text-slate-900 dark:text-white"
        >
          <span className="text-4xl">🤖</span>
          <span>AI ATS</span>
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl px-5 py-2 font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              Login
            </motion.button>
          </Link>

          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl bg-indigo-600 px-6 py-2 font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700"
            >
              Get Started
            </motion.button>
          </Link>
        </div>
      </div>
    </header>
  );
}
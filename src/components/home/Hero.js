"use client";

import Navbar from "./Navbar";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-white transition-colors duration-500 dark:bg-slate-950">
      <Navbar />

      {/* Background Blobs */}
      <div className="absolute left-20 top-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl dark:bg-indigo-600/20"></div>

      <div className="absolute right-10 bottom-20 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl dark:bg-purple-600/20"></div>

      <div className="container mx-auto flex min-h-screen items-center px-8 pt-20">
        {/* Left Side */}
        <div className="w-full lg:w-1/2">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl font-bold leading-tight text-slate-900 dark:text-white"
          >
            Hire Smarter <br />
            with <span className="text-indigo-600 dark:text-indigo-500">AI ATS</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 max-w-2xl text-xl text-slate-600 dark:text-slate-400"
          >
            Analyze resumes, rank candidates and discover the
            perfect match using AI-powered ATS scoring.
          </motion.p>

          <div className="mt-10 flex gap-4">
            <button className="rounded-xl bg-indigo-600 px-8 py-4 text-white transition hover:scale-105 hover:bg-indigo-700">
              Get Started
            </button>

            <button className="rounded-xl border border-slate-300 px-8 py-4 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
              Live Demo
            </button>
          </div>

          {/* Stats */}
          <div className="mt-16 flex gap-12">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                1000+
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Resumes
              </p>
            </div>

            <div>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                95%
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Accuracy
              </p>
            </div>

            <div>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                500+
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Recruiters
              </p>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="hidden w-1/2 justify-center lg:flex">
          <div className="relative h-[500px] w-[450px]">

            {/* ATS Score */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute right-0 top-0 rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-none"
            >
              <h3 className="text-slate-500 dark:text-slate-400">
                ATS Score
              </h3>

              <h1 className="mt-3 text-5xl font-bold text-green-500">
                92%
              </h1>
            </motion.div>

            {/* Candidates */}
            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute left-0 top-40 rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-none"
            >
              <h3 className="text-slate-500 dark:text-slate-400">
                Candidates
              </h3>

              <h1 className="mt-3 text-5xl font-bold text-indigo-500">
                128
              </h1>
            </motion.div>

            {/* Active Jobs */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute bottom-0 right-10 rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-none"
            >
              <h3 className="text-slate-500 dark:text-slate-400">
                Active Jobs
              </h3>

              <h1 className="mt-3 text-5xl font-bold text-purple-500">
                14
              </h1>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
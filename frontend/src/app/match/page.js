"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Sparkles,
  Target,
  Users,
  X,
  XCircle,
} from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getJobs, getRanking } from "@/services/api";

export default function MatchPage() {
  const router = useRouter();

  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState("");
  const [results, setResults] = useState([]);

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingMatch, setLoadingMatch] = useState(false);

  const [error, setError] = useState("");
  const [hasMatched, setHasMatched] = useState(false);

  /* =====================================================
     LOAD JOBS
  ====================================================== */

  useEffect(() => {
    let mounted = true;

    async function loadJobs() {
      try {
        setLoadingJobs(true);
        setError("");

        const data = await getJobs();

        if (!mounted) return;

        const jobList = Array.isArray(data)
          ? data
          : Array.isArray(data?.jobs)
            ? data.jobs
            : [];

        setJobs(jobList);

        if (jobList.length > 0) {
          setJobId(jobList[0].id);
        }
      } catch (err) {
        console.error("Jobs error:", err);

        if (mounted) {
          setError(
            err?.message ||
              "Unable to load jobs. Please try again."
          );
        }
      } finally {
        if (mounted) {
          setLoadingJobs(false);
        }
      }
    }

    loadJobs();

    return () => {
      mounted = false;
    };
  }, []);

  /* =====================================================
     RUN MATCHING
  ====================================================== */

  async function runMatching() {
    if (!jobId) {
      setError("Please select a job first.");
      return;
    }

    try {
      setLoadingMatch(true);
      setError("");
      setHasMatched(false);

      const data = await getRanking(jobId);

      const ranking = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data?.ranking)
            ? data.ranking
            : [];

      setResults(ranking);
      setHasMatched(true);
    } catch (err) {
      console.error("Matching error:", err);

      setResults([]);
      setHasMatched(false);

      setError(
        err?.message ||
          "Unable to run AI matching. Please try again."
      );
    } finally {
      setLoadingMatch(false);
    }
  }

  /* =====================================================
     SELECTED JOB
  ====================================================== */

  const selectedJob = useMemo(() => {
    return jobs.find((job) => String(job.id) === String(jobId));
  }, [jobs, jobId]);

  /* =====================================================
     STATISTICS
  ====================================================== */

  const averageScore = useMemo(() => {
    if (!results.length) return 0;

    const total = results.reduce(
      (sum, candidate) =>
        sum + Number(candidate?.match_score || 0),
      0
    );

    return Math.round(total / results.length);
  }, [results]);

  const strongMatches = useMemo(() => {
    return results.filter(
      (candidate) =>
        Number(candidate?.match_score || 0) >= 70
    ).length;
  }, [results]);

  /* =====================================================
     HELPERS
  ====================================================== */

  function getScoreColor(score) {
    const value = Number(score || 0);

    if (value >= 80) {
      return "text-green-600";
    }

    if (value >= 60) {
      return "text-blue-600";
    }

    if (value >= 40) {
      return "text-amber-600";
    }

    return "text-red-500";
  }

  function getScoreBackground(score) {
    const value = Number(score || 0);

    if (value >= 80) {
      return "bg-green-50 border-green-100";
    }

    if (value >= 60) {
      return "bg-blue-50 border-blue-100";
    }

    if (value >= 40) {
      return "bg-amber-50 border-amber-100";
    }

    return "bg-red-50 border-red-100";
  }

  /* =====================================================
     PAGE
  ====================================================== */

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="min-h-full bg-white">

          {/* =================================================
              HEADER
          ================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.35,
            }}
            className="mb-8"
          >
            {/* Breadcrumb */}

            <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="
                  transition
                  hover:text-blue-600
                "
              >
                Dashboard
              </button>

              <span>/</span>

              <span className="font-semibold text-blue-600">
                AI Matching
              </span>
            </div>

            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">

              <div>
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-2xl
                      bg-blue-50
                      text-blue-600
                    "
                  >
                    <Sparkles
                      size={24}
                      strokeWidth={2.2}
                    />
                  </div>

                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                      AI Candidate Matching
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                      Match candidates against job requirements using AI.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-slate-700
                  shadow-sm
                  transition
                  hover:border-blue-200
                  hover:bg-blue-50
                  hover:text-blue-600
                "
              >
                <ArrowLeft size={17} />
                Back to Dashboard
              </button>
            </div>
          </motion.div>

          {/* =================================================
              ERROR
          ================================================== */}

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                }}
                className="
                  mb-6
                  flex
                  items-start
                  justify-between
                  gap-4
                  rounded-2xl
                  border
                  border-red-200
                  bg-red-50
                  px-5
                  py-4
                  text-sm
                  text-red-700
                "
              >
                <div>
                  <p className="font-semibold">
                    Matching Error
                  </p>

                  <p className="mt-1 text-red-600">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="
                    rounded-lg
                    p-1
                    text-red-400
                    transition
                    hover:bg-red-100
                    hover:text-red-600
                  "
                >
                  <X size={17} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* =================================================
              MATCH CONTROL CARD
          ================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
              delay: 0.05,
            }}
            className="
              mb-8
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-6
              shadow-sm
            "
          >
            <div className="mb-5">
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-50
                    text-blue-600
                  "
                >
                  <Target size={20} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Find the best candidates
                  </h2>

                  <p className="text-sm text-slate-500">
                    Select a job and run AI matching.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row">

              {/* JOB SELECT */}

              <div className="relative flex-1">
                <BriefcaseBusiness
                  size={18}
                  className="
                    pointer-events-none
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <select
                  value={jobId}
                  onChange={(event) => {
                    setJobId(event.target.value);
                    setResults([]);
                    setHasMatched(false);
                    setError("");
                  }}
                  disabled={loadingJobs || loadingMatch}
                  className="
                    h-12
                    w-full
                    appearance-none
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    pl-11
                    pr-10
                    text-sm
                    font-medium
                    text-slate-800
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                    disabled:cursor-not-allowed
                    disabled:bg-slate-50
                  "
                >
                  {loadingJobs ? (
                    <option value="">
                      Loading jobs...
                    </option>
                  ) : jobs.length === 0 ? (
                    <option value="">
                      No jobs available
                    </option>
                  ) : (
                    <>
                      <option value="">
                        Select a job
                      </option>

                      {jobs.map((job) => (
                        <option
                          key={job.id}
                          value={job.id}
                        >
                          {job.title}
                        </option>
                      ))}
                    </>
                  )}
                </select>

                <ChevronDown
                  size={17}
                  className="
                    pointer-events-none
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />
              </div>

              {/* MATCH BUTTON */}

              <button
                type="button"
                onClick={runMatching}
                disabled={
                  !jobId ||
                  loadingJobs ||
                  loadingMatch
                }
                className="
                  inline-flex
                  h-12
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-blue-600
                  px-7
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-blue-700
                  disabled:cursor-not-allowed
                  disabled:bg-blue-300
                "
              >
                {loadingMatch ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Matching...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Match Candidates
                  </>
                )}
              </button>
            </div>

            {/* SELECTED JOB */}

            {selectedJob && (
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                <BriefcaseBusiness size={15} />

                <span>
                  Selected job:
                </span>

                <span className="font-semibold text-slate-800">
                  {selectedJob.title}
                </span>
              </div>
            )}
          </motion.div>

          {/* =================================================
              RESULT STATS
          ================================================== */}

          <AnimatePresence>
            {hasMatched && results.length > 0 && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="
                  mb-8
                  grid
                  gap-4
                  sm:grid-cols-2
                  lg:grid-cols-3
                "
              >
                {/* TOTAL MATCHES */}

                <div
                  className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-5
                    shadow-sm
                  "
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Candidates Matched
                      </p>

                      <p className="mt-2 text-3xl font-bold text-slate-900">
                        {results.length}
                      </p>
                    </div>

                    <div
                      className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-xl
                        bg-blue-50
                        text-blue-600
                      "
                    >
                      <Users size={21} />
                    </div>
                  </div>
                </div>

                {/* AVERAGE */}

                <div
                  className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-5
                    shadow-sm
                  "
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Average Match
                      </p>

                      <p className="mt-2 text-3xl font-bold text-slate-900">
                        {averageScore}%
                      </p>
                    </div>

                    <div
                      className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-xl
                        bg-green-50
                        text-green-600
                      "
                    >
                      <Target size={21} />
                    </div>
                  </div>
                </div>

                {/* STRONG MATCHES */}

                <div
                  className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-5
                    shadow-sm
                  "
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Strong Matches
                      </p>

                      <p className="mt-2 text-3xl font-bold text-slate-900">
                        {strongMatches}
                      </p>
                    </div>

                    <div
                      className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-xl
                        bg-purple-50
                        text-purple-600
                      "
                    >
                      <CheckCircle2 size={21} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* =================================================
              RESULTS
          ================================================== */}

          <AnimatePresence mode="wait">

            {/* LOADING */}

            {loadingMatch && (
              <motion.div
                key="loading"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                className="
                  flex
                  min-h-[280px]
                  flex-col
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  shadow-sm
                "
              >
                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-blue-50
                    text-blue-600
                  "
                >
                  <Loader2
                    size={28}
                    className="animate-spin"
                  />
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  Analyzing candidates
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  AI is comparing candidate profiles with the selected job.
                </p>
              </motion.div>
            )}

            {/* EMPTY BEFORE MATCH */}

            {!loadingMatch &&
              !hasMatched && (
                <motion.div
                  key="initial"
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="
                    flex
                    min-h-[280px]
                    flex-col
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    px-6
                    text-center
                    shadow-sm
                  "
                >
                  <div
                    className="
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-2xl
                      bg-blue-50
                      text-blue-600
                    "
                  >
                    <Sparkles size={29} />
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-900">
                    Ready to find your best candidates
                  </h3>

                  <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                    Select a job above and run AI matching to compare
                    candidates based on their skills and profile.
                  </p>
                </motion.div>
              )}

            {/* NO RESULTS */}

            {!loadingMatch &&
              hasMatched &&
              results.length === 0 && (
                <motion.div
                  key="no-results"
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="
                    flex
                    min-h-[280px]
                    flex-col
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    px-6
                    text-center
                    shadow-sm
                  "
                >
                  <div
                    className="
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-2xl
                      bg-slate-50
                      text-slate-400
                    "
                  >
                    <Users size={28} />
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-900">
                    No matching candidates found
                  </h3>

                  <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                    There are currently no candidates available for this
                    matching request.
                  </p>
                </motion.div>
              )}

            {/* RESULTS */}

            {!loadingMatch &&
              hasMatched &&
              results.length > 0 && (
                <motion.div
                  key="results"
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="space-y-4"
                >
                  <div className="mb-5">
                    <h2 className="text-xl font-bold text-slate-900">
                      Matching Results
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Candidates ranked according to their compatibility
                      with the selected position.
                    </p>
                  </div>

                  {results.map((candidate, index) => {
                    const score = Number(
                      candidate?.match_score || 0
                    );

                    const matchedSkills = Array.isArray(
                      candidate?.matched_skills
                    )
                      ? candidate.matched_skills
                      : [];

                    const missingSkills = Array.isArray(
                      candidate?.missing_skills
                    )
                      ? candidate.missing_skills
                      : [];

                    return (
                      <motion.div
                        key={
                          candidate?.candidate_id ||
                          `${candidate?.candidate_name || "candidate"}-${index}`
                        }
                        initial={{
                          opacity: 0,
                          y: 12,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          duration: 0.3,
                          delay: Math.min(
                            index * 0.05,
                            0.4
                          ),
                        }}
                        className="
                          rounded-2xl
                          border
                          border-slate-200
                          bg-white
                          p-6
                          shadow-sm
                          transition
                          hover:border-blue-200
                          hover:shadow-md
                        "
                      >
                        {/* TOP */}

                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                          <div className="flex items-start gap-4">
                            <div
                              className="
                                flex
                                h-12
                                w-12
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-blue-50
                                font-bold
                                text-blue-600
                              "
                            >
                              {index + 1}
                            </div>

                            <div>
                              <h3 className="text-lg font-bold text-slate-900">
                                {candidate?.candidate_name ||
                                  "Unknown Candidate"}
                              </h3>

                              <p className="mt-1 text-sm text-slate-500">
                                {candidate?.recommendation ||
                                  "AI matching result"}
                              </p>
                            </div>
                          </div>

                          {/* SCORE */}

                          <div
                            className={`
                              inline-flex
                              items-center
                              gap-3
                              self-start
                              rounded-xl
                              border
                              px-4
                              py-3
                              ${getScoreBackground(score)}
                            `}
                          >
                            <div>
                              <p className="text-xs font-medium text-slate-500">
                                Match Score
                              </p>

                              <p
                                className={`
                                  mt-0.5
                                  text-xl
                                  font-bold
                                  ${getScoreColor(score)}
                                `}
                              >
                                {score}%
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* SKILLS */}

                        <div className="mt-6 grid gap-5 lg:grid-cols-2">

                          {/* MATCHED */}

                          <div>
                            <div className="mb-3 flex items-center gap-2">
                              <CheckCircle2
                                size={17}
                                className="text-green-600"
                              />

                              <h4 className="text-sm font-semibold text-slate-900">
                                Matched Skills
                              </h4>
                            </div>

                            {matchedSkills.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {matchedSkills.map(
                                  (skill, skillIndex) => (
                                    <span
                                      key={`${skill}-${skillIndex}`}
                                      className="
                                        rounded-full
                                        border
                                        border-green-100
                                        bg-green-50
                                        px-3
                                        py-1.5
                                        text-xs
                                        font-medium
                                        text-green-700
                                      "
                                    >
                                      {skill}
                                    </span>
                                  )
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-400">
                                No matched skills reported.
                              </p>
                            )}
                          </div>

                          {/* MISSING */}

                          <div>
                            <div className="mb-3 flex items-center gap-2">
                              <XCircle
                                size={17}
                                className="text-red-500"
                              />

                              <h4 className="text-sm font-semibold text-slate-900">
                                Missing Skills
                              </h4>
                            </div>

                            {missingSkills.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {missingSkills.map(
                                  (skill, skillIndex) => (
                                    <span
                                      key={`${skill}-${skillIndex}`}
                                      className="
                                        rounded-full
                                        border
                                        border-red-100
                                        bg-red-50
                                        px-3
                                        py-1.5
                                        text-xs
                                        font-medium
                                        text-red-700
                                      "
                                    >
                                      {skill}
                                    </span>
                                  )
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-400">
                                No missing skills reported.
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
          </AnimatePresence>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
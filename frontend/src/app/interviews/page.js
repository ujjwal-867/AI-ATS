"use client";

import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Plus,
  Search,
  Star,
  User,
  Users,
  Video,
  X,
} from "lucide-react";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";

import {
  getCandidates,
  getInterviewCandidates,
  scheduleInterview,
  completeInterview,
} from "@/services/candidate.service";


export default function InterviewsPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <InterviewsContent />
      </AppLayout>
    </ProtectedRoute>
  );
}


/* =====================================================
   MAIN CONTENT
===================================================== */

function InterviewsContent() {
  const router = useRouter();

  const [interviews, setInterviews] = useState([]);
  const [candidates, setCandidates] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);

  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [scheduleForm, setScheduleForm] = useState({
    candidateId: "",
    interview_date: "",
    interviewer: "",
    meeting_link: "",
  });

  const [resultForm, setResultForm] = useState({
    result: "Selected",
    score: "",
    feedback: "",
  });


  /* =====================================================
     LOAD DATA
  ===================================================== */

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        interviewData,
        candidateData,
      ] = await Promise.all([
        getInterviewCandidates(),
        getCandidates(),
      ]);

      setInterviews(
        Array.isArray(interviewData)
          ? interviewData
          : []
      );

      setCandidates(
        Array.isArray(candidateData)
          ? candidateData
          : []
      );
    } catch (err) {
      console.error(
        "Interview loading error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load interview data."
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadData();
  }, []);


  /* =====================================================
     SUCCESS MESSAGE AUTO HIDE
  ===================================================== */

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [success]);


  /* =====================================================
     AVAILABLE CANDIDATES
  ===================================================== */

  const availableCandidates = useMemo(() => {
    return candidates.filter(
      (candidate) =>
        candidate.status !== "Interview"
    );
  }, [candidates]);


  /* =====================================================
     FILTERED INTERVIEWS
  ===================================================== */

  const filteredInterviews = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return interviews.filter(
      (candidate) => {
        const matchesSearch =
          !query ||
          candidate.name
            ?.toLowerCase()
            .includes(query) ||
          candidate.email
            ?.toLowerCase()
            .includes(query) ||
          candidate.interviewer
            ?.toLowerCase()
            .includes(query);

        const matchesStatus =
          statusFilter === "All" ||
          candidate.status ===
            statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    interviews,
    search,
    statusFilter,
  ]);


  /* =====================================================
     COMPLETED COUNT
  ===================================================== */

  const completedCount = useMemo(() => {
    return candidates.filter(
      (candidate) =>
        candidate.interview_result
    ).length;
  }, [candidates]);


  /* =====================================================
     AVERAGE INTERVIEW SCORE
  ===================================================== */

  const averageInterviewScore =
    useMemo(() => {
      const scores = candidates
        .map(
          (candidate) =>
            candidate.interview_score
        )
        .filter(
          (score) =>
            typeof score === "number" &&
            score >= 0
        );

      if (!scores.length) {
        return 0;
      }

      return Math.round(
        scores.reduce(
          (sum, score) =>
            sum + score,
          0
        ) / scores.length
      );
    }, [candidates]);


  /* =====================================================
     OPEN SCHEDULE MODAL
  ===================================================== */

  function openScheduleModal() {
    setError("");

    setScheduleForm({
      candidateId: "",
      interview_date: "",
      interviewer: "",
      meeting_link: "",
    });

    setScheduleOpen(true);
  }


  function closeScheduleModal() {
    if (saving) return;

    setScheduleOpen(false);
  }


  /* =====================================================
     SCHEDULE INTERVIEW
  ===================================================== */

  async function handleSchedule(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!scheduleForm.candidateId) {
      setError(
        "Please select a candidate."
      );
      return;
    }

    if (
      !scheduleForm.interview_date
    ) {
      setError(
        "Please select an interview date and time."
      );
      return;
    }

    if (
      !scheduleForm.interviewer.trim()
    ) {
      setError(
        "Please enter the interviewer name."
      );
      return;
    }

    try {
      setSaving(true);

      await scheduleInterview(
        scheduleForm.candidateId,
        {
          interview_date:
            scheduleForm.interview_date,

          interviewer:
            scheduleForm.interviewer.trim(),

          meeting_link:
            scheduleForm.meeting_link.trim() ||
            null,
        }
      );

      setScheduleOpen(false);

      setSuccess(
        "Interview scheduled successfully."
      );

      await loadData();
    } catch (err) {
      console.error(
        "Schedule interview error:",
        err
      );

      setError(
        err?.message ||
          "Unable to schedule interview."
      );
    } finally {
      setSaving(false);
    }
  }


  /* =====================================================
     OPEN COMPLETE MODAL
  ===================================================== */

  function openCompleteModal(
    candidate
  ) {
    setSelectedCandidate(candidate);

    setResultForm({
      result: "Selected",
      score:
        candidate.interview_score ??
        "",
      feedback:
        candidate.interview_feedback ??
        "",
    });

    setError("");
    setCompleteOpen(true);
  }


  function closeCompleteModal() {
    if (saving) return;

    setCompleteOpen(false);
    setSelectedCandidate(null);
  }


  /* =====================================================
     COMPLETE INTERVIEW
  ===================================================== */

  async function handleComplete(event) {
    event.preventDefault();

    if (!selectedCandidate) {
      return;
    }

    setError("");
    setSuccess("");

    const score = Number(
      resultForm.score
    );

    if (
      resultForm.score === "" ||
      Number.isNaN(score) ||
      score < 0 ||
      score > 100
    ) {
      setError(
        "Interview score must be between 0 and 100."
      );
      return;
    }

    if (
      !resultForm.feedback.trim()
    ) {
      setError(
        "Please enter interview feedback."
      );
      return;
    }

    try {
      setSaving(true);

      await completeInterview(
        selectedCandidate.id,
        {
          result:
            resultForm.result,

          score,

          feedback:
            resultForm.feedback.trim(),
        }
      );

      setCompleteOpen(false);
      setSelectedCandidate(null);

      setSuccess(
        "Interview completed successfully."
      );

      await loadData();
    } catch (err) {
      console.error(
        "Complete interview error:",
        err
      );

      setError(
        err?.message ||
          "Unable to complete interview."
      );
    } finally {
      setSaving(false);
    }
  }


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={34}
            className="animate-spin text-blue-600"
          />

          <p className="text-sm text-slate-500">
            Loading interviews...
          </p>
        </div>
      </div>
    );
  }


  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="mx-auto max-w-[1600px] space-y-7">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <button
            onClick={() =>
              router.push("/dashboard")
            }
            className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft size={17} />

            Back to Dashboard
          </button>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Interviews
          </h1>

          <p className="mt-1 text-slate-500">
            Schedule, manage and evaluate candidate interviews.
          </p>

        </div>


        <button
          onClick={openScheduleModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={18} />

          Schedule Interview
        </button>

      </div>


      {/* =================================================
          ALERTS
      ================================================= */}

      <AnimatePresence>

        {success && (
          <motion.div
            initial={{
              opacity: 0,
              y: -8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -8,
            }}
            className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
          >
            <CheckCircle2 size={18} />

            {success}
          </motion.div>
        )}


        {error &&
          !scheduleOpen &&
          !completeOpen && (
            <motion.div
              initial={{
                opacity: 0,
                y: -8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -8,
              }}
              className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              <span>
                {error}
              </span>

              <button
                onClick={() =>
                  setError("")
                }
                className="rounded-lg p-1 hover:bg-red-100"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}

      </AnimatePresence>


      {/* =================================================
          STATS
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={CalendarDays}
          title="Scheduled"
          value={interviews.length}
          description="Active interviews"
        />

        <StatCard
          icon={Users}
          title="Available Candidates"
          value={
            availableCandidates.length
          }
          description="Ready to schedule"
        />

        <StatCard
          icon={CheckCircle2}
          title="Completed"
          value={completedCount}
          description="Interviews completed"
        />

        <StatCard
          icon={Star}
          title="Avg. Interview Score"
          value={
            averageInterviewScore
              ? `${averageInterviewScore}%`
              : "—"
          }
          description="Across completed interviews"
        />

      </div>


      {/* =================================================
          SEARCH / FILTER
      ================================================= */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search candidate, email or interviewer..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />

          </div>


          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 focus:border-blue-500 focus:bg-white"
          >
            <option value="All">
              All Statuses
            </option>

            <option value="Interview">
              Interview
            </option>
          </select>

        </div>

      </section>


      {/* =================================================
          INTERVIEW LIST
      ================================================= */}

      <section>

        <div className="mb-4 flex items-end justify-between">

          <div>

            <h2 className="text-xl font-bold text-slate-900">
              Scheduled Interviews
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Candidates currently in the interview stage.
            </p>

          </div>


          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
            {filteredInterviews.length}{" "}
            {filteredInterviews.length ===
            1
              ? "interview"
              : "interviews"}
          </span>

        </div>


        {filteredInterviews.length ===
        0 ? (

          <EmptyInterviews
            hasFilters={
              Boolean(search) ||
              statusFilter !== "All"
            }
            onSchedule={
              openScheduleModal
            }
            onClear={() => {
              setSearch("");
              setStatusFilter("All");
            }}
          />

        ) : (

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {filteredInterviews.map(
              (candidate, index) => (
                <InterviewCard
                  key={candidate.id}
                  candidate={candidate}
                  index={index}
                  onComplete={
                    openCompleteModal
                  }
                />
              )
            )}

          </div>

        )}

      </section>


      {/* =================================================
          SCHEDULE MODAL
      ================================================= */}

      <AnimatePresence>

        {scheduleOpen && (

          <Modal
            title="Schedule Interview"
            subtitle="Create an interview appointment for a candidate."
            onClose={
              closeScheduleModal
            }
          >

            <form
              onSubmit={
                handleSchedule
              }
              className="space-y-5"
            >

              {error && (
                <ErrorMessage
                  message={error}
                />
              )}


              <FormField label="Candidate">

                <select
                  value={
                    scheduleForm.candidateId
                  }
                  onChange={(event) =>
                    setScheduleForm(
                      (prev) => ({
                        ...prev,
                        candidateId:
                          event.target.value,
                      })
                    )
                  }
                  className="form-input"
                  required
                >

                  <option value="">
                    Select candidate
                  </option>


                  {availableCandidates.map(
                    (candidate) => (
                      <option
                        key={candidate.id}
                        value={candidate.id}
                      >
                        {candidate.name} —{" "}
                        {candidate.email}
                      </option>
                    )
                  )}

                </select>

              </FormField>


              <FormField label="Interview Date & Time">

                <input
                  type="datetime-local"
                  value={
                    scheduleForm.interview_date
                  }
                  onChange={(event) =>
                    setScheduleForm(
                      (prev) => ({
                        ...prev,
                        interview_date:
                          event.target.value,
                      })
                    )
                  }
                  className="form-input"
                  required
                />

              </FormField>


              <FormField label="Interviewer">

                <input
                  type="text"
                  value={
                    scheduleForm.interviewer
                  }
                  onChange={(event) =>
                    setScheduleForm(
                      (prev) => ({
                        ...prev,
                        interviewer:
                          event.target.value,
                      })
                    )
                  }
                  placeholder="e.g. Sarah Johnson"
                  className="form-input"
                  required
                />

              </FormField>


              <FormField
                label={
                  <>
                    Meeting Link{" "}
                    <span className="font-normal text-slate-400">
                      (optional)
                    </span>
                  </>
                }
              >

                <input
                  type="url"
                  value={
                    scheduleForm.meeting_link
                  }
                  onChange={(event) =>
                    setScheduleForm(
                      (prev) => ({
                        ...prev,
                        meeting_link:
                          event.target.value,
                      })
                    )
                  }
                  placeholder="https://meet.google.com/..."
                  className="form-input"
                />

              </FormField>


              <ModalActions
                onCancel={
                  closeScheduleModal
                }
                loading={saving}
                submitText="Schedule Interview"
              />

            </form>

          </Modal>

        )}

      </AnimatePresence>


      {/* =================================================
          COMPLETE MODAL
      ================================================= */}

      <AnimatePresence>

        {completeOpen &&
          selectedCandidate && (

            <Modal
              title="Complete Interview"
              subtitle={`Record the interview outcome for ${selectedCandidate.name}.`}
              onClose={
                closeCompleteModal
              }
            >

              <form
                onSubmit={
                  handleComplete
                }
                className="space-y-5"
              >

                {error && (
                  <ErrorMessage
                    message={error}
                  />
                )}


                <FormField label="Interview Result">

                  <select
                    value={
                      resultForm.result
                    }
                    onChange={(event) =>
                      setResultForm(
                        (prev) => ({
                          ...prev,
                          result:
                            event.target.value,
                        })
                      )
                    }
                    className="form-input"
                  >

                    <option value="Selected">
                      Selected
                    </option>

                    <option value="Rejected">
                      Rejected
                    </option>

                    <option value="On Hold">
                      On Hold
                    </option>

                  </select>

                </FormField>


                <FormField label="Interview Score">

                  <div className="relative">

                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={
                        resultForm.score
                      }
                      onChange={(event) =>
                        setResultForm(
                          (prev) => ({
                            ...prev,
                            score:
                              event.target.value,
                          })
                        )
                      }
                      placeholder="0 - 100"
                      className="form-input pr-12"
                      required
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                      /100
                    </span>

                  </div>

                </FormField>


                <FormField label="Interview Feedback">

                  <textarea
                    rows={5}
                    value={
                      resultForm.feedback
                    }
                    onChange={(event) =>
                      setResultForm(
                        (prev) => ({
                          ...prev,
                          feedback:
                            event.target.value,
                        })
                      )
                    }
                    placeholder="Write detailed interview feedback..."
                    className="form-input resize-none"
                    required
                  />

                </FormField>


                <ModalActions
                  onCancel={
                    closeCompleteModal
                  }
                  loading={saving}
                  submitText="Complete Interview"
                />

              </form>

            </Modal>

          )}

      </AnimatePresence>

    </div>
  );
}


/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  icon: Icon,
  title,
  value,
  description,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >

      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>

        </div>


        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={21} />
        </div>

      </div>

    </motion.div>
  );
}


/* =====================================================
   INTERVIEW CARD
===================================================== */

function InterviewCard({
  candidate,
  index,
  onComplete,
}) {
  const formattedDate =
    formatInterviewDate(
      candidate.interview_date
    );

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: index * 0.05,
      }}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >

      {/* TOP */}

      <div className="flex items-start justify-between gap-4">

        <div className="flex min-w-0 items-center gap-3">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">
            {getInitials(
              candidate.name
            )}
          </div>


          <div className="min-w-0">

            <h3 className="truncate text-base font-bold text-slate-900">
              {candidate.name}
            </h3>

            <p className="truncate text-sm text-slate-500">
              {candidate.email}
            </p>

          </div>

        </div>


        <StatusBadge
          status={candidate.status}
        />

      </div>


      {/* DETAILS */}

      <div className="mt-6 space-y-3">

        <InfoRow
          icon={CalendarDays}
          label="Interview"
          value={formattedDate}
        />

        <InfoRow
          icon={User}
          label="Interviewer"
          value={
            candidate.interviewer ||
            "Not specified"
          }
        />

        <InfoRow
          icon={Star}
          label="ATS Score"
          value={`${candidate.ats_score ?? 0}%`}
        />

      </div>


      {/* ACTIONS */}

      <div className="mt-6 flex gap-2">

        {candidate.meeting_link ? (

          <a
            href={
              candidate.meeting_link
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Video size={16} />

            Join

            <ExternalLink
              size={13}
            />
          </a>

        ) : (

          <div className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-400">
            <Video size={16} />

            No Meeting Link
          </div>

        )}


        <button
          onClick={() =>
            onComplete(candidate)
          }
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <CheckCircle2
            size={16}
          />

          Complete
        </button>

      </div>

    </motion.div>
  );
}


/* =====================================================
   STATUS BADGE
===================================================== */

function StatusBadge({
  status,
}) {
  const styles = {
    Interview:
      "bg-blue-50 text-blue-700 border-blue-100",

    Selected:
      "bg-green-50 text-green-700 border-green-100",

    Hired:
      "bg-green-50 text-green-700 border-green-100",

    Rejected:
      "bg-red-50 text-red-700 border-red-100",

    "On Hold":
      "bg-amber-50 text-amber-700 border-amber-100",
  };

  return (
    <span
      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[status] ||
        "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
}


/* =====================================================
   INFO ROW
===================================================== */

function InfoRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
        <Icon size={16} />
      </div>


      <div className="min-w-0">

        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="truncate text-sm font-medium text-slate-700">
          {value}
        </p>

      </div>

    </div>
  );
}


/* =====================================================
   EMPTY STATE
===================================================== */

function EmptyInterviews({
  hasFilters,
  onSchedule,
  onClear,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"
    >

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">

        {hasFilters ? (
          <Search size={25} />
        ) : (
          <CalendarDays size={25} />
        )}

      </div>


      <h3 className="mt-4 text-lg font-bold text-slate-900">

        {hasFilters
          ? "No matching interviews"
          : "No interviews scheduled"}

      </h3>


      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">

        {hasFilters
          ? "Try changing your search or filter to find another interview."
          : "Schedule an interview to start managing your interview pipeline."}

      </p>


      {hasFilters ? (

        <button
          onClick={onClear}
          className="mt-5 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Clear Filters
        </button>

      ) : (

        <button
          onClick={onSchedule}
          className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Schedule Interview
        </button>

      )}

    </motion.div>
  );
}


/* =====================================================
   MODAL
===================================================== */

function Modal({
  title,
  subtitle,
  children,
  onClose,
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.97,
          y: 10,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.97,
          y: 10,
        }}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >

        <div className="mb-6 flex items-start justify-between gap-4">

          <div>

            <h2 className="text-xl font-bold text-slate-900">
              {title}
            </h2>

            {subtitle && (
              <p className="mt-1 text-sm text-slate-500">
                {subtitle}
              </p>
            )}

          </div>


          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={19} />
          </button>

        </div>


        {children}

      </motion.div>

    </motion.div>
  );
}


/* =====================================================
   FORM FIELD
===================================================== */

function FormField({
  label,
  children,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      {children}

    </div>
  );
}


/* =====================================================
   MODAL ACTIONS
===================================================== */

function ModalActions({
  onCancel,
  loading,
  submitText,
}) {
  return (
    <div className="flex gap-3 pt-2">

      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="flex-1 rounded-xl border border-slate-200 py-3 font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
      >
        Cancel
      </button>


      <button
        type="submit"
        disabled={loading}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >

        {loading && (
          <Loader2
            size={17}
            className="animate-spin"
          />
        )}

        {submitText}

      </button>

    </div>
  );
}


/* =====================================================
   ERROR MESSAGE
===================================================== */

function ErrorMessage({
  message,
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
      {message}
    </div>
  );
}


/* =====================================================
   HELPERS
===================================================== */

function getInitials(
  name = ""
) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) {
    return "C";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}


function formatInterviewDate(
  value
) {
  if (!value) {
    return "Not scheduled";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}
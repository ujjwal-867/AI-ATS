"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Users,
  Eye,
  X,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Award,
  CalendarDays,
  Loader2,
  ArrowLeft,
  Pencil,
  Trash2,
  FileText,
  Video,
  CheckCircle2,
  ExternalLink,
  Save,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import { validateEmail } from "@/lib/emailValidator";

import {
  getCandidates,
  updateCandidate,
  deleteCandidate,
  scheduleInterview,
  completeInterview,
} from "@/services/candidate.service";

const STATUS_OPTIONS = [
  "Applied",
  "Screening",
  "Interview",
  "Offer",
  "Hired",
  "Selected",
  "Rejected",
];

export default function CandidatesPage() {
  const router = useRouter();

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [minimumATS, setMinimumATS] = useState("");

  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [modal, setModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadCandidates() {
    try {
      setLoading(true);
      setError("");

      const data = await getCandidates();

      setCandidates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Unable to load candidates:", err);

      setError(
        err?.message ||
          "Unable to load candidates. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCandidates();
  }, []);

  function showSuccess(message) {
    setSuccess(message);

    setTimeout(() => {
      setSuccess("");
    }, 3000);
  }

  function closeModal() {
    if (actionLoading) return;

    setModal(null);
  }

  async function handleDelete(candidate) {
    const confirmed = window.confirm(
      `Delete ${candidate.name || "this candidate"}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");

      await deleteCandidate(candidate.id);

      setCandidates((current) =>
        current.filter((item) => item.id !== candidate.id)
      );

      if (selectedCandidate?.id === candidate.id) {
        setSelectedCandidate(null);
      }

      showSuccess("Candidate deleted successfully.");
    } catch (err) {
      console.error("Delete candidate failed:", err);

      setError(
        err?.message ||
          "Unable to delete candidate. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUpdate(data) {
    if (!selectedCandidate) return;

    try {
      setActionLoading(true);
      setError("");

      const updated = await updateCandidate(
        selectedCandidate.id,
        data
      );

      setCandidates((current) =>
        current.map((candidate) =>
          candidate.id === selectedCandidate.id
            ? {
                ...candidate,
                ...(updated || {}),
                ...data,
              }
            : candidate
        )
      );

      setSelectedCandidate((current) =>
        current
          ? {
              ...current,
              ...(updated || {}),
              ...data,
            }
          : current
      );

      setModal(null);

      showSuccess("Candidate updated successfully.");
    } catch (err) {
      console.error("Update candidate failed:", err);

      setError(
        err?.message ||
          "Unable to update candidate. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleScheduleInterview(data) {
    if (!selectedCandidate) return;

    try {
      setActionLoading(true);
      setError("");

      const response = await scheduleInterview(
        selectedCandidate.id,
        data
      );

      const updatedCandidate = {
        ...selectedCandidate,
        status: "Interview",
        interview_date: data.interview_date,
        interviewer: data.interviewer,
        meeting_link: data.meeting_link || null,
      };

      setCandidates((current) =>
        current.map((candidate) =>
          candidate.id === selectedCandidate.id
            ? {
                ...candidate,
                ...updatedCandidate,
                ...(response?.candidate || {}),
              }
            : candidate
        )
      );

      setSelectedCandidate(updatedCandidate);
      setModal(null);

      showSuccess("Interview scheduled successfully.");
    } catch (err) {
      console.error("Schedule interview failed:", err);

      setError(
        err?.message ||
          "Unable to schedule interview. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCompleteInterview(data) {
    if (!selectedCandidate) return;

    try {
      setActionLoading(true);
      setError("");

      const response = await completeInterview(
        selectedCandidate.id,
        data
      );

      const updatedCandidate = {
        ...selectedCandidate,
        status: data.result,
        interview_result: data.result,
        interview_score: data.score ?? null,
        interview_feedback: data.feedback || null,
        interview_completed_at:
          new Date().toISOString(),
      };

      setCandidates((current) =>
        current.map((candidate) =>
          candidate.id === selectedCandidate.id
            ? {
                ...candidate,
                ...updatedCandidate,
                ...(response?.candidate || {}),
              }
            : candidate
        )
      );

      setSelectedCandidate(updatedCandidate);
      setModal(null);

      showSuccess("Interview result saved successfully.");
    } catch (err) {
      console.error("Complete interview failed:", err);

      setError(
        err?.message ||
          "Unable to save interview result. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  }

  const statuses = useMemo(() => {
    const values = candidates
      .map((candidate) => candidate.status)
      .filter(Boolean);

    return [
      "All",
      ...new Set([
        ...STATUS_OPTIONS,
        ...values,
      ]),
    ];
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    const query = search.trim().toLowerCase();

    return candidates.filter((candidate) => {
      const matchesSearch =
        !query ||
        candidate.name?.toLowerCase().includes(query) ||
        candidate.email?.toLowerCase().includes(query) ||
        candidate.phone?.toLowerCase().includes(query) ||
        candidate.location?.toLowerCase().includes(query);

      const matchesStatus =
        status === "All" ||
        candidate.status === status ||
        (status === "Hired" && candidate.status === "Selected") ||
        (status === "Selected" && candidate.status === "Hired");

      const score = Number(
        candidate.ats_score || 0
      );

      const matchesATS =
        minimumATS === "" ||
        score >= Number(minimumATS);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesATS
      );
    });
  }, [
    candidates,
    search,
    status,
    minimumATS,
  ]);

  const summary = useMemo(() => {
    const total = candidates.length;

    const interviews = candidates.filter(
      (candidate) =>
        candidate.status === "Interview" ||
        candidate.status === "Technical Interview" ||
        candidate.status === "HR Interview"
    ).length;

    const hired = candidates.filter(
      (candidate) =>
        candidate.status === "Hired" ||
        candidate.status === "Selected"
    ).length;

    const average =
      total > 0
        ? Math.round(
            candidates.reduce(
              (sum, candidate) =>
                sum + Number(candidate.ats_score || 0),
              0
            ) / total
          )
        : 0;

    return { total, interviews, hired, average };
  }, [candidates]);


  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="min-h-full bg-white">

          {/* SUCCESS */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -15,
                }}
                className="fixed right-6 top-6 z-[200] flex items-center gap-3 rounded-xl border border-green-200 bg-white px-5 py-4 text-sm font-semibold text-green-700 shadow-xl"
              >
                <CheckCircle2
                  size={19}
                />
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* HEADER */}
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mb-8"
          >
            <button
              type="button"
              onClick={() =>
                router.push("/dashboard")
              }
              className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>

            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                  <span>Dashboard</span>
                  <span>/</span>
                  <span className="font-medium text-blue-600">
                    Candidates
                  </span>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Candidates
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Manage candidates, ATS scores,
                  interviews and recruitment status.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <SummaryCard
                  label="Candidates"
                  value={summary.total}
                  icon={Users}
                />

                <SummaryCard
                  label="Interviews"
                  value={summary.interviews}
                  icon={CalendarDays}
                />

                <SummaryCard
                  label="Hired"
                  value={summary.hired}
                  icon={CheckCircle2}
                />

                <SummaryCard
                  label="Avg ATS"
                  value={`${summary.average}%`}
                  icon={Award}
                />
              </div>
            </div>
          </motion.div>

          {/* ERROR */}
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
                className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                <span>{error}</span>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="rounded-md p-1 hover:bg-red-100"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FILTER BAR */}
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
              delay: 0.05,
            }}
            className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_auto]">

              {/* SEARCH */}
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
                <Search
                  size={19}
                  className="shrink-0 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search by name, email, phone or location..."
                  className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                />
              </div>

              {/* STATUS */}
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4">
                <SlidersHorizontal
                  size={18}
                  className="text-slate-400"
                />

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target.value
                    )
                  }
                  className="w-full bg-transparent py-3 text-sm text-slate-700 outline-none"
                >
                  {statuses.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* ATS */}
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={minimumATS}
                  onChange={(event) =>
                    setMinimumATS(
                      event.target.value
                    )
                  }
                  placeholder="Minimum ATS Score"
                  className="w-full bg-transparent py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                />
              </div>

              {/* CLEAR */}
              {(search ||
                status !== "All" ||
                minimumATS !== "") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatus("All");
                    setMinimumATS("");
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                >
                  <X size={17} />
                  Clear
                </button>
              )}
            </div>
          </motion.div>

          {/* TABLE */}
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
              delay: 0.1,
            }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Candidate List
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {filteredCandidates.length} candidate
                  {filteredCandidates.length === 1
                    ? ""
                    : "s"} found
                </p>
              </div>

              <div className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
                Live Data
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[320px] items-center justify-center">
                <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                  <Loader2
                    size={22}
                    className="animate-spin text-blue-600"
                  />
                  Loading candidates...
                </div>
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Users size={26} />
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  No candidates found
                </h3>

                <p className="mt-1 max-w-md text-sm text-slate-500">
                  Try changing your search or
                  filter criteria.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <TableHeading>
                        Candidate
                      </TableHeading>

                      <TableHeading>
                        Contact
                      </TableHeading>

                      <TableHeading>
                        ATS Score
                      </TableHeading>

                      <TableHeading>
                        Status
                      </TableHeading>

                      <TableHeading>
                        Applied
                      </TableHeading>

                      <TableHeading align="right">
                        Actions
                      </TableHeading>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCandidates.map(
                      (candidate, index) => (
                        <CandidateRow
                          key={candidate.id}
                          candidate={candidate}
                          index={index}
                          onView={() =>
                            setSelectedCandidate(
                              candidate
                            )
                          }
                          onEdit={() => {
                            setSelectedCandidate(
                              candidate
                            );
                            setModal("edit");
                          }}
                          onDelete={() =>
                            handleDelete(candidate)
                          }
                          onSchedule={() => {
                            setSelectedCandidate(
                              candidate
                            );
                            setModal("schedule");
                          }}
                          onComplete={() => {
                            setSelectedCandidate(
                              candidate
                            );
                            setModal("complete");
                          }}
                        />
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>

        {/* CANDIDATE PROFILE */}
        <AnimatePresence>
          {selectedCandidate &&
            !modal && (
              <CandidateModal
                candidate={
                  selectedCandidate
                }
                onClose={() =>
                  setSelectedCandidate(
                    null
                  )
                }
                onEdit={() =>
                  setModal("edit")
                }
                onDelete={() =>
                  handleDelete(
                    selectedCandidate
                  )
                }
                onSchedule={() =>
                  setModal("schedule")
                }
                onComplete={() =>
                  setModal("complete")
                }
              />
            )}
        </AnimatePresence>

        {/* EDIT */}
        <AnimatePresence>
          {modal === "edit" &&
            selectedCandidate && (
              <EditCandidateModal
                candidate={
                  selectedCandidate
                }
                loading={actionLoading}
                onClose={closeModal}
                onSubmit={handleUpdate}
              />
            )}
        </AnimatePresence>

        {/* SCHEDULE */}
        <AnimatePresence>
          {modal === "schedule" &&
            selectedCandidate && (
              <ScheduleInterviewModal
                candidate={
                  selectedCandidate
                }
                loading={actionLoading}
                onClose={closeModal}
                onSubmit={
                  handleScheduleInterview
                }
              />
            )}
        </AnimatePresence>

        {/* COMPLETE */}
        <AnimatePresence>
          {modal === "complete" &&
            selectedCandidate && (
              <CompleteInterviewModal
                candidate={
                  selectedCandidate
                }
                loading={actionLoading}
                onClose={closeModal}
                onSubmit={
                  handleCompleteInterview
                }
              />
            )}
        </AnimatePresence>
      </AppLayout>
    </ProtectedRoute>
  );
}

/* =====================================================
   SUMMARY CARD
===================================================== */

function SummaryCard({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="flex min-w-[130px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <Icon size={17} />
      </div>

      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>

        <p className="mt-0.5 text-lg font-bold text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =====================================================
   TABLE HEADING
===================================================== */

function TableHeading({
  children,
  align = "left",
}) {
  return (
    <th
      className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

/* =====================================================
   CANDIDATE ROW
===================================================== */

function CandidateRow({
  candidate,
  index,
  onView,
  onEdit,
  onDelete,
  onSchedule,
  onComplete,
}) {
  const score = Math.min(
    Math.max(
      Number(candidate.ats_score || 0),
      0
    ),
    100
  );

  const hasInterview =
    candidate.status === "Interview" &&
    candidate.interview_date;

  return (
    <motion.tr
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        delay: index * 0.025,
      }}
      className="border-b border-slate-100 transition hover:bg-blue-50/30"
    >
      {/* CANDIDATE */}
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-600">
            {getInitials(candidate.name)}
          </div>

          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">
              {candidate.name ||
                "Unnamed Candidate"}
            </p>

            {candidate.location && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                <MapPin size={12} />
                {candidate.location}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* CONTACT */}
      <td className="px-6 py-5">
        <div className="space-y-1">
          <p className="flex items-center gap-2 text-sm text-slate-600">
            <Mail
              size={14}
              className="text-slate-400"
            />

            <span className="max-w-[220px] truncate">
              {candidate.email || "—"}
            </span>
          </p>

          {candidate.phone && (
            <p className="flex items-center gap-2 text-xs text-slate-500">
              <Phone
                size={13}
                className="text-slate-400"
              />

              {candidate.phone}
            </p>
          )}
        </div>
      </td>

      {/* ATS */}
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{
                width: `${score}%`,
              }}
            />
          </div>

          <span className="text-sm font-semibold text-slate-900">
            {score}%
          </span>
        </div>
      </td>

      {/* STATUS */}
      <td className="px-6 py-5">
        <StatusBadge
          status={candidate.status}
        />

        {hasInterview && (
          <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
            <Clock size={11} />
            {formatDateTime(
              candidate.interview_date
            )}
          </p>
        )}
      </td>

      {/* APPLIED */}
      <td className="px-6 py-5 text-sm text-slate-500">
        {formatDate(candidate.created_at)}
      </td>

      {/* ACTIONS */}
      <td className="px-6 py-5">
        <div className="flex items-center justify-end gap-2">
          <IconButton
            title="View candidate"
            onClick={onView}
          >
            <Eye size={16} />
          </IconButton>

          <IconButton
            title="Edit candidate"
            onClick={onEdit}
          >
            <Pencil size={16} />
          </IconButton>

          {candidate.status !== "Interview" &&
            candidate.status !== "Offer" &&
            candidate.status !== "Hired" &&
            candidate.status !== "Selected" &&
            candidate.status !== "Rejected" && (
              <IconButton
                title="Schedule interview"
                onClick={onSchedule}
              >
                <CalendarDays size={16} />
              </IconButton>
            )}

          {candidate.status ===
            "Interview" && (
            <IconButton
              title="Complete interview"
              onClick={onComplete}
            >
              <CheckCircle2 size={16} />
            </IconButton>
          )}

          <IconButton
            title="Delete candidate"
            danger
            onClick={onDelete}
          >
            <Trash2 size={16} />
          </IconButton>
        </div>
      </td>
    </motion.tr>
  );
}

/* =====================================================
   STATUS BADGE
===================================================== */

function StatusBadge({ status }) {
  const normalized = status?.toLowerCase() || "applied";

  const styles = {
    applied:   "bg-blue-50 text-blue-700 border-blue-100",
    screening: "bg-purple-50 text-purple-700 border-purple-100",
    interview: "bg-amber-50 text-amber-700 border-amber-100",
    offer:     "bg-cyan-50 text-cyan-700 border-cyan-100",
    hired:     "bg-green-50 text-green-700 border-green-100",
    selected:  "bg-green-50 text-green-700 border-green-100",
    rejected:  "bg-red-50 text-red-700 border-red-100",
  };

  const style = styles[normalized] || "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${style}`}>
      {status || "Applied"}
    </span>
  );
}

/* =====================================================
   ICON BUTTON
===================================================== */

function IconButton({
  children,
  onClick,
  title,
  danger = false,
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
        danger
          ? "border-red-100 bg-white text-red-500 hover:border-red-200 hover:bg-red-50"
          : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
      }`}
    >
      {children}
    </button>
  );
}

/* =====================================================
   PROFILE MODAL
===================================================== */

function CandidateModal({
  candidate,
  onClose,
  onEdit,
  onDelete,
  onSchedule,
  onComplete,
}) {
  const score = Math.min(
    Math.max(
      Number(candidate.ats_score || 0),
      0
    ),
    100
  );

  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
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
          scale: 0.96,
          y: 15,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.96,
          y: 15,
        }}
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        {/* HEADER */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-lg font-bold text-blue-600">
              {getInitials(candidate.name)}
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {candidate.name ||
                  "Unnamed Candidate"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {candidate.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-6">

          {/* TOP ACTIONS */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
            >
              <Pencil size={16} />
              Edit
            </button>

            {candidate.resume_url && (
              <a
                href={getResumeUrl(
                  candidate.resume_url
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              >
                <FileText size={16} />
                View Resume
                <ExternalLink
                  size={13}
                />
              </a>
            )}

            {candidate.status !== "Interview" &&
              candidate.status !== "Offer" &&
              candidate.status !== "Hired" &&
              candidate.status !== "Rejected" && (
                <button
                  type="button"
                  onClick={onSchedule}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <CalendarDays
                    size={16}
                  />
                  Schedule Interview
                </button>
              )}

            {candidate.status ===
              "Interview" && (
              <button
                type="button"
                onClick={onComplete}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <CheckCircle2
                  size={16}
                />
                Complete Interview
              </button>
            )}

            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-2 rounded-lg border border-red-100 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>

          {/* ATS */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  ATS Score
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {score}%
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                {score}
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{
                  width: `${score}%`,
                }}
              />
            </div>
          </div>

          {/* INFORMATION */}
          <div className="grid gap-4 md:grid-cols-2">
            <Detail
              icon={Mail}
              label="Email"
              value={candidate.email}
            />

            <Detail
              icon={Phone}
              label="Phone"
              value={candidate.phone}
            />

            <Detail
              icon={MapPin}
              label="Location"
              value={candidate.location}
            />

            <Detail
              icon={Briefcase}
              label="Experience"
              value={
                candidate.experience_years
                  ? `${candidate.experience_years} years`
                  : candidate.experience
              }
            />

            <Detail
              icon={Award}
              label="Status"
              value={candidate.status}
            />

            <Detail
              icon={CalendarDays}
              label="Applied"
              value={formatDate(
                candidate.created_at
              )}
            />
          </div>

          {/* INTERVIEW */}
          {candidate.interview_date && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <CalendarDays
                    size={17}
                    className="text-blue-600"
                  />
                  Interview
                </h3>

                <StatusBadge
                  status={
                    candidate.interview_result ||
                    candidate.status
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Detail
                  icon={CalendarDays}
                  label="Interview Date"
                  value={formatDateTime(
                    candidate.interview_date
                  )}
                />

                <Detail
                  icon={Users}
                  label="Interviewer"
                  value={
                    candidate.interviewer
                  }
                />
              </div>

              {candidate.meeting_link && (
                <a
                  href={
                    candidate.meeting_link
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Video size={16} />
                  Join Meeting
                  <ExternalLink
                    size={13}
                  />
                </a>
              )}

              {candidate.interview_score !==
                null &&
                candidate.interview_score !==
                  undefined && (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Interview Score
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      {
                        candidate.interview_score
                      }
                      /100
                    </p>
                  </div>
                )}

              {candidate.interview_feedback && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Interview Feedback
                  </p>

                  <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
                    {
                      candidate.interview_feedback
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {/* SUMMARY */}
          {candidate.summary && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900">
                Summary
              </h3>

              <p className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                {candidate.summary}
              </p>
            </div>
          )}

          {/* SKILLS */}
          {candidate.skills && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900">
                Skills
              </h3>

              <div className="flex flex-wrap gap-2">
                {getSkills(
                  candidate.skills
                ).map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* LINKS */}
          {(candidate.linkedin ||
            candidate.github) && (
            <div className="flex flex-wrap gap-3">
              {candidate.linkedin && (
                <a
                  href={candidate.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  LinkedIn →
                </a>
              )}

              {candidate.github && (
                <a
                  href={candidate.github}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  GitHub →
                </a>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* =====================================================
   EDIT MODAL
===================================================== */

function EditCandidateModal({
  candidate,
  loading,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState({
    name: candidate.name || "",
    email: candidate.email || "",
    phone: candidate.phone || "",
    status: candidate.status || "Applied",
    ats_score: Number(
      candidate.ats_score || 0
    ),
  });

  const emailValidation = useMemo(() => {
    if (!form.email || !form.email.trim()) return null;
    return validateEmail(form.email);
  }, [form.email]);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function applyEmailSuggestion() {
    if (emailValidation?.suggestion) {
      updateField("email", emailValidation.suggestion);
    }
  }

  function submit(event) {
    event.preventDefault();

    if (emailValidation && !emailValidation.isValid) {
      return;
    }

    onSubmit({
      ...form,
      email: (emailValidation?.email || form.email).trim().toLowerCase(),
      ats_score: Number(form.ats_score),
    });
  }

  return (
    <ModalShell
      title="Edit Candidate"
      subtitle="Update candidate information and recruitment status."
      onClose={onClose}
    >
      <form
        onSubmit={submit}
        className="space-y-5"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="Full Name"
            value={form.name}
            onChange={(value) =>
              updateField("name", value)
            }
            required
          />

          <div>
            <FormField
              label="Email"
              type="email"
              value={form.email}
              onChange={(value) =>
                updateField("email", value)
              }
              required
            />
            {emailValidation && !emailValidation.isValid && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-500 font-medium">
                <AlertCircle size={14} className="shrink-0" />
                {emailValidation.reason}
              </p>
            )}
            {emailValidation?.suggestion && (
              <div className="mt-2 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-800">
                <span>
                  Did you mean <strong>{emailValidation.suggestion}</strong>?
                </span>
                <button
                  type="button"
                  onClick={applyEmailSuggestion}
                  className="ml-2 font-semibold text-blue-600 hover:underline"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          <FormField
            label="Phone"
            value={form.phone}
            onChange={(value) =>
              updateField("phone", value)
            }
          />

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Status
            </label>

            <select
              value={form.status}
              onChange={(event) =>
                updateField(
                  "status",
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {STATUS_OPTIONS.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>
          </div>

          <FormField
            label="ATS Score"
            type="number"
            min="0"
            max="100"
            value={form.ats_score}
            onChange={(value) =>
              updateField(
                "ats_score",
                value
              )
            }
          />
        </div>

        <ModalActions
          loading={loading}
          onClose={onClose}
          submitLabel="Save Changes"
          submitIcon={Save}
        />
      </form>
    </ModalShell>
  );
}

/* =====================================================
   SCHEDULE INTERVIEW MODAL
===================================================== */

function ScheduleInterviewModal({
  candidate,
  loading,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState({
    interview_date: "",
    interviewer: "",
    meeting_link: "",
  });

  function submit(event) {
    event.preventDefault();

    if (
      !form.interview_date ||
      !form.interviewer.trim()
    ) {
      return;
    }

    onSubmit({
      interview_date:
        form.interview_date,
      interviewer:
        form.interviewer.trim(),
      meeting_link:
        form.meeting_link.trim() ||
        null,
    });
  }

  return (
    <ModalShell
      title="Schedule Interview"
      subtitle={`Schedule an interview for ${candidate.name || "this candidate"}.`}
      onClose={onClose}
    >
      <form
        onSubmit={submit}
        className="space-y-5"
      >
        <div className="rounded-xl bg-blue-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white font-semibold text-blue-600">
              {getInitials(
                candidate.name
              )}
            </div>

            <div>
              <p className="font-semibold text-slate-900">
                {candidate.name}
              </p>

              <p className="text-xs text-slate-500">
                {candidate.email}
              </p>
            </div>
          </div>
        </div>

        <FormField
          label="Interview Date & Time"
          type="datetime-local"
          value={
            form.interview_date
          }
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              interview_date:
                value,
            }))
          }
          required
        />

        <FormField
          label="Interviewer"
          value={form.interviewer}
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              interviewer: value,
            }))
          }
          placeholder="e.g. Sarah Johnson"
          required
        />

        <FormField
          label="Meeting Link"
          type="url"
          value={form.meeting_link}
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              meeting_link: value,
            }))
          }
          placeholder="https://meet.google.com/..."
        />

        <ModalActions
          loading={loading}
          onClose={onClose}
          submitLabel="Schedule Interview"
          submitIcon={CalendarDays}
        />
      </form>
    </ModalShell>
  );
}

/* =====================================================
   COMPLETE INTERVIEW MODAL
===================================================== */

function CompleteInterviewModal({
  candidate,
  loading,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState({
    result: "Hired",
    score: "",
    feedback: "",
  });

  function submit(event) {
    event.preventDefault();

    const score =
      form.score === ""
        ? null
        : Number(form.score);

    onSubmit({
      result: form.result,
      score,
      feedback:
        form.feedback.trim() ||
        null,
    });
  }

  return (
    <ModalShell
      title="Complete Interview"
      subtitle={`Record the interview outcome for ${candidate.name || "this candidate"}.`}
      onClose={onClose}
    >
      <form
        onSubmit={submit}
        className="space-y-5"
      >
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Candidate
          </p>

          <p className="mt-1 font-semibold text-slate-900">
            {candidate.name}
          </p>

          {candidate.interview_date && (
            <p className="mt-1 text-sm text-slate-500">
              {formatDateTime(
                candidate.interview_date
              )}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Interview Result
          </label>

          <select
            value={form.result}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                result:
                  event.target.value,
              }))
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="Offer">Offer</option>
            <option value="Hired">Hired</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <FormField
          label="Interview Score"
          type="number"
          min="0"
          max="100"
          value={form.score}
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              score: value,
            }))
          }
          placeholder="0 - 100"
        />

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Feedback
          </label>

          <textarea
            value={form.feedback}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                feedback:
                  event.target.value,
              }))
            }
            rows={5}
            placeholder="Add interview feedback..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <ModalActions
          loading={loading}
          onClose={onClose}
          submitLabel="Save Interview Result"
          submitIcon={CheckCircle2}
        />
      </form>
    </ModalShell>
  );
}

/* =====================================================
   MODAL SHELL
===================================================== */

function ModalShell({
  title,
  subtitle,
  children,
  onClose,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
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
          scale: 0.96,
          y: 15,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.96,
          y: 15,
        }}
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {title}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* =====================================================
   MODAL ACTIONS
===================================================== */

function ModalActions({
  loading,
  onClose,
  submitLabel,
  submitIcon: SubmitIcon,
}) {
  return (
    <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
      <button
        type="button"
        onClick={onClose}
        disabled={loading}
        className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2
            size={17}
            className="animate-spin"
          />
        ) : (
          <SubmitIcon size={17} />
        )}

        {loading
          ? "Saving..."
          : submitLabel}
      </button>
    </div>
  );
}

/* =====================================================
   FORM FIELD
===================================================== */

function FormField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  min,
  max,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

/* =====================================================
   DETAIL
===================================================== */

function Detail({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500">
        <Icon size={14} />
        {label}
      </div>

      <p className="truncate text-sm font-semibold text-slate-900">
        {value || "Not provided"}
      </p>
    </div>
  );
}

/* =====================================================
   HELPERS
===================================================== */

function getInitials(name) {
  if (!name) return "C";

  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return "—";
  }

  return parsed.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

function formatDateTime(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return date;
  }

  return parsed.toLocaleString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
}

function getSkills(skills) {
  if (Array.isArray(skills)) {
    return skills;
  }

  if (typeof skills === "string") {
    try {
      const parsed =
        JSON.parse(skills);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Continue with comma-separated parsing.
    }

    return skills
      .split(",")
      .map((skill) =>
        skill.trim()
      )
      .filter(Boolean);
  }

  return [];
}

function getResumeUrl(resumeUrl) {
  if (!resumeUrl) return "#";

  if (
    resumeUrl.startsWith("http://") ||
    resumeUrl.startsWith("https://")
  ) {
    return resumeUrl;
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000";

  return `${baseUrl.replace(
    /\/$/,
    ""
  )}/${resumeUrl.replace(
    /^\//,
    ""
  )}`;
}
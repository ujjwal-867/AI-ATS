"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronLeft,
  Edit3,
  Loader2,
  MapPin,
  Plus,
  Search,
  Trash2,
  X,
  Clock3,
  IndianRupee,
  UserRound,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";

import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getJobs } from "@/services/api";
import request from "@/services/api";

export default function JobsPage() {
  const router = useRouter();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [error, setError] = useState("");

  const [selectedJob, setSelectedJob] = useState(null);

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [editingJob, setEditingJob] = useState(null);

  const [deletingJob, setDeletingJob] =
    useState(null);

  async function loadJobs() {
    try {
      setLoading(true);
      setError("");

      const data = await getJobs();

      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Unable to load jobs:", err);

      setError(
        err?.message ||
          "Unable to load jobs. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  const statuses = useMemo(() => {
    const values = jobs
      .map((job) => job.status)
      .filter(Boolean);

    return ["All", ...new Set(values)];
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch =
        !query ||
        job.title?.toLowerCase().includes(query) ||
        job.company?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        job.employment_type
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        job.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [jobs, search, statusFilter]);

  function openCreate() {
    setEditingJob(null);
    setShowCreateModal(true);
  }

  function openEdit(job) {
    setSelectedJob(null);
    setEditingJob(job);
    setShowCreateModal(true);
  }

  async function handleDelete() {
    if (!deletingJob) return;

    try {
      await request(
        `/api/jobs/${deletingJob.id}`,
        {
          method: "DELETE",
        }
      );

      setJobs((current) =>
        current.filter(
          (job) => job.id !== deletingJob.id
        )
      );

      setDeletingJob(null);
      setSelectedJob(null);
    } catch (err) {
      console.error("Delete job error:", err);

      setError(
        err?.message ||
          "Unable to delete this job."
      );
    }
  }

  async function handleSaveJob(formData) {
    if (editingJob) {
      const updated = await request(
        `/api/jobs/${editingJob.id}`,
        {
          method: "PUT",
          body: JSON.stringify(formData),
        }
      );

      setJobs((current) =>
        current.map((job) =>
          job.id === updated.id
            ? updated
            : job
        )
      );
    } else {
      const created = await request(
        "/api/jobs/",
        {
          method: "POST",
          body: JSON.stringify(formData),
        }
      );

      setJobs((current) => [
        created,
        ...current,
      ]);
    }

    setShowCreateModal(false);
    setEditingJob(null);
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="mx-auto max-w-[1700px] space-y-8">

          {/* HEADER */}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                router.push("/dashboard")
              }
              className="
                flex h-10 w-10 items-center
                justify-center rounded-xl
                border border-slate-200
                bg-white text-slate-600
                transition
                hover:border-blue-200
                hover:bg-blue-50
                hover:text-blue-600
              "
            >
              <ChevronLeft size={19} />
            </button>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">
                Recruitment
              </p>

              <h1 className="mt-1 text-4xl font-bold tracking-tight text-slate-900">
                Jobs
              </h1>

              <p className="mt-2 text-slate-500">
                Manage your recruitment positions
                and hiring requirements.
              </p>
            </div>
          </div>

          {/* TOOLBAR */}

          <section
            className="
              rounded-3xl
              border border-slate-200
              bg-white
              p-5
              shadow-sm
            "
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex flex-1 flex-col gap-3 md:flex-row">

                <div
                  className="
                    flex h-12 flex-1
                    items-center gap-3
                    rounded-xl
                    bg-slate-50
                    px-4
                  "
                >
                  <Search
                    size={19}
                    className="text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Search jobs, companies, locations..."
                    className="
                      w-full bg-transparent
                      text-sm text-slate-900
                      placeholder:text-slate-400
                    "
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value
                    )
                  }
                  className="
                    h-12 rounded-xl
                    border border-slate-200
                    bg-white px-4
                    text-sm font-medium
                    text-slate-700
                  "
                >
                  {statuses.map((status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status === "All"
                        ? "All Status"
                        : status}
                    </option>
                  ))}
                </select>

              </div>

              <button
                type="button"
                onClick={openCreate}
                className="
                  flex h-12 items-center
                  justify-center gap-2
                  rounded-xl
                  bg-blue-600
                  px-6
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-blue-700
                "
              >
                <Plus size={19} />
                Create Job
              </button>

            </div>
          </section>

          {/* SUMMARY */}

          <div className="grid gap-4 md:grid-cols-3">

            <SummaryCard
              label="Total Jobs"
              value={jobs.length}
              icon={BriefcaseBusiness}
            />

            <SummaryCard
              label="Open Positions"
              value={
                jobs.filter(
                  (job) =>
                    String(
                      job.status || ""
                    ).toLowerCase() === "open"
                ).length
              }
              icon={CheckCircle2}
            />

            <SummaryCard
              label="Showing"
              value={filteredJobs.length}
              icon={Search}
            />

          </div>

          {/* ERROR */}

          {error && (
            <div
              className="
                flex items-start gap-3
                rounded-2xl
                border border-red-200
                bg-red-50
                p-4
                text-red-700
              "
            >
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0"
              />

              <div>
                <p className="font-semibold">
                  Unable to load jobs
                </p>

                <p className="mt-1 text-sm">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={loadJobs}
                  className="
                    mt-3 text-sm
                    font-semibold
                    text-red-700
                    underline
                  "
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* JOBS */}

          {loading ? (
            <div
              className="
                flex min-h-[320px]
                items-center
                justify-center
                rounded-3xl
                border border-slate-200
                bg-white
              "
            >
              <div className="flex items-center gap-3 text-slate-500">
                <Loader2
                  size={22}
                  className="animate-spin text-blue-600"
                />

                Loading jobs...
              </div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <EmptyJobs
              hasFilters={
                Boolean(search) ||
                statusFilter !== "All"
              }
              onCreate={openCreate}
              onClear={() => {
                setSearch("");
                setStatusFilter("All");
              }}
            />
          ) : (
            <motion.div
              layout
              className="
                grid gap-6
                md:grid-cols-2
                xl:grid-cols-3
              "
            >
              <AnimatePresence mode="popLayout">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onView={() =>
                      setSelectedJob(job)
                    }
                    onEdit={() =>
                      openEdit(job)
                    }
                    onDelete={() =>
                      setDeletingJob(job)
                    }
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

        </div>

        {/* CREATE / EDIT */}

        <AnimatePresence>
          {showCreateModal && (
            <JobFormModal
              job={editingJob}
              onClose={() => {
                setShowCreateModal(false);
                setEditingJob(null);
              }}
              onSave={handleSaveJob}
            />
          )}
        </AnimatePresence>

        {/* DETAILS */}

        <AnimatePresence>
          {selectedJob && (
            <JobDetailsModal
              job={selectedJob}
              onClose={() =>
                setSelectedJob(null)
              }
              onEdit={() =>
                openEdit(selectedJob)
              }
              onDelete={() =>
                setDeletingJob(selectedJob)
              }
            />
          )}
        </AnimatePresence>

        {/* DELETE */}

        <AnimatePresence>
          {deletingJob && (
            <DeleteModal
              job={deletingJob}
              onCancel={() =>
                setDeletingJob(null)
              }
              onConfirm={handleDelete}
            />
          )}
        </AnimatePresence>

      </AppLayout>
    </ProtectedRoute>
  );
}


/* ------------------------------------------------ */
/* SUMMARY CARD */
/* ------------------------------------------------ */

function SummaryCard({
  label,
  value,
  icon: Icon,
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
      className="
        rounded-2xl
        border border-slate-200
        bg-white
        p-5
        shadow-sm
      "
    >
      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div
          className="
            flex h-12 w-12
            items-center justify-center
            rounded-xl
            bg-blue-50
            text-blue-600
          "
        >
          <Icon size={22} />
        </div>

      </div>
    </motion.div>
  );
}


/* ------------------------------------------------ */
/* JOB CARD */
/* ------------------------------------------------ */

function JobCard({
  job,
  onView,
  onEdit,
  onDelete,
}) {
  const skills = parseSkills(
    job.required_skills
  );

  return (
    <motion.article
      layout
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        scale: 0.96,
      }}
      whileHover={{
        y: -4,
      }}
      transition={{
        duration: 0.2,
      }}
      className="
        overflow-hidden
        rounded-3xl
        border border-slate-200
        bg-white
        shadow-sm
        transition-shadow
        hover:shadow-lg
      "
    >

      <div className="p-7">

        <div className="flex items-start justify-between gap-4">

          <div
            className="
              flex h-14 w-14
              shrink-0
              items-center justify-center
              rounded-2xl
              bg-blue-50
              text-blue-600
            "
          >
            <BriefcaseBusiness size={25} />
          </div>

          <StatusBadge
            status={job.status}
          />

        </div>

        <h2
          className="
            mt-6
            line-clamp-2
            text-2xl
            font-bold
            text-slate-900
          "
        >
          {job.title}
        </h2>

        <div className="mt-4 space-y-3">

          {job.company && (
            <InfoLine
              icon={Building2}
              text={job.company}
            />
          )}

          {job.location && (
            <InfoLine
              icon={MapPin}
              text={job.location}
            />
          )}

          {job.employment_type && (
            <InfoLine
              icon={UserRound}
              text={job.employment_type}
            />
          )}

        </div>

        <div className="mt-6 flex flex-wrap gap-2">

          {skills.length > 0 ? (
            skills.slice(0, 5).map((skill) => (
              <span
                key={skill}
                className="
                  rounded-full
                  bg-slate-100
                  px-3 py-1.5
                  text-xs
                  font-medium
                  text-slate-700
                "
              >
                {skill}
              </span>
            ))
          ) : (
            <span className="text-sm text-slate-400">
              No required skills specified
            </span>
          )}

          {skills.length > 5 && (
            <span
              className="
                rounded-full
                bg-[#FFF8E1]
                px-3 py-1.5
                text-xs
                font-semibold
                text-[#A27B00]
              "
            >
              +{skills.length - 5}
            </span>
          )}

        </div>

        <div
          className="
            mt-7
            flex items-center
            justify-between
            border-t
            border-slate-100
            pt-5
          "
        >

          <button
            type="button"
            onClick={onView}
            className="
              text-sm
              font-semibold
              text-blue-600
              hover:text-blue-700
            "
          >
            View Details
          </button>

          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={onEdit}
              title="Edit job"
              className="
                flex h-9 w-9
                items-center justify-center
                rounded-lg
                text-slate-500
                hover:bg-blue-50
                hover:text-blue-600
              "
            >
              <Edit3 size={17} />
            </button>

            <button
              type="button"
              onClick={onDelete}
              title="Delete job"
              className="
                flex h-9 w-9
                items-center justify-center
                rounded-lg
                text-slate-500
                hover:bg-red-50
                hover:text-red-600
              "
            >
              <Trash2 size={17} />
            </button>

          </div>

        </div>

      </div>

    </motion.article>
  );
}


/* ------------------------------------------------ */
/* JOB FORM */
/* ------------------------------------------------ */

function JobFormModal({
  job,
  onClose,
  onSave,
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: job?.title || "",
    company: job?.company || "",
    location: job?.location || "",
    employment_type:
      job?.employment_type || "",
    experience: job?.experience || "",
    salary: job?.salary || "",
    description: job?.description || "",
    status: job?.status || "Open",
  });

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Job title is required.");
      return;
    }

    if (!form.description.trim()) {
      setError(
        "Job description is required."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      await onSave({
        title: form.title.trim(),
        company:
          form.company.trim() || null,
        location:
          form.location.trim() || null,
        employment_type:
          form.employment_type.trim() ||
          null,
        experience:
          form.experience.trim() || null,
        salary:
          form.salary.trim() || null,
        description:
          form.description.trim(),
        ...(job
          ? {
              status:
                form.status || "Open",
            }
          : {}),
      });
    } catch (err) {
      console.error(
        "Unable to save job:",
        err
      );

      setError(
        err?.message ||
          "Unable to save the job."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell onClose={onClose}>

      <div className="flex items-center justify-between border-b border-slate-100 px-7 py-6">

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#D4AF37]">
            {job
              ? "Job Management"
              : "New Position"}
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {job
              ? "Edit Job"
              : "Create Job"}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="
            flex h-10 w-10
            items-center justify-center
            rounded-xl
            text-slate-500
            hover:bg-slate-100
          "
        >
          <X size={20} />
        </button>

      </div>

      <form
        onSubmit={handleSubmit}
        className="max-h-[75vh] overflow-y-auto px-7 py-6"
      >

        {error && (
          <div
            className="
              mb-5
              rounded-xl
              border border-red-200
              bg-red-50
              p-3
              text-sm
              text-red-700
            "
          >
            {error}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">

          <FormField
            label="Job Title"
            required
            value={form.title}
            onChange={(value) =>
              updateField("title", value)
            }
            placeholder="e.g. Frontend Developer"
          />

          <FormField
            label="Company"
            value={form.company}
            onChange={(value) =>
              updateField(
                "company",
                value
              )
            }
            placeholder="Company name"
          />

          <FormField
            label="Location"
            value={form.location}
            onChange={(value) =>
              updateField(
                "location",
                value
              )
            }
            placeholder="e.g. Bengaluru / Remote"
          />

          <FormField
            label="Employment Type"
            value={form.employment_type}
            onChange={(value) =>
              updateField(
                "employment_type",
                value
              )
            }
            placeholder="e.g. Full-time"
          />

          <FormField
            label="Experience"
            value={form.experience}
            onChange={(value) =>
              updateField(
                "experience",
                value
              )
            }
            placeholder="e.g. 2-4 years"
          />

          <FormField
            label="Salary"
            value={form.salary}
            onChange={(value) =>
              updateField(
                "salary",
                value
              )
            }
            placeholder="e.g. ₹8-12 LPA"
          />

          {job && (
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
                className="
                  h-11 w-full
                  rounded-xl
                  border border-slate-200
                  bg-white
                  px-3
                  text-sm
                  text-slate-900
                "
              >
                <option value="Open">
                  Open
                </option>
                <option value="Closed">
                  Closed
                </option>
                <option value="Paused">
                  Paused
                </option>
              </select>
            </div>
          )}

        </div>

        <div className="mt-5">

          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Job Description
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <textarea
            value={form.description}
            onChange={(event) =>
              updateField(
                "description",
                event.target.value
              )
            }
            rows={7}
            placeholder="Describe the role, responsibilities, qualifications and requirements..."
            className="
              w-full
              resize-none
              rounded-xl
              border border-slate-200
              bg-white
              p-4
              text-sm
              text-slate-900
              placeholder:text-slate-400
              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-100
            "
          />

          <p className="mt-2 text-xs text-slate-400">
            Required skills will be extracted
            automatically from the description.
          </p>

        </div>

        <div className="mt-7 flex justify-end gap-3">

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="
              rounded-xl
              border border-slate-200
              px-5 py-3
              text-sm font-semibold
              text-slate-700
              hover:bg-slate-50
            "
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="
              flex items-center gap-2
              rounded-xl
              bg-blue-600
              px-6 py-3
              text-sm font-semibold
              text-white
              hover:bg-blue-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {saving && (
              <Loader2
                size={17}
                className="animate-spin"
              />
            )}

            {job
              ? "Save Changes"
              : "Create Job"}
          </button>

        </div>

      </form>

    </ModalShell>
  );
}


/* ------------------------------------------------ */
/* DETAILS MODAL */
/* ------------------------------------------------ */

function JobDetailsModal({
  job,
  onClose,
  onEdit,
  onDelete,
}) {
  const skills = parseSkills(
    job.required_skills
  );

  return (
    <ModalShell onClose={onClose}>

      <div className="flex items-start justify-between border-b border-slate-100 px-7 py-6">

        <div className="flex items-start gap-4">

          <div
            className="
              flex h-14 w-14
              items-center justify-center
              rounded-2xl
              bg-blue-50
              text-blue-600
            "
          >
            <BriefcaseBusiness size={25} />
          </div>

          <div>
            <StatusBadge
              status={job.status}
            />

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {job.title}
            </h2>

            {job.company && (
              <p className="mt-1 text-sm text-slate-500">
                {job.company}
              </p>
            )}
          </div>

        </div>

        <button
          type="button"
          onClick={onClose}
          className="
            flex h-10 w-10
            items-center justify-center
            rounded-xl
            text-slate-500
            hover:bg-slate-100
          "
        >
          <X size={20} />
        </button>

      </div>

      <div className="max-h-[75vh] overflow-y-auto px-7 py-6">

        <div className="grid gap-4 md:grid-cols-2">

          {job.location && (
            <DetailItem
              icon={MapPin}
              label="Location"
              value={job.location}
            />
          )}

          {job.employment_type && (
            <DetailItem
              icon={UserRound}
              label="Employment Type"
              value={job.employment_type}
            />
          )}

          {job.experience && (
            <DetailItem
              icon={Clock3}
              label="Experience"
              value={job.experience}
            />
          )}

          {job.salary && (
            <DetailItem
              icon={IndianRupee}
              label="Salary"
              value={job.salary}
            />
          )}

        </div>

        <div className="mt-7">

          <div className="flex items-center gap-2">

            <FileText
              size={18}
              className="text-blue-600"
            />

            <h3 className="font-semibold text-slate-900">
              Description
            </h3>

          </div>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
            {job.description}
          </p>

        </div>

        <div className="mt-7">

          <h3 className="font-semibold text-slate-900">
            Required Skills
          </h3>

          <div className="mt-3 flex flex-wrap gap-2">

            {skills.length > 0 ? (
              skills.map((skill) => (
                <span
                  key={skill}
                  className="
                    rounded-full
                    bg-blue-50
                    px-3 py-1.5
                    text-sm
                    font-medium
                    text-blue-700
                  "
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-400">
                No required skills specified.
              </p>
            )}

          </div>

        </div>

        <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-5">

          <button
            type="button"
            onClick={onDelete}
            className="
              flex items-center gap-2
              rounded-xl
              border border-red-200
              px-5 py-3
              text-sm font-semibold
              text-red-600
              hover:bg-red-50
            "
          >
            <Trash2 size={17} />
            Delete
          </button>

          <button
            type="button"
            onClick={onEdit}
            className="
              flex items-center gap-2
              rounded-xl
              bg-blue-600
              px-5 py-3
              text-sm font-semibold
              text-white
              hover:bg-blue-700
            "
          >
            <Edit3 size={17} />
            Edit Job
          </button>

        </div>

      </div>

    </ModalShell>
  );
}


/* ------------------------------------------------ */
/* DELETE MODAL */
/* ------------------------------------------------ */

function DeleteModal({
  job,
  onCancel,
  onConfirm,
}) {
  const [deleting, setDeleting] =
    useState(false);

  async function confirmDelete() {
    try {
      setDeleting(true);
      await onConfirm();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <ModalShell onClose={onCancel}>

      <div className="p-7">

        <div
          className="
            flex h-12 w-12
            items-center justify-center
            rounded-xl
            bg-red-50
            text-red-600
          "
        >
          <Trash2 size={22} />
        </div>

        <h2 className="mt-5 text-2xl font-bold text-slate-900">
          Delete Job?
        </h2>

        <p className="mt-3 leading-6 text-slate-500">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-800">
            {job.title}
          </span>
          ? This action cannot be undone.
        </p>

        <div className="mt-7 flex justify-end gap-3">

          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="
              rounded-xl
              border border-slate-200
              px-5 py-3
              text-sm font-semibold
              text-slate-700
              hover:bg-slate-50
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={confirmDelete}
            disabled={deleting}
            className="
              flex items-center gap-2
              rounded-xl
              bg-red-600
              px-5 py-3
              text-sm font-semibold
              text-white
              hover:bg-red-700
              disabled:opacity-60
            "
          >
            {deleting && (
              <Loader2
                size={17}
                className="animate-spin"
              />
            )}

            Delete Job
          </button>

        </div>

      </div>

    </ModalShell>
  );
}


/* ------------------------------------------------ */
/* EMPTY STATE */
/* ------------------------------------------------ */

function EmptyJobs({
  hasFilters,
  onCreate,
  onClear,
}) {
  return (
    <div
      className="
        rounded-3xl
        border border-slate-200
        bg-white
        px-6 py-20
        text-center
        shadow-sm
      "
    >

      <div
        className="
          mx-auto flex h-16 w-16
          items-center justify-center
          rounded-2xl
          bg-slate-100
          text-slate-500
        "
      >
        <BriefcaseBusiness size={28} />
      </div>

      <h2 className="mt-5 text-xl font-bold text-slate-900">
        {hasFilters
          ? "No matching jobs"
          : "No jobs yet"}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasFilters
          ? "Try changing your search or status filter."
          : "Create your first recruitment position to start managing your hiring pipeline."}
      </p>

      <div className="mt-6 flex justify-center gap-3">

        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="
              rounded-xl
              border border-slate-200
              px-5 py-3
              text-sm font-semibold
              text-slate-700
              hover:bg-slate-50
            "
          >
            Clear Filters
          </button>
        )}

        <button
          type="button"
          onClick={onCreate}
          className="
            flex items-center gap-2
            rounded-xl
            bg-blue-600
            px-5 py-3
            text-sm font-semibold
            text-white
            hover:bg-blue-700
          "
        >
          <Plus size={17} />
          Create Job
        </button>

      </div>

    </div>
  );
}


/* ------------------------------------------------ */
/* SMALL COMPONENTS */
/* ------------------------------------------------ */

function InfoLine({
  icon: Icon,
  text,
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-600">
      <Icon
        size={17}
        className="shrink-0 text-slate-400"
      />
      <span className="truncate">
        {text}
      </span>
    </div>
  );
}


function DetailItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <Icon size={15} />
        {label}
      </div>

      <p className="mt-2 text-sm font-semibold text-slate-800">
        {value}
      </p>

    </div>
  );
}


function StatusBadge({
  status,
}) {
  const normalized =
    String(status || "Open")
      .toLowerCase();

  const isOpen =
    normalized === "open";

  const isPaused =
    normalized === "paused";

  return (
    <span
      className={`
        rounded-full
        px-3 py-1.5
        text-xs
        font-semibold
        ${
          isOpen
            ? "bg-green-50 text-green-700"
            : isPaused
            ? "bg-amber-50 text-amber-700"
            : "bg-slate-100 text-slate-600"
        }
      `}
    >
      {status || "Open"}
    </span>
  );
}


function FormField({
  label,
  required,
  value,
  onChange,
  placeholder,
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
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="
          h-11 w-full
          rounded-xl
          border border-slate-200
          bg-white
          px-3
          text-sm
          text-slate-900
          placeholder:text-slate-400
          focus:border-blue-500
          focus:ring-2
          focus:ring-blue-100
        "
      />

    </div>
  );
}


function ModalShell({
  children,
  onClose,
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        bg-slate-950/40
        p-4
        backdrop-blur-sm
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
          scale: 0.98,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          y: 20,
          scale: 0.98,
        }}
        transition={{
          duration: 0.2,
        }}
        className="
          w-full
          max-w-3xl
          overflow-hidden
          rounded-3xl
          border border-slate-200
          bg-white
          shadow-2xl
        "
      >
        {children}
      </motion.div>
    </motion.div>
  );
}


/* ------------------------------------------------ */
/* HELPERS */
/* ------------------------------------------------ */

function parseSkills(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map(String)
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed
          .map(String)
          .map((skill) => skill.trim())
          .filter(Boolean);
      }
    } catch {
      // Continue with comma-separated parsing.
    }

    return value
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  return [];
}
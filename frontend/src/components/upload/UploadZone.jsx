"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

import {
  UploadCloud,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  Trash2,
  User,
  Mail,
  Phone,
  BriefcaseBusiness,
  Target,
  Sparkles,
} from "lucide-react";

import {
  getJobs,
  matchCandidate,
} from "@/services/api";

import request from "@/services/api";

export default function UploadZone() {
  const [file, setFile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");

  const [candidate, setCandidate] = useState(null);
  const [matchResult, setMatchResult] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [matching, setMatching] = useState(false);

  const [loadingJobs, setLoadingJobs] = useState(true);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // --------------------------------------------------
  // LOAD JOBS
  // --------------------------------------------------

  useEffect(() => {
    let mounted = true;

    async function loadJobs() {
      try {
        setLoadingJobs(true);

        const data = await getJobs();

        if (!mounted) return;

        const jobList = Array.isArray(data)
          ? data
          : Array.isArray(data?.jobs)
            ? data.jobs
            : [];

        setJobs(jobList);

        if (jobList.length > 0) {
          setSelectedJob(String(jobList[0].id));
        }
      } catch (err) {
        console.error("Jobs loading error:", err);

        if (mounted) {
          setError(
            err?.message ||
              "Unable to load jobs."
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

  // --------------------------------------------------
  // FILE DROP
  // --------------------------------------------------

  const onDrop = useCallback((acceptedFiles) => {
    if (!acceptedFiles?.length) {
      setError(
        "Please select a valid PDF, DOC, or DOCX resume."
      );
      return;
    }

    const selectedFile = acceptedFiles[0];

    setFile(selectedFile);
    setCandidate(null);
    setMatchResult(null);

    setError("");
    setSuccess("");
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open,
  } = useDropzone({
    onDrop,
    multiple: false,
    noClick: true,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
  });

  // --------------------------------------------------
  // REMOVE FILE
  // --------------------------------------------------

  function removeFile(event) {
    event.stopPropagation();

    setFile(null);
    setCandidate(null);
    setMatchResult(null);
    setSuccess("");
    setError("");
  }

  // --------------------------------------------------
  // UPLOAD RESUME
  // --------------------------------------------------

  async function uploadResume() {
    if (!file) {
      setError("Please select a resume first.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");
      setMatchResult(null);

      const formData = new FormData();

      formData.append("file", file);

      const data = await request(
        "/api/upload/",
        {
          method: "POST",
          body: formData,
        }
      );

      const uploadedCandidate =
        data?.candidate || data;

      if (!uploadedCandidate) {
        throw new Error(
          "Resume uploaded, but candidate information was not returned."
        );
      }

      setCandidate(uploadedCandidate);

      setSuccess(
        data?.message ||
          "Resume uploaded and candidate created successfully."
      );

      setFile(null);
    } catch (err) {
      console.error("Resume upload error:", err);

      setError(
        err?.message ||
          "Unable to upload resume. Please try again."
      );
    } finally {
      setUploading(false);
    }
  }

  // --------------------------------------------------
  // AI MATCHING
  // --------------------------------------------------

  async function analyzeMatch() {
    if (!candidate?.id) {
      setError("Please upload a resume first.");
      return;
    }

    if (!selectedJob) {
      setError("Please select a job first.");
      return;
    }

    try {
      setMatching(true);
      setError("");
      setSuccess("");

      const result = await matchCandidate(
        candidate.id,
        selectedJob
      );

      setMatchResult(result);

      setCandidate((previous) => ({
        ...previous,
        ats_score:
          result?.match_score ??
          previous?.ats_score ??
          0,
      }));

      setSuccess(
        "AI matching completed successfully."
      );
    } catch (err) {
      console.error("AI matching error:", err);

      setError(
        err?.message ||
          "Unable to analyze candidate match."
      );
    } finally {
      setMatching(false);
    }
  }

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="space-y-8">

      {/* -------------------------------------------- */}
      {/* UPLOAD AREA */}
      {/* -------------------------------------------- */}

      <div
        {...getRootProps()}
        className={`
          rounded-3xl
          border-2
          border-dashed
          p-8
          text-center
          transition-all
          sm:p-12
          lg:p-16
          ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40"
          }
        `}
      >
        <input {...getInputProps()} />

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          {isDragActive ? (
            <UploadCloud size={30} />
          ) : (
            <UploadCloud size={30} />
          )}
        </div>

        <h2 className="mt-5 text-2xl font-bold text-slate-900">
          {isDragActive
            ? "Drop your resume here"
            : "Upload a Resume"}
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
          Drag and drop a candidate resume here, or select a
          file from your computer. Supported formats are PDF,
          DOC, and DOCX.
        </p>

        <button
          type="button"
          onClick={open}
          className="
            mt-6
            inline-flex
            items-center
            gap-2
            rounded-xl
            bg-blue-600
            px-6
            py-3
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition
            hover:bg-blue-700
          "
        >
          <UploadCloud size={18} />
          Choose Resume
        </button>

        {/* SELECTED FILE */}

        {file && (
          <div
            className="
              mx-auto
              mt-7
              flex
              max-w-2xl
              items-center
              justify-between
              gap-4
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-4
              text-left
              shadow-sm
            "
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FileText size={21} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {file.name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={removeFile}
              className="
                shrink-0
                rounded-lg
                p-2
                text-slate-400
                transition
                hover:bg-red-50
                hover:text-red-600
              "
              aria-label="Remove selected file"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>

      {/* -------------------------------------------- */}
      {/* UPLOAD BUTTON */}
      {/* -------------------------------------------- */}

      <button
        type="button"
        onClick={uploadResume}
        disabled={!file || uploading}
        className="
          flex
          w-full
          items-center
          justify-center
          gap-2
          rounded-2xl
          bg-blue-600
          px-6
          py-4
          text-sm
          font-bold
          text-white
          shadow-sm
          transition
          hover:bg-blue-700
          disabled:cursor-not-allowed
          disabled:bg-blue-300
        "
      >
        {uploading ? (
          <>
            <Loader2
              size={19}
              className="animate-spin"
            />
            Uploading & Analyzing...
          </>
        ) : (
          <>
            <Sparkles size={19} />
            Upload & Analyze Resume
          </>
        )}
      </button>

      {/* -------------------------------------------- */}
      {/* SUCCESS */}
      {/* -------------------------------------------- */}

      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-5 text-sm text-green-700">
          <CheckCircle2
            size={20}
            className="mt-0.5 shrink-0"
          />

          <p>{success}</p>
        </div>
      )}

      {/* -------------------------------------------- */}
      {/* ERROR */}
      {/* -------------------------------------------- */}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          <XCircle
            size={20}
            className="mt-0.5 shrink-0"
          />

          <p>{error}</p>
        </div>
      )}

      {/* -------------------------------------------- */}
      {/* CANDIDATE PROFILE */}
      {/* -------------------------------------------- */}

      {candidate && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">

          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">

            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <User size={20} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Candidate Profile
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Extracted from the uploaded resume
                  </p>
                </div>
              </div>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
              <CheckCircle2 size={16} />
              {candidate.status || "Processed"}
            </span>
          </div>

          {/* CANDIDATE DETAILS */}

          <div className="mt-7 grid gap-4 md:grid-cols-2">

            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <User
                  size={19}
                  className="text-blue-600"
                />

                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Name
                  </p>

                  <p className="mt-1 truncate font-semibold text-slate-900">
                    {candidate.name || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <Mail
                  size={19}
                  className="text-blue-600"
                />

                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Email
                  </p>

                  <p className="mt-1 truncate font-semibold text-slate-900">
                    {candidate.email || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <Phone
                  size={19}
                  className="text-blue-600"
                />

                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Phone
                  </p>

                  <p className="mt-1 truncate font-semibold text-slate-900">
                    {candidate.phone || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-blue-50 p-5">
              <div className="flex items-center gap-3">
                <Target
                  size={19}
                  className="text-blue-600"
                />

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    ATS Score
                  </p>

                  <p className="mt-1 text-3xl font-bold text-blue-600">
                    {candidate.ats_score || 0}%
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* JOB MATCHING */}

          <div className="mt-8 border-t border-slate-100 pt-8">

            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <BriefcaseBusiness size={19} />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Match Candidate to a Job
                </h3>

                <p className="text-sm text-slate-500">
                  Compare this candidate against a job description.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row">

              <select
                value={selectedJob}
                onChange={(event) => {
                  setSelectedJob(event.target.value);
                  setMatchResult(null);
                  setError("");
                }}
                disabled={loadingJobs || matching}
                className="
                  h-12
                  flex-1
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
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
                        {job.company
                          ? ` — ${job.company}`
                          : ""}
                      </option>
                    ))}
                  </>
                )}
              </select>

              <button
                type="button"
                onClick={analyzeMatch}
                disabled={
                  !selectedJob ||
                  matching ||
                  loadingJobs
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
                {matching ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Analyze Match
                  </>
                )}
              </button>

            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------- */}
      {/* MATCH RESULT */}
      {/* -------------------------------------------- */}

      {matchResult && (
        <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6 lg:p-8">

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Target size={21} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                ATS Match Result
              </h2>

              <p className="text-sm text-slate-500">
                AI compatibility analysis for the selected position.
              </p>
            </div>
          </div>

          <div className="mt-7 rounded-2xl bg-white p-6 shadow-sm">

            <div className="text-center">

              <p className="text-sm font-medium text-slate-500">
                Match Score
              </p>

              <p className="mt-2 text-6xl font-bold text-blue-600">
                {matchResult.match_score || 0}%
              </p>

            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">

              <div>
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
                  <CheckCircle2
                    size={18}
                    className="text-green-600"
                  />
                  Matched Skills
                </h3>

                {matchResult.matched_skills?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {matchResult.matched_skills.map(
                      (skill, index) => (
                        <span
                          key={`${skill}-${index}`}
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

              <div>
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
                  <XCircle
                    size={18}
                    className="text-red-500"
                  />
                  Missing Skills
                </h3>

                {matchResult.missing_skills?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {matchResult.missing_skills.map(
                      (skill, index) => (
                        <span
                          key={`${skill}-${index}`}
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
          </div>
        </div>
      )}
    </div>
  );
}
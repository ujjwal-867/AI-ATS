"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  UploadCloud,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  User,
  Mail,
  Phone,
  BadgeCheck,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

export default function UploadZone() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [candidate, setCandidate] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onDrop = useCallback((acceptedFiles) => {
    if (!acceptedFiles.length) return;

    setFile(acceptedFiles[0]);
    setCandidate(null);
    setMessage("");
    setError("");
  }, []);

  const handleUpload = async () => {
    if (!file) {
      setError("Please choose a resume first.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setMessage("");
      setCandidate(null);

      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${API_URL}/api/upload/`,
        {
          method: "POST",
          headers: {
            ...(token && {
              Authorization: `Bearer ${token}`,
            }),
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Upload failed."
        );
      }

      setCandidate(data.candidate);
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
  });

  return (
    <div className="space-y-8">

      {/* Drop Zone */}

      <div
        {...getRootProps()}
        className={`rounded-3xl border-2 border-dashed p-16 transition cursor-pointer
        ${
          isDragActive
            ? "border-green-500 bg-green-50"
            : "border-yellow-300 bg-yellow-50 hover:border-[#D4AF37]"
        }`}
      >
        <input {...getInputProps()} />

        <UploadCloud
          className="mx-auto mb-6 text-[#D4AF37]"
          size={70}
        />

        <h2 className="text-4xl font-bold text-slate-900">
          Drag & Drop Resume
        </h2>

        <p className="mt-3 text-lg text-slate-600">
          PDF, DOC or DOCX
        </p>

        <button
          type="button"
          className="mt-8 rounded-xl bg-[#D4AF37] px-8 py-3 font-semibold text-black"
        >
          Choose Resume
        </button>

        {file && (
          <div className="mt-10 rounded-2xl border bg-white p-5">

            <div className="flex items-center gap-4">

              <FileText
                className="text-[#D4AF37]"
                size={32}
              />

              <div>

                <p className="font-semibold">
                  {file.name}
                </p>

                <p className="text-sm text-slate-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>

              </div>

            </div>

          </div>
        )}
      </div>

      {/* Upload Button */}

      <button
        onClick={handleUpload}
        disabled={uploading || !file}
        className="w-full rounded-2xl bg-green-600 py-4 text-lg font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploading ? (
          <span className="flex items-center justify-center gap-3">
            <Loader2
              className="animate-spin"
              size={22}
            />
            Uploading Resume...
          </span>
        ) : (
          "Upload & Analyze Resume"
        )}
      </button>

      {/* Success */}

      {message && (
        <div className="rounded-2xl border border-green-300 bg-green-50 p-5">

          <div className="flex items-center gap-3 text-green-700">

            <CheckCircle2 />

            <span className="font-semibold">
              {message}
            </span>

          </div>

        </div>
      )}

      {/* Error */}

      {error && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-5">

          <div className="flex items-center gap-3 text-red-600">

            <XCircle />

            <span>{error}</span>

          </div>

        </div>
      )}

      {/* Candidate */}

      {candidate && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

          <h2 className="mb-8 text-2xl font-bold text-slate-900">
            Candidate Details
          </h2>

          <div className="grid gap-6 md:grid-cols-2">

            <div className="flex items-center gap-3">

              <User className="text-[#D4AF37]" />

              <div>

                <p className="text-sm text-slate-500">
                  Name
                </p>

                <p className="font-semibold">
                  {candidate.name}
                </p>

              </div>

            </div>

            <div className="flex items-center gap-3">

              <Mail className="text-[#D4AF37]" />

              <div>

                <p className="text-sm text-slate-500">
                  Email
                </p>

                <p className="font-semibold">
                  {candidate.email}
                </p>

              </div>

            </div>

            <div className="flex items-center gap-3">

              <Phone className="text-[#D4AF37]" />

              <div>

                <p className="text-sm text-slate-500">
                  Phone
                </p>

                <p className="font-semibold">
                  {candidate.phone || "-"}
                </p>

              </div>

            </div>

            <div className="flex items-center gap-3">

              <BadgeCheck className="text-green-600" />

              <div>

                <p className="text-sm text-slate-500">
                  Status
                </p>

                <p className="font-semibold text-green-600">
                  {candidate.status}
                </p>

              </div>

            </div>

            <div>

              <p className="text-sm text-slate-500">
                ATS Score
              </p>

              <p className="mt-1 text-3xl font-bold text-green-600">
                {candidate.ats_score}%
              </p>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
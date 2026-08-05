"use client";

export default function JDInput({
  jobDescription,
  setJobDescription,
}) {
  return (
    <textarea
      rows={8}
      value={jobDescription}
      onChange={(e) =>
        setJobDescription(e.target.value)
      }
      placeholder="Paste Job Description..."
      className="w-full rounded-2xl border border-slate-700 bg-slate-900 p-5 text-white outline-none"
    />
  );
}
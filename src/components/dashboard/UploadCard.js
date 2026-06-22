"use client";

import { useState } from "react";

export default function UploadCard() {
  const [file, setFile] = useState(null);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
      <h1 className="mb-6 text-3xl font-bold text-white">
        Upload Resume
      </h1>

      <div className="rounded-xl border-2 border-dashed border-slate-700 p-10 text-center">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          className="text-slate-300"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <p className="mt-4 text-slate-400">
          Upload PDF or DOCX Resume
        </p>

        {file && (
          <div className="mt-4 text-green-400">
            Selected: {file.name}
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

export default function UploadZone() {
  const [file, setFile] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    console.log("Dropped:", acceptedFiles);

    if (acceptedFiles.length === 0) return;

    const selectedFile = acceptedFiles[0];

    setFile(selectedFile);

    try {
      // Create fresh FormData for parse-docx request
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/parse-docx", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      console.log(
        "========= CANDIDATE ========="
      );

      console.log(data.candidate);

      console.log(
        "============================="
      );
    } catch (error) {
      console.error(error);
    }
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className="cursor-pointer rounded-3xl border-2 border-dashed border-slate-700 bg-slate-900 p-20 text-center text-white"
    >
      <input {...getInputProps()} />

      {isDragActive ? (
        <p className="text-xl">
          Drop your resume here...
        </p>
      ) : (
        <>
          <h2 className="text-2xl font-bold">
            Drag & Drop Resume
          </h2>

          <p className="mt-3 text-slate-400">
            PDF and DOCX files supported
          </p>

          {file && (
            <div className="mt-6 rounded-xl bg-slate-800 p-4 text-green-400">
              Selected: {file.name}
            </div>
          )}
        </>
      )}
    </div>
  );
}
"use client";

import AppLayout from "@/components/layout/AppLayout";
import DashboardHeader from "@/components/dashboard/header/DashboardHeader";
import UploadZone from "@/components/upload/UploadZone";

export default function UploadPage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-[1700px] space-y-8">

        {/* HEADER */}

        <DashboardHeader />

        {/* UPLOAD CARD */}

        <section
          className="
            overflow-hidden
            rounded-3xl
            border
            border-slate-200
            bg-white
            shadow-sm
          "
        >
          {/* SECTION HEADER */}

          <div
            className="
              border-b
              border-slate-100
              px-8
              py-8
              lg:px-10
            "
          >
            <div className="flex items-start gap-4">

              <div
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-blue-50
                  text-blue-600
                "
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 16V4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M7 9L12 4L17 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M5 20H19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">
                  Resume Management
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
                  Resume Upload
                </h1>

                <p className="mt-3 max-w-3xl text-base leading-7 text-slate-500 lg:text-lg">
                  Upload resumes in PDF or DOCX format. Our AI extracts
                  candidate information, analyzes skills, generates ATS
                  scores, and adds candidates to your recruitment pipeline.
                </p>
              </div>
            </div>
          </div>

          {/* UPLOAD AREA */}

          <div className="p-6 lg:p-10">
            <UploadZone />
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
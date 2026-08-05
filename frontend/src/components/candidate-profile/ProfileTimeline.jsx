"use client";

import {
  GraduationCap,
  Briefcase,
  FolderGit2,
} from "lucide-react";

export default function ProfileTimeline({ candidate }) {
  if (!candidate) return null;

  const education = candidate.education || [
    "Bachelor of Technology (CSE)"
  ];

  const experience = candidate.experience || [
    "Fresher"
  ];

  const projects = candidate.projects || [
    "No projects available"
  ];

  return (
    <div className="mt-8 space-y-8">
      {/* Education */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-indigo-400" />

          <h3 className="text-lg font-semibold text-white">
            Education
          </h3>
        </div>

        <div className="space-y-3">
          {education.map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-800 bg-slate-950 p-4"
            >
              <p className="text-slate-300">
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-indigo-400" />

          <h3 className="text-lg font-semibold text-white">
            Experience
          </h3>
        </div>

        <div className="space-y-3">
          {experience.map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-800 bg-slate-950 p-4"
            >
              <p className="text-slate-300">
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <FolderGit2 className="h-5 w-5 text-indigo-400" />

          <h3 className="text-lg font-semibold text-white">
            Projects
          </h3>
        </div>

        <div className="space-y-3">
          {projects.map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-800 bg-slate-950 p-4"
            >
              <p className="text-slate-300">
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
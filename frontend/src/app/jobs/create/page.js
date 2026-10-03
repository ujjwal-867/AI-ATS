"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  MapPin,
  Clock,
  Sparkles,
  Plus,
  X,
  Wand2,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import AppLayout from "@/components/layout/AppLayout";
import DashboardHeader from "@/components/dashboard/header/DashboardHeader";
import { createJob } from "@/services/api";
import extractJDskills from "@/lib/extractJDskills";

const POPULAR_SKILLS = [
  "React",
  "Next.js",
  "Node.js",
  "TypeScript",
  "JavaScript",
  "Python",
  "FastAPI",
  "PostgreSQL",
  "MongoDB",
  "Docker",
  "AWS",
  "Git",
  "Tailwind CSS",
  "REST API",
  "GraphQL",
];

export default function CreateJobPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "Remote",
    employment_type: "Full-time",
    experience: "1-3 Years",
    salary: "",
    description: "",
  });

  const [skillsList, setSkillsList] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function addSkill(skillToAdd) {
    const trimmed = (skillToAdd || skillInput).trim();
    if (!trimmed) return;

    // Check for duplicates case-insensitively
    const exists = skillsList.some(
      (s) => s.toLowerCase() === trimmed.toLowerCase()
    );

    if (exists) {
      toast.info(`"${trimmed}" is already added.`);
      setSkillInput("");
      return;
    }

    setSkillsList((prev) => [...prev, trimmed]);
    setSkillInput("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  }

  function removeSkill(skillToRemove) {
    setSkillsList((prev) =>
      prev.filter((s) => s.toLowerCase() !== skillToRemove.toLowerCase())
    );
  }

  function handleAutoExtract() {
    const textToScan = `${form.title} ${form.description}`.trim();
    if (!textToScan) {
      toast.error(
        "Please enter a Job Title or Job Description first to auto-extract skills."
      );
      return;
    }

    const detected = extractJDskills(textToScan);
    if (!detected.length) {
      toast.info(
        "No standard skills detected in the current description. You can add them manually below."
      );
      return;
    }

    // Merge without duplicates
    const currentLower = new Set(skillsList.map((s) => s.toLowerCase()));
    const newSkills = detected.filter(
      (s) => !currentLower.has(s.toLowerCase())
    );

    if (newSkills.length === 0) {
      toast.info("All detected skills are already in your list.");
      return;
    }

    setSkillsList((prev) => [...prev, ...newSkills]);
    toast.success(
      `Extracted ${newSkills.length} skill${newSkills.length > 1 ? "s" : ""} from description!`
    );
  }

  async function submit(e) {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Please enter a job title.");
      return;
    }
    if (!form.company.trim()) {
      toast.error("Please enter the company name.");
      return;
    }
    if (!form.description.trim()) {
      toast.error("Please provide a job description.");
      return;
    }

    try {
      setLoading(true);

      // If user hasn't added any skills manually, attempt fallback extraction
      let finalSkills = [...skillsList];
      if (finalSkills.length === 0) {
        finalSkills = extractJDskills(`${form.title} ${form.description}`);
      }

      await createJob({
        title: form.title.trim(),
        company: form.company.trim(),
        location: form.location,
        employment_type: form.employment_type,
        experience: form.experience,
        salary: form.salary.trim(),
        description: form.description.trim(),
        skills: finalSkills,
      });

      toast.success("Job posting created successfully!");
      router.push("/jobs");
    } catch (error) {
      console.error("Job creation error:", error);
      toast.error(error?.message || "Failed to create job position.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-8 pb-12">
        <DashboardHeader />

        {/* Back Link */}
        <div>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft size={16} />
            Back to Positions
          </Link>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm">
          <div className="border-b border-slate-100 pb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 mb-3">
              <BriefcaseBusiness size={14} />
              New Recruitment Position
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Create Job Posting
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Define the position details and required technical competencies
              used by the AI matching engine to evaluate candidate fit.
            </p>
          </div>

          <form onSubmit={submit} className="mt-8 space-y-8">
            {/* =========================================================
                BASIC DETAILS
            ========================================================== */}
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-slate-900">
                Position Overview
              </h2>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="company"
                    required
                    value={form.company}
                    onChange={handleChange}
                    placeholder="e.g. Acme Corporation"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. Remote / New York"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    Employment Type
                  </label>
                  <select
                    name="employment_type"
                    value={form.employment_type}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    Experience Level
                  </label>
                  <select
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Fresher / 0-1 Years">Fresher / 0-1 Years</option>
                    <option value="1-3 Years">1-3 Years</option>
                    <option value="3-5 Years">3-5 Years</option>
                    <option value="5+ Years">5+ Years</option>
                  </select>
                </div>
              </div>
            </div>

            {/* =========================================================
                JOB DESCRIPTION
            ========================================================== */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Job Description & Requirements *
              </label>
              <p className="text-xs text-slate-500">
                Paste the full responsibilities, requirements, and role expectations.
              </p>
              <textarea
                name="description"
                required
                rows={7}
                value={form.description}
                onChange={handleChange}
                placeholder="Enter detailed role overview, daily responsibilities, qualifications, and tech stack expectations..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm leading-relaxed text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* =========================================================
                DEDICATED SKILLS & COMPETENCIES SECTION
            ========================================================== */}
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/60 to-white p-6 sm:p-7 space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-blue-600" size={18} />
                    <h2 className="text-base font-bold text-slate-900">
                      Required Skills & Competencies
                    </h2>
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                      {skillsList.length} specified
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    The AI matching engine compares candidate resumes against these exact skills to calculate ATS scores, matched skills, and missing skill gaps.
                  </p>
                </div>

                {/* Auto-Extract Button */}
                <button
                  type="button"
                  onClick={handleAutoExtract}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-xs font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 hover:border-blue-300 active:scale-95"
                >
                  <Wand2 size={14} className="text-blue-600" />
                  Auto-Extract from Description
                </button>
              </div>

              {/* Skills Display Area */}
              {skillsList.length > 0 ? (
                <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-3.5 min-h-[56px] items-center">
                  {skillsList.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/80 px-3 py-1.5 text-xs font-medium text-blue-800 transition hover:bg-blue-100"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="rounded-full p-0.5 text-blue-500 hover:bg-blue-200 hover:text-blue-900"
                        title="Remove skill"
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4 text-xs text-slate-500">
                  <AlertCircle size={16} className="text-amber-500 shrink-0" />
                  <span>
                    No skills added yet. Add skills below or click <strong>Auto-Extract from Description</strong> to auto-fill them.
                  </span>
                </div>
              )}

              {/* Add Custom Skill Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a skill (e.g. Next.js, FastAPI, Docker) and press Enter..."
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => addSkill()}
                  disabled={!skillInput.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-40"
                >
                  <Plus size={15} />
                  Add Skill
                </button>
              </div>

              {/* Popular Suggestions */}
              <div className="pt-2">
                <p className="text-xs font-medium text-slate-500 mb-2">
                  Quick add popular skills:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SKILLS.map((skill) => {
                    const isSelected = skillsList.some(
                      (s) => s.toLowerCase() === skill.toLowerCase()
                    );
                    return (
                      <button
                        key={skill}
                        type="button"
                        disabled={isSelected}
                        onClick={() => addSkill(skill)}
                        className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                          isSelected
                            ? "bg-slate-100 text-slate-400 cursor-default"
                            : "bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        {isSelected ? `✓ ${skill}` : `+ ${skill}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* =========================================================
                SUBMIT
            ========================================================== */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Link
                href="/jobs"
                className="rounded-xl px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating Position...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Create Position
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
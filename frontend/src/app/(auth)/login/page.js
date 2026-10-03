"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Eye,
  EyeOff,
  FileSearch,
  GitBranch,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { loginSchema } from "@/lib/validations/login-schema";
import { useAuth } from "@/hooks/useAuth";
import request from "@/services/api";


export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [authMode, setAuthMode] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    register: registerAccount,
    handleSubmit: handleRegisterSubmit,
    reset: resetRegister,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });


  function openLogin() {
    setAuthMode("login");
  }


  function openRegister() {
    setAuthMode("register");
  }


  function closeAuth() {
    setAuthMode(null);
    setShowPassword(false);
    setShowRegisterPassword(false);
    reset();
    resetRegister();
  }


  async function onLogin(data) {
    try {
      await login(data);

      toast.success("Login successful!");

      window.location.href = "/dashboard";
    } catch (error) {
      toast.error(error?.message || "Login failed");
    }
  }


  async function onRegister(data) {
    if (data.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    try {
      setRegisterLoading(true);

      await request("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      toast.success("Account created successfully!");

      resetRegister();
      setAuthMode("login");
    } catch (error) {
      toast.error(error?.message || "Registration failed");
    } finally {
      setRegisterLoading(false);
    }
  }


  return (
    <main className="min-h-screen bg-slate-50">

      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-7 sm:px-8 lg:px-10">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <header className="flex items-center justify-between">

          <Link
            href="/login"
            className="flex items-center gap-3"
          >

            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-600/20">

              <Sparkles
                size={22}
                className="text-white"
              />

              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-slate-50 bg-[#D4AF37]" />

            </div>


            <div>

              <div className="text-lg font-bold tracking-tight text-slate-900">
                AI ATS
              </div>

              <div className="text-[9px] font-semibold tracking-[0.3em] text-blue-600">
                ENTERPRISE
              </div>

            </div>

          </Link>


          {/* AUTH BUTTONS */}

          <div className="flex items-center gap-2 sm:gap-3">

            <button
              type="button"
              onClick={openLogin}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              Sign in
            </button>


            <button
              type="button"
              onClick={openRegister}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
            >
              Create account
            </button>

          </div>

        </header>


        {/* =====================================================
            HERO
        ====================================================== */}

        <section className="flex flex-1 flex-col items-center justify-center py-14 text-center">

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700">

            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />

            Intelligent Recruitment Platform

          </div>


          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">

            Hire smarter.

            <span className="block text-blue-600">
              Build better teams.
            </span>

          </h1>


          <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">

            AI ATS helps modern recruitment teams manage candidates,
            screen resumes, match talent with opportunities, manage
            interviews and understand hiring performance from one
            intelligent platform.

          </p>


          {/* HERO BUTTONS */}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">

            <button
              type="button"
              onClick={openLogin}
              className="flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-7 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
            >
              Sign in

              <ArrowRight size={17} />

            </button>


            <button
              type="button"
              onClick={openRegister}
              className="flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-7 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              Create an account
            </button>

          </div>


          {/* =================================================
              FEATURES
          ================================================== */}

          <div className="mt-14 grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <FeatureCard
              icon={<FileSearch size={20} />}
              title="Resume Screening"
              description="Extract and organize candidate information quickly."
            />

            <FeatureCard
              icon={<Users size={20} />}
              title="AI Matching"
              description="Match candidates against job requirements."
            />

            <FeatureCard
              icon={<GitBranch size={20} />}
              title="Hiring Pipeline"
              description="Track candidates through every recruitment stage."
            />

            <FeatureCard
              icon={<BarChart3 size={20} />}
              title="Recruitment Analytics"
              description="Understand hiring performance with useful insights."
            />

          </div>


          {/* =================================================
              WORKFLOW
          ================================================== */}

          <div className="mt-12 w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6 text-center">

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                Recruitment Workflow
              </p>

              <h2 className="mt-2 text-xl font-bold text-slate-900">
                From resume to hiring decision
              </h2>

            </div>


            <div className="grid grid-cols-2 gap-5 md:grid-cols-5">

              <WorkflowStep
                number="01"
                title="Upload"
              />

              <WorkflowStep
                number="02"
                title="Screen"
              />

              <WorkflowStep
                number="03"
                title="Match"
              />

              <WorkflowStep
                number="04"
                title="Interview"
              />

              <WorkflowStep
                number="05"
                title="Hire"
              />

            </div>

          </div>


          {/* =================================================
              STATS
          ================================================== */}

          <div className="mt-10 grid w-full max-w-3xl grid-cols-3 divide-x divide-slate-200 rounded-xl border border-slate-200 bg-white px-4 py-5 shadow-sm">

            <Stat
              value="AI"
              label="Candidate Matching"
            />

            <Stat
              value="360°"
              label="Hiring Visibility"
            />

            <Stat
              value="24/7"
              label="Workflow Access"
            />

          </div>

        </section>


        {/* =====================================================
            FOOTER
        ====================================================== */}

        <footer className="flex flex-col items-center justify-between gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row">

          <span>
            © {new Date().getFullYear()} AI ATS
          </span>

          <span className="flex items-center gap-1.5">

            <ShieldCheck
              size={14}
              className="text-emerald-500"
            />

            Secure enterprise recruitment platform

          </span>

        </footer>

      </div>


      {/* =======================================================
          AUTH MODAL
      ======================================================== */}

      {authMode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAuth();
            }
          }}
        >

          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">

            {/* CLOSE */}

            <button
              type="button"
              onClick={closeAuth}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close"
            >
              <X size={19} />
            </button>


            {/* MODAL HEADER */}

            <div className="border-b border-slate-100 px-7 py-7">

              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">

                {authMode === "login" ? (
                  <ShieldCheck size={20} />
                ) : (
                  <Users size={20} />
                )}

              </div>


              <h2 className="text-2xl font-bold text-slate-900">

                {authMode === "login"
                  ? "Welcome back"
                  : "Create your account"}

              </h2>


              <p className="mt-2 pr-8 text-sm leading-6 text-slate-500">

                {authMode === "login"
                  ? "Sign in to continue managing your recruitment workflow."
                  : "Create your AI ATS account and start managing your hiring workflow."}

              </p>

            </div>


            {/* =================================================
                LOGIN
            ================================================== */}

            {authMode === "login" && (
              <form
                onSubmit={handleSubmit(onLogin)}
                className="space-y-5 px-7 py-7"
              >

                <div>

                  <label
                    htmlFor="login-email"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Email address
                  </label>

                  <input
                    id="login-email"
                    type="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    {...register("email")}
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
                  />

                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.email.message}
                    </p>
                  )}

                </div>


                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label
                      htmlFor="login-password"
                      className="text-sm font-medium text-slate-700"
                    >
                      Password
                    </label>

                    <button
                      type="button"
                      className="text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      Forgot password?
                    </button>

                  </div>


                  <div className="relative">

                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      {...register("password")}
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 pr-11 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
                    />


                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-slate-400 hover:text-slate-700"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >

                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}

                    </button>

                  </div>


                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.password.message}
                    </p>
                  )}

                </div>


                <label className="flex items-center gap-2">

                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-blue-600"
                  />

                  <span className="text-sm text-slate-500">
                    Remember me
                  </span>

                </label>


                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >

                  {isSubmitting
                    ? "Signing in..."
                    : "Sign in"}

                  {!isSubmitting && (
                    <ArrowRight size={17} />
                  )}

                </button>


                <div className="flex items-center gap-3">

                  <div className="h-px flex-1 bg-slate-200" />

                  <span className="text-xs text-slate-400">
                    New to AI ATS?
                  </span>

                  <div className="h-px flex-1 bg-slate-200" />

                </div>


                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setAuthMode("register");
                  }}
                  className="h-11 w-full rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  Create an account
                </button>

              </form>
            )}


            {/* =================================================
                REGISTER
            ================================================== */}

            {authMode === "register" && (
              <form
                onSubmit={handleRegisterSubmit(onRegister)}
                className="space-y-5 px-7 py-7"
              >

                <div>

                  <label
                    htmlFor="register-name"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Full name
                  </label>

                  <input
                    id="register-name"
                    type="text"
                    placeholder="Enter your full name"
                    autoComplete="name"
                    {...registerAccount("name", {
                      required: "Name is required",
                    })}
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
                  />

                </div>


                <div>

                  <label
                    htmlFor="register-email"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Email address
                  </label>

                  <input
                    id="register-email"
                    type="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    {...registerAccount("email", {
                      required: "Email is required",
                    })}
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
                  />

                </div>


                <div>

                  <label
                    htmlFor="register-password"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>


                  <div className="relative">

                    <input
                      id="register-password"
                      type={
                        showRegisterPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Create a password"
                      autoComplete="new-password"
                      {...registerAccount("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message:
                            "Password must be at least 6 characters",
                        },
                      })}
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 pr-11 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
                    />


                    <button
                      type="button"
                      onClick={() =>
                        setShowRegisterPassword(
                          !showRegisterPassword
                        )
                      }
                      className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-slate-400 hover:text-slate-700"
                    >

                      {showRegisterPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}

                    </button>

                  </div>

                </div>


                <button
                  type="submit"
                  disabled={registerLoading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >

                  {registerLoading
                    ? "Creating account..."
                    : "Create account"}

                  {!registerLoading && (
                    <ArrowRight size={17} />
                  )}

                </button>


                <div className="flex items-center gap-3">

                  <div className="h-px flex-1 bg-slate-200" />

                  <span className="text-xs text-slate-400">
                    Already have an account?
                  </span>

                  <div className="h-px flex-1 bg-slate-200" />

                </div>


                <button
                  type="button"
                  onClick={() => {
                    resetRegister();
                    setAuthMode("login");
                  }}
                  className="h-11 w-full rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  Sign in
                </button>

              </form>
            )}

          </div>

        </div>
      )}

    </main>
  );
}


/* =============================================================
   FEATURE CARD
============================================================= */

function FeatureCard({
  icon,
  title,
  description,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">

      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        {icon}
      </div>

      <h3 className="text-sm font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-1.5 text-xs leading-5 text-slate-500">
        {description}
      </p>

    </div>
  );
}


/* =============================================================
   WORKFLOW STEP
============================================================= */

function WorkflowStep({
  number,
  title,
}) {
  return (
    <div className="text-center">

      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
        {number}
      </div>

      <div className="mt-2 text-sm font-semibold text-slate-700">
        {title}
      </div>

    </div>
  );
}


/* =============================================================
   STAT
============================================================= */

function Stat({
  value,
  label,
}) {
  return (
    <div className="px-3 text-center">

      <div className="text-lg font-bold text-slate-900">
        {value}
      </div>

      <div className="mt-1 text-[11px] text-slate-400">
        {label}
      </div>

    </div>
  );
}
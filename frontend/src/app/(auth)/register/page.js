"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { register as registerUser } from "@/services/auth.service";
import { validateEmail } from "@/lib/emailValidator";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const emailValidation = useMemo(() => {
    if (!formData.email || !formData.email.trim()) return null;
    return validateEmail(formData.email);
  }, [formData.email]);

  function applyEmailSuggestion() {
    if (emailValidation?.suggestion) {
      setFormData((prev) => ({
        ...prev,
        email: emailValidation.suggestion,
      }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (emailValidation && !emailValidation.isValid) {
      toast.error(emailValidation.reason || "Please provide a valid email.");
      return;
    }

    try {
      setLoading(true);

      const normalizedEmail = (
        emailValidation?.email || formData.email
      ).trim().toLowerCase();

      await registerUser({
        ...formData,
        email: normalizedEmail,
      });

      toast.success("Account created successfully!");

      router.push("/login");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-4">
      <Card className="w-full max-w-md border-white/10 bg-white/10 shadow-2xl backdrop-blur-md">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-3xl shadow-lg">
            🚀
          </div>

          <CardTitle className="text-4xl text-white">
            Create Account
          </CardTitle>

          <CardDescription className="text-slate-300">
            Join AI ATS Platform
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label className="text-white">
                Full Name
              </Label>

              <Input
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">
                Email
              </Label>

              <Input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  })
                }
              />

              {emailValidation && !emailValidation.isValid && (
                <p className="flex items-center gap-1.5 text-xs text-rose-300 font-medium">
                  <AlertCircle size={14} className="shrink-0" />
                  {emailValidation.reason}
                </p>
              )}

              {emailValidation?.suggestion && (
                <div className="flex items-center justify-between rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-xs text-amber-200">
                  <span>
                    Did you mean <strong>{emailValidation.suggestion}</strong>?
                  </span>
                  <button
                    type="button"
                    onClick={applyEmailSuggestion}
                    className="ml-2 font-bold text-amber-400 underline hover:text-amber-300"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-white">
                Password
              </Label>

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-indigo-600 py-2 text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading
                ? "Creating..."
                : "Create Account"}
            </button>

            <p className="text-center text-sm text-slate-300">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-indigo-400 hover:underline"
              >
                Sign In
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
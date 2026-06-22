"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

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

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch(
        "/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Account created successfully!");

      router.push("/login");
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-4">
      <Card className="w-full max-w-md border-white/10 bg-white/10 backdrop-blur-md shadow-2xl">
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
            className="space-y-5"
            onSubmit={handleSubmit}
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
            </div>

            <div className="space-y-2">
              <Label className="text-white">
                Password
              </Label>

              <div className="relative">
                <Input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
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
              className="w-full rounded-md bg-indigo-600 py-2 text-white hover:bg-indigo-700"
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
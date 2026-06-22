"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-4">
      <Card className="w-full max-w-md border-white/10 bg-white/10 backdrop-blur-md shadow-2xl">
        <CardHeader>
          <CardTitle className="text-4xl text-white">
            Forgot Password
          </CardTitle>

          <CardDescription className="text-slate-300">
            Enter your email to reset your password
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label className="text-white">
              Email
            </Label>

            <Input
              type="email"
              placeholder="Enter your email"
            />
          </div>

          <button
            className="w-full rounded-md bg-indigo-600 py-2 text-white hover:bg-indigo-700"
          >
            Send Reset Link
          </button>

          <p className="text-center text-sm text-slate-300">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-indigo-400 hover:underline"
            >
              Sign In
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
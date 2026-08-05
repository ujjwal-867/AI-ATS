"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import {
  LayoutDashboard,
  Users,
  Upload,
  Briefcase,
  BarChart3,
  CalendarDays,
  Settings,
  Sparkles,
  ChevronLeft,
  HardDrive,
  Bell,
  ShieldCheck,
} from "lucide-react";

const menu = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Candidates",
    href: "/candidates",
    icon: Users,
  },
  {
    title: "Jobs",
    href: "/jobs",
    icon: Briefcase,
  },
  {
    title: "Resume Upload",
    href: "/upload",
    icon: Upload,
  },
  {
    title: "AI Matching",
    href: "/match",
    icon: Sparkles,
  },
  {
    title: "Interviews",
    href: "/interviews",
    icon: CalendarDays,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
   <aside className="sticky top-0 flex h-screen w-72 flex-col border-r border-[#E5E7EB] bg-white">

      {/* Logo */}

      <div className="border-b border-[#E5E7EB] px-7 py-7">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D4AF37] shadow-xl shadow-[#D4AF37]/20">

              <Sparkles className="h-7 w-7 text-black" />

            </div>

            <div>

              <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
                AI ATS
              </h1>

              <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
                Enterprise
              </p>

            </div>

          </div>

          <button className="rounded-xl border border-[#E5E7EB] p-2 text-[#B6B8BF] transition hover:border-[#D4AF37] hover:text-[#D4AF37]">

            <ChevronLeft className="h-4 w-4" />

          </button>

        </div>

      </div>

      {/* Navigation */}

      <nav className="flex-1 space-y-2 overflow-y-auto px-5 py-6">

        {menu.map((item, index) => {

          const Icon = item.icon;

          const active =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");

          return (

            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: index * 0.05,
              }}
            >

              <Link
                href={item.href}
                className={`group flex items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-300 ${
                  active
                   ? "bg-gradient-to-r from-[#D4AF37] to-[#E8C45A] text-[#111827] shadow-lg" 
                    : "text-[#475569] hover:bg-[#FFF8E1] hover:text-[#D4AF37]"
                }`}
              >

                <Icon
                  className={`h-5 w-5 ${
                    active
                      ? "text-black"
                      : "text-slate-500 group-hover:text-[#D4AF37]"
                  }`}
                />

                <span className="font-semibold">
                  {item.title}
                </span>

                {active && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-black" />
                )}

              </Link>

            </motion.div>

          );

        })}

      </nav>
            {/* Quick Stats */}

      <div className="mx-5 mb-5 rounded-3xl border border-[#E5E7EB] bg-white p-5">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-[#D4AF37]/10 p-3">

            <HardDrive className="h-5 w-5 text-[#D4AF37]" />

          </div>

          <div>

            <h3 className="font-semibold text-[#111827]">
              Resume Storage
            </h3>

            <p className="text-sm text-[#9CA3AF]">
              7.8 GB of 10 GB
            </p>

          </div>

        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200">

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "78%" }}
            transition={{ duration: 1 }}
            className="h-full rounded-full bg-[#D4AF37]"
          />

        </div>

        <div className="mt-4 flex items-center justify-between">

          <span className="text-xs text-[#8B8D93]">
            Database Usage
          </span>

          <span className="text-xs font-semibold text-[#D4AF37]">
            78%
          </span>

        </div>

      </div>

      {/* Recruiter Card */}

      <div className="border-t border-[#E5E7EB] p-5">

        <div className="rounded-3xl border border-[#E5E7EB] bg-[#FAFAFA] p-5 shadow-sm">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D4AF37] text-xl font-bold text-black">
              U
            </div>

            <div className="flex-1">

              <h3 className="font-semibold text-[#111827]">
                Ujjwal Gupta
              </h3>

              <p className="text-sm text-[#9CA3AF]">
                HR Administrator
              </p>

            </div>

          </div>

          <div className="mt-6 space-y-3">

            <div className="flex items-center justify-between rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3">

              <div className="flex items-center gap-3">

                <Bell
                  size={18}
                  className="text-[#D4AF37]"
                />

                <span className="text-sm text-[#111827]">
                  Notifications
                </span>

              </div>

              <span className="rounded-full bg-[#D4AF37] px-2 py-1 text-xs font-bold text-black">
                5
              </span>

            </div>

            <div className="flex items-center justify-between rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3">

              <div className="flex items-center gap-3">

                <ShieldCheck
                  size={18}
                  className="text-[#D4AF37]"
                />

                <span className="text-sm text-[#111827]">
                  Enterprise
                </span>

              </div>

              <span className="text-xs font-semibold text-[#D4AF37]">
                PRO
              </span>

            </div>

          </div>

          <button className="mt-6 w-full rounded-2xl bg-[#D4AF37] py-3 text-sm font-bold text-black transition-all duration-200 hover:translate-x-1 hover:bg-[#E7C75F]">
            View Profile
          </button>

        </div>

      </div>

    </aside>
  );
}
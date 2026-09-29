"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  BriefcaseBusiness,
  Upload,
  Sparkles,
  CalendarDays,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Database,
  GitBranch,
} from "lucide-react";

import { getCurrentUser } from "@/services/auth.service";

const menuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Candidates",
    href: "/candidates",
    icon: Users,
  },
  {
    label: "Jobs",
    href: "/jobs",
    icon: BriefcaseBusiness,
  },
  {
    label: "Resume Upload",
    href: "/upload",
    icon: Upload,
  },
  {
    label: "AI Matching",
    href: "/match",
    icon: Sparkles,
  },
  {
    label: "Pipeline",
    href: "/pipeline",
    icon: GitBranch,
  },
  {
    label: "Interviews",
    href: "/interviews",
    icon: CalendarDays,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    const savedState =
      localStorage.getItem("ai-ats-sidebar-collapsed");

    if (savedState !== null) {
      setCollapsed(savedState === "true");
    }
  }, []);

  function toggleSidebar() {
    setCollapsed((previous) => {
      const next = !previous;

      localStorage.setItem(
        "ai-ats-sidebar-collapsed",
        String(next)
      );

      return next;
    });
  }

  return (
    <motion.aside
      animate={{
        width: collapsed ? 84 : 312,
      }}
      transition={{
        duration: 0.25,
        ease: "easeInOut",
      }}
      className="relative flex min-h-screen shrink-0 flex-col border-r border-slate-200 bg-white"
    >
      {/* Logo */}
      <div className="flex h-[105px] items-center border-b border-slate-100 px-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
            <Sparkles size={24} />
          </div>

          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                AI ATS
              </h1>

              <p className="mt-0.5 text-[11px] font-semibold tracking-[0.22em] text-blue-600">
                ENTERPRISE
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse button */}
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label={
          collapsed
            ? "Expand sidebar"
            : "Collapse sidebar"
        }
        className="absolute -right-4 top-[104px] z-20 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-md transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
      >
        {collapsed ? (
          <ChevronRight size={16} />
        ) : (
          <ChevronLeft size={16} />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                } ${
                  collapsed
                    ? "justify-center"
                    : "gap-4"
                }`}
              >
                <Icon
                  size={20}
                  className={`shrink-0 ${
                    isActive
                      ? "text-blue-600"
                      : "text-slate-500 group-hover:text-slate-700"
                  }`}
                />

                {!collapsed && (
                  <span>{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Storage */}
      <div className="border-t border-slate-100 px-4 py-5">
        {!collapsed ? (
          <>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <Database
                  size={18}
                  className="text-blue-600"
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Storage
                </p>

                <p className="text-xs text-slate-500">
                  Storage usage
                </p>
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-0 rounded-full bg-blue-600" />
            </div>
          </>
        ) : (
          <div className="flex justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <Database
                size={18}
                className="text-blue-600"
              />
            </div>
          </div>
        )}
      </div>

      {/* User */}
      <div className="border-t border-slate-100 px-4 py-4">
        <div
          className={`flex items-center ${
            collapsed
              ? "justify-center"
              : "gap-3"
          }`}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
            {user?.name
              ? user.name
                  .charAt(0)
                  .toUpperCase()
              : "U"}
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">
                {user?.name || "User"}
              </p>

              <p className="truncate text-xs text-slate-500">
                {user?.email || ""}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
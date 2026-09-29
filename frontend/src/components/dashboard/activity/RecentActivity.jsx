"use client";

import { useEffect, useState } from "react";

import {
  Upload,
  Sparkles,
  CalendarPlus,
  CheckCircle,
  BriefcaseBusiness,
  Loader2,
  Activity,
} from "lucide-react";

import { getActivity } from "@/services/api";

const icons = {
  upload: Upload,
  ai: Sparkles,
  interview: CalendarPlus,
  hired: CheckCircle,
  job: BriefcaseBusiness,
};

export default function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadActivity() {
      try {
        const data = await getActivity();

        if (!mounted) return;

        const normalized = Array.isArray(data)
          ? data
          : Array.isArray(data?.activities)
            ? data.activities
            : [];

        setActivities(normalized);
      } catch (error) {
        console.error(
          "Activity loading error:",
          error
        );

        if (mounted) {
          setActivities([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadActivity();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* HEADER */}

      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Recent Activity
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Latest recruitment activity
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
          <Activity
            size={19}
            className="text-blue-600"
          />
        </div>
      </div>

      {/* LOADING */}

      {loading && (
        <div className="flex min-h-[180px] items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2
              size={18}
              className="animate-spin text-blue-600"
            />

            Loading activity...
          </div>
        </div>
      )}

      {/* EMPTY */}

      {!loading && activities.length === 0 && (
        <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
            <Activity
              size={19}
              className="text-slate-400"
            />
          </div>

          <p className="text-sm font-semibold text-slate-700">
            No recent activity
          </p>

          <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
            Candidate, interview and job activity will
            appear here automatically.
          </p>
        </div>
      )}

      {/* ACTIVITY LIST */}

      {!loading && activities.length > 0 && (
        <div className="space-y-2">
          {activities.map((item, index) => {
            const Icon =
              icons[item.type] || Activity;

            return (
              <div
                key={
                  item.id ||
                  `${item.title}-${index}`
                }
                className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 transition hover:border-blue-100 hover:bg-blue-50/40"
              >
                {/* ICON */}

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 transition group-hover:bg-blue-100">
                  <Icon
                    size={16}
                    className="text-slate-500 transition group-hover:text-blue-600"
                  />
                </div>

                {/* CONTENT */}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {item.title ||
                      "Activity update"}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {item.time || "Recently"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
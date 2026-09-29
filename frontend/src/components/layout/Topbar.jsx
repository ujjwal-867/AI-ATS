"use client";

import { useEffect, useRef, useState } from "react";

import {
  Bell,
  CheckCircle,
  CalendarDays,
  Sparkles,
  BriefcaseBusiness,
  Info,
  X,
  Loader2,
} from "lucide-react";

import { getNotifications } from "@/services/notification.service";

const icons = {
  interview: CalendarDays,
  ai: Sparkles,
  job: BriefcaseBusiness,
  success: CheckCircle,
  info: Info,
};

export default function Topbar() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const panelRef = useRef(null);

  useEffect(() => {
    // Load authenticated user
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error(
        "User loading error:",
        error
      );
    }

    loadNotifications();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  async function loadNotifications() {
    try {
      setLoading(true);

      const data = await getNotifications();

      const normalized = Array.isArray(data)
        ? data
        : Array.isArray(data?.notifications)
          ? data.notifications
          : [];

      setNotifications(normalized);
    } catch (error) {
      console.error(
        "Notification loading error:",
        error
      );

      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }

  const unreadCount = notifications.filter(
    (item) => !item.read
  ).length;

  const firstName =
    user?.name?.trim()?.split(" ")[0] ||
    "there";

  function getGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Good Morning";
    }

    if (hour < 17) {
      return "Good Afternoon";
    }

    return "Good Evening";
  }

  function markAllRead() {
    setNotifications((current) =>
      current.map((item) => ({
        ...item,
        read: true,
      }))
    );
  }

  function clearNotifications() {
    setNotifications([]);
  }

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          {getGreeting()}, {firstName}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage your recruitment workflow efficiently.
        </p>
      </div>

      <div
        ref={panelRef}
        className="relative"
      >
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          aria-label="Notifications"
        >
          <Bell size={20} />

          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9
                ? "9+"
                : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-14 w-[380px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Notifications
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${
                        unreadCount === 1
                          ? ""
                          : "s"
                      }`
                    : "You're all caught up"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close notifications"
              >
                <X size={17} />
              </button>
            </div>

            {loading && (
              <div className="flex min-h-[220px] items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2
                    size={18}
                    className="animate-spin text-blue-600"
                  />
                  Loading notifications...
                </div>
              </div>
            )}

            {!loading &&
              notifications.length === 0 && (
                <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                    <Bell
                      size={20}
                      className="text-slate-400"
                    />
                  </div>

                  <p className="text-sm font-semibold text-slate-700">
                    No notifications
                  </p>

                  <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                    New interview, candidate, AI and job
                    updates will appear here.
                  </p>
                </div>
              )}

            {!loading &&
              notifications.length > 0 && (
                <>
                  <div className="max-h-[380px] overflow-y-auto p-2">
                    {notifications.map(
                      (notification) => {
                        const Icon =
                          icons[
                            notification.type
                          ] || Info;

                        return (
                          <div
                            key={
                              notification.id
                            }
                            className={`flex gap-3 rounded-xl p-3 transition hover:bg-slate-50 ${
                              !notification.read
                                ? "bg-blue-50/40"
                                : ""
                            }`}
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                              <Icon
                                size={16}
                                className="text-blue-600"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold text-slate-800">
                                  {notification.title}
                                </p>

                                {!notification.read && (
                                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                                )}
                              </div>

                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                {notification.message}
                              </p>

                              {notification.timestamp && (
                                <p className="mt-1 text-[11px] text-slate-400">
                                  {new Date(
                                    notification.timestamp
                                  ).toLocaleString(
                                    "en-IN",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Mark all as read
                    </button>

                    <button
                      type="button"
                      onClick={clearNotifications}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                    >
                      Clear
                    </button>
                  </div>
                </>
              )}
          </div>
        )}
      </div>
    </header>
  );
}
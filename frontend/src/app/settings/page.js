"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Shield,
  Bell,
  Palette,
  Settings as SettingsIcon,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getCurrentUser } from "@/services/auth.service";

const defaultSettings = {
  fullName: "",
  email: "",
  role: "HR Recruiter",

  emailNotifications: true,
  interviewNotifications: true,
  candidateNotifications: true,

  compactMode: false,
  animations: true,

  autoRefresh: true,
  autoRefreshInterval: "30",

  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [activeSection, setActiveSection] = useState("profile");
  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);
  const [showNewPassword, setShowNewPassword] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();

    if (user) {
      setSettings((previous) => ({
        ...previous,
        fullName: user.name || "",
        email: user.email || "",
        role: user.role || "HR Recruiter",
      }));
    }

    const savedSettings =
      localStorage.getItem("ai-ats-settings");

    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);

        setSettings((previous) => ({
          ...previous,
          ...parsed,
        }));
      } catch (error) {
        console.error(
          "Unable to load saved settings:",
          error
        );
      }
    }
  }, []);

  function updateSetting(key, value) {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  async function saveSettings() {
    try {
      setSaving(true);

      const settingsToSave = {
        fullName: settings.fullName,
        emailNotifications:
          settings.emailNotifications,
        interviewNotifications:
          settings.interviewNotifications,
        candidateNotifications:
          settings.candidateNotifications,
        compactMode: settings.compactMode,
        animations: settings.animations,
        autoRefresh: settings.autoRefresh,
        autoRefreshInterval:
          settings.autoRefreshInterval,
      };

      localStorage.setItem(
        "ai-ats-settings",
        JSON.stringify(settingsToSave)
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 500)
      );

      toast.success("Settings saved successfully.");
    } catch (error) {
      console.error("Settings save error:", error);

      toast.error("Unable to save settings.");
    } finally {
      setSaving(false);
    }
  }

  function changePassword() {
    if (!settings.currentPassword) {
      toast.error("Enter your current password.");
      return;
    }

    if (!settings.newPassword) {
      toast.error("Enter a new password.");
      return;
    }

    if (settings.newPassword.length < 8) {
      toast.error(
        "New password must contain at least 8 characters."
      );
      return;
    }

    if (
      settings.newPassword !==
      settings.confirmPassword
    ) {
      toast.error("New passwords do not match.");
      return;
    }

    toast.success(
      "Password validation passed. Connect this form to the backend password API before production use."
    );

    setSettings((previous) => ({
      ...previous,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  }

  const sections = [
    {
      id: "profile",
      label: "Profile",
      description: "Personal information",
      icon: User,
    },
    {
      id: "security",
      label: "Security",
      description: "Password and account security",
      icon: Shield,
    },
    {
      id: "notifications",
      label: "Notifications",
      description: "Alerts and communication",
      icon: Bell,
    },
    {
      id: "appearance",
      label: "Appearance",
      description: "Interface preferences",
      icon: Palette,
    },
    {
      id: "application",
      label: "Application",
      description: "ATS preferences",
      icon: SettingsIcon,
    },
  ];

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="mx-auto w-full max-w-7xl">
          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                    <SettingsIcon
                      size={21}
                      className="text-blue-600"
                    />
                  </div>

                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                      Settings
                    </h1>

                    <p className="text-sm text-slate-500">
                      Manage your account and ATS preferences
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={saveSettings}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={17} />

                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </motion.div>

          {/* SETTINGS LAYOUT */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
            {/* SIDEBAR */}
            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="mb-3 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Settings
                </p>
              </div>

              <div className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const active =
                    activeSection === section.id;

                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() =>
                        setActiveSection(section.id)
                      }
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                        active
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          active
                            ? "bg-blue-100"
                            : "bg-slate-100"
                        }`}
                      >
                        <Icon
                          size={17}
                          className={
                            active
                              ? "text-blue-600"
                              : "text-slate-500"
                          }
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold">
                          {section.label}
                        </p>

                        <p className="truncate text-xs text-slate-400">
                          {section.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* CONTENT */}
            <main className="min-w-0">
              {/* PROFILE */}
              {activeSection === "profile" && (
                <SettingsCard
                  title="Profile Information"
                  description="Manage the information associated with your recruiter account."
                  icon={User}
                >
                  <div className="mb-8 flex items-center gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-xl font-bold text-white">
                      {settings.fullName
                        ? settings.fullName
                            .split(" ")
                            .map((word) => word[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()
                        : "U"}
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {settings.fullName ||
                          "Recruiter"}
                      </h3>

                      <p className="text-sm text-slate-500">
                        {settings.email ||
                          "No email available"}
                      </p>

                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                        <CheckCircle2 size={13} />
                        {settings.role}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Field
                      label="Full Name"
                      value={settings.fullName}
                      onChange={(value) =>
                        updateSetting(
                          "fullName",
                          value
                        )
                      }
                      placeholder="Enter your full name"
                    />

                    <Field
                      label="Email Address"
                      value={settings.email}
                      disabled
                      onChange={() => {}}
                      placeholder="Email address"
                    />

                    <Field
                      label="Role"
                      value={settings.role}
                      disabled
                      onChange={() => {}}
                      placeholder="Role"
                    />
                  </div>
                </SettingsCard>
              )}

              {/* SECURITY */}
              {activeSection === "security" && (
                <SettingsCard
                  title="Security"
                  description="Manage your password and account security."
                  icon={Shield}
                >
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="mb-1 text-sm font-semibold text-slate-900">
                      Change Password
                    </h3>

                    <p className="mb-5 text-sm text-slate-500">
                      Use a strong password that you do not
                      reuse on other services.
                    </p>

                    <div className="space-y-4">
                      <PasswordField
                        label="Current Password"
                        value={
                          settings.currentPassword
                        }
                        visible={showCurrentPassword}
                        onToggle={() =>
                          setShowCurrentPassword(
                            (value) => !value
                          )
                        }
                        onChange={(value) =>
                          updateSetting(
                            "currentPassword",
                            value
                          )
                        }
                      />

                      <PasswordField
                        label="New Password"
                        value={settings.newPassword}
                        visible={showNewPassword}
                        onToggle={() =>
                          setShowNewPassword(
                            (value) => !value
                          )
                        }
                        onChange={(value) =>
                          updateSetting(
                            "newPassword",
                            value
                          )
                        }
                      />

                      <PasswordField
                        label="Confirm New Password"
                        value={
                          settings.confirmPassword
                        }
                        visible={showConfirmPassword}
                        onToggle={() =>
                          setShowConfirmPassword(
                            (value) => !value
                          )
                        }
                        onChange={(value) =>
                          updateSetting(
                            "confirmPassword",
                            value
                          )
                        }
                      />
                    </div>

                    <button
                      type="button"
                      onClick={changePassword}
                      className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Update Password
                    </button>
                  </div>

                  <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
                        <Shield
                          size={18}
                          className="text-green-600"
                        />
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          Account Security
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Your authentication token is stored
                          locally for the current application
                          session.
                        </p>
                      </div>
                    </div>
                  </div>
                </SettingsCard>
              )}

              {/* NOTIFICATIONS */}
              {activeSection === "notifications" && (
                <SettingsCard
                  title="Notifications"
                  description="Choose which events should generate notifications."
                  icon={Bell}
                >
                  <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200">
                    <ToggleRow
                      title="Email Notifications"
                      description="Receive important ATS updates by email."
                      checked={
                        settings.emailNotifications
                      }
                      onChange={(value) =>
                        updateSetting(
                          "emailNotifications",
                          value
                        )
                      }
                    />

                    <ToggleRow
                      title="Interview Notifications"
                      description="Get notified about upcoming and completed interviews."
                      checked={
                        settings.interviewNotifications
                      }
                      onChange={(value) =>
                        updateSetting(
                          "interviewNotifications",
                          value
                        )
                      }
                    />

                    <ToggleRow
                      title="Candidate Notifications"
                      description="Receive notifications when candidate information changes."
                      checked={
                        settings.candidateNotifications
                      }
                      onChange={(value) =>
                        updateSetting(
                          "candidateNotifications",
                          value
                        )
                      }
                    />
                  </div>
                </SettingsCard>
              )}

              {/* APPEARANCE */}
              {activeSection === "appearance" && (
                <SettingsCard
                  title="Appearance"
                  description="Customize how the ATS interface behaves."
                  icon={Palette}
                >
                  <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200">
                    <ToggleRow
                      title="Compact Mode"
                      description="Use tighter spacing for tables and dashboard content."
                      checked={settings.compactMode}
                      onChange={(value) =>
                        updateSetting(
                          "compactMode",
                          value
                        )
                      }
                    />

                    <ToggleRow
                      title="Interface Animations"
                      description="Enable smooth transitions and interface animations."
                      checked={settings.animations}
                      onChange={(value) =>
                        updateSetting(
                          "animations",
                          value
                        )
                      }
                    />
                  </div>

                  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-900">
                      Current Theme
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      The current application interface uses
                      the light enterprise theme.
                    </p>

                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-12 w-20 rounded-lg border-2 border-blue-600 bg-white shadow-sm" />

                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          Light
                        </p>

                        <p className="text-xs text-slate-400">
                          Current
                        </p>
                      </div>
                    </div>
                  </div>
                </SettingsCard>
              )}

              {/* APPLICATION */}
              {activeSection === "application" && (
                <SettingsCard
                  title="Application Preferences"
                  description="Configure how the ATS dashboard retrieves and displays data."
                  icon={SettingsIcon}
                >
                  <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200">
                    <ToggleRow
                      title="Automatic Refresh"
                      description="Automatically refresh dashboard data when the page is active."
                      checked={settings.autoRefresh}
                      onChange={(value) =>
                        updateSetting(
                          "autoRefresh",
                          value
                        )
                      }
                    />

                    <div className="flex items-center justify-between gap-6 p-5">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Refresh Interval
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          How frequently dashboard data should refresh.
                        </p>
                      </div>

                      <select
                        value={
                          settings.autoRefreshInterval
                        }
                        onChange={(event) =>
                          updateSetting(
                            "autoRefreshInterval",
                            event.target.value
                          )
                        }
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="15">
                          15 seconds
                        </option>
                        <option value="30">
                          30 seconds
                        </option>
                        <option value="60">
                          1 minute
                        </option>
                        <option value="300">
                          5 minutes
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <CheckCircle2
                          size={18}
                          className="text-blue-600"
                        />
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-blue-900">
                          ATS Configuration
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-blue-700">
                          Your current ATS configuration uses
                          real candidate, job, interview and
                          analytics data from the backend.
                        </p>
                      </div>
                    </div>
                  </div>
                </SettingsCard>
              )}
            </main>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}

/* -------------------------------------------------
   COMPONENTS
------------------------------------------------- */

function SettingsCard({
  title,
  description,
  icon: Icon,
  children,
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-7 flex items-start gap-4 border-b border-slate-100 pb-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
          <Icon
            size={19}
            className="text-blue-600"
          />
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        </div>
      </div>

      {children}
    </motion.section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className={`w-full rounded-xl border px-4 py-3 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
            : "border-slate-200 bg-white text-slate-900"
        }`}
      />
    </div>
  );
}

function PasswordField({
  label,
  value,
  visible,
  onToggle,
  onChange,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label={
            visible
              ? "Hide password"
              : "Show password"
          }
        >
          {visible ? (
            <EyeOff size={17} />
          ) : (
            <Eye size={17} />
          )}
        </button>
      </div>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-6 p-5">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">
          {title}
        </p>

        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-blue-600"
            : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
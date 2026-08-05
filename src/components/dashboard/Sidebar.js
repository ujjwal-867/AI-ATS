import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6">
      <h1 className="mb-8 text-2xl font-bold text-white">
        🤖 AI ATS
      </h1>

      <nav className="space-y-4">
        <Link
          href="/"
          className="block text-slate-300 hover:text-white"
        >
          Dashboard
        </Link>

        <Link
          href="/ats"
          className="block text-slate-300 hover:text-white"
        >
          ATS Engine
        </Link>

        <Link
          href="/candidates"
          className="block text-slate-300 hover:text-white"
        >
          Candidates
        </Link>

        <Link
          href="/upload"
          className="block text-slate-300 hover:text-white"
        >
          Upload Resume
        </Link>

        <Link
          href="/jobs"
          className="block text-slate-300 hover:text-white"
        >
          Jobs
        </Link>

        <Link
          href="/analytics"
          className="block text-slate-300 hover:text-white"
        >
          Analytics
        </Link>
      </nav>
    </aside>
  );
}
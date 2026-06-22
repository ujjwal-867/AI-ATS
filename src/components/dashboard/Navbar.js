import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-8 py-4">
      <h1 className="text-2xl font-bold text-white">
        AI ATS Dashboard 🚀
      </h1>

      <div className="flex items-center gap-4">
        <ThemeToggle />

        <div className="rounded-xl bg-slate-800 px-4 py-2 text-slate-300">
          Welcome, Admin 👋
        </div>
      </div>
    </header>
  );
}
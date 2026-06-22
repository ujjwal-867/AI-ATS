"use client";

export default function SearchBar({
  search,
  setSearch,
}) {
  return (
    <input
      type="text"
      placeholder="Search candidate..."
      value={search}
      onChange={(e) =>
        setSearch(e.target.value)
      }
      className="mb-8 w-full rounded-xl border border-slate-700 bg-slate-900 p-4 text-white outline-none"
    />
  );
}
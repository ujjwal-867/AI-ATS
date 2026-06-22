export default function StatsCard({
  title,
  value,
}) {
  return (
    <div className="rounded-2xl bg-slate-900 p-6 shadow-xl">
      <h2 className="text-slate-400">
        {title}
      </h2>

      <div className="mt-4 text-4xl font-bold text-white">
        {value}
      </div>
    </div>
  );
}
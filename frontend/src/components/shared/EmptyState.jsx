export default function EmptyState({
  title = "No data found",
  description = "There is nothing to display.",
}) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-700 p-12 text-center">

      <h3 className="text-2xl font-semibold text-white">
        {title}
      </h3>

      <p className="mt-3 text-slate-400">
        {description}
      </p>

    </div>
  );
}
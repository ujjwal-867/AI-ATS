export default function ProgressBar({
  value,
}) {
  return (
    <div className="mt-3">
      <div className="h-3 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-700"
          style={{
            width: `${value}%`,
          }}
        />
      </div>

      <p className="mt-2 text-right text-sm text-slate-400">
        {value}%
      </p>
    </div>
  );
}
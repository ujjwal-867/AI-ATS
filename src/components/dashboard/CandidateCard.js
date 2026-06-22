export default function CandidateCard({
  name,
  role,
  score,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-xl font-bold text-white">
        {name}
      </h2>

      <p className="mt-2 text-slate-400">
        {role}
      </p>

      <div className="mt-4 text-3xl font-bold text-green-400">
        {score}%
      </div>
    </div>
  );
}
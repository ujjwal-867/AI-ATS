"use client";

export default function ProfileSkills({ candidate }) {
  if (!candidate) return null;

  return (
    <div className="mt-8">
      <h3 className="mb-4 text-lg font-semibold text-white">
        Skills
      </h3>

      <div className="flex flex-wrap gap-3">
        {candidate.skills?.length ? (
          candidate.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-300 transition hover:border-indigo-400"
            >
              {skill}
            </span>
          ))
        ) : (
          <p className="text-slate-400">
            No skills available.
          </p>
        )}
      </div>
    </div>
  );
}
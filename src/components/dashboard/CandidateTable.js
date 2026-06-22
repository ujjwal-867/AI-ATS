const candidates = [
  {
    id: 1,
    name: "John Doe",
    role: "Frontend Developer",
    score: 92,
    status: "Shortlisted",
  },
  {
    id: 2,
    name: "Jane Smith",
    role: "Backend Developer",
    score: 85,
    status: "Interview",
  },
  {
    id: 3,
    name: "Alex Brown",
    role: "Data Scientist",
    score: 78,
    status: "Review",
  },
];

export default function CandidateTable() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-6 text-2xl font-bold text-white">
        Recent Candidates
      </h2>

      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-700 text-slate-400">
            <th className="pb-4">Name</th>
            <th className="pb-4">Role</th>
            <th className="pb-4">ATS Score</th>
            <th className="pb-4">Status</th>
          </tr>
        </thead>

        <tbody>
          {candidates.map((candidate) => (
            <tr
              key={candidate.id}
              className="border-b border-slate-800"
            >
              <td className="py-4 text-white">
                {candidate.name}
              </td>

              <td className="text-slate-300">
                {candidate.role}
              </td>

              <td className="text-green-400">
                {candidate.score}%
              </td>

              <td className="text-purple-400">
                {candidate.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
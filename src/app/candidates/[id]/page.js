import CandidateDetails from "@/components/candidates/CandidateDetails";

async function getCandidate(id) {
  const response = await fetch(
    `http://localhost:3000/api/candidates/${id}`,
    {
      cache: "no-store",
    }
  );

  const data = await response.json();

  return data.candidate;
}

export default async function CandidatePage({
  params,
}) {
  const { id } = await params;

  const candidate = await getCandidate(id);

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <CandidateDetails candidate={candidate} />
    </div>
  );
}
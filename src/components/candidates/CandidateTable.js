"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SearchFilter from "./SearchFilter";

export default function CandidateTable() {
  const [candidates, setCandidates] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [minScore, setMinScore] = useState("");

  useEffect(() => {
    async function fetchCandidates() {
      try {
        const response = await fetch("/api/candidates");
        const data = await response.json();

        setCandidates(data.candidates);
      } catch (error) {
        console.log(error);
      }
    }

    fetchCandidates();
  }, []);

  const filteredCandidates = candidates.filter((candidate) => {
    const matchSearch = candidate.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchStatus =
      status === "All" ||
      candidate.status === status;

    const matchScore =
      minScore === "" ||
      candidate.score >= Number(minScore);

    return (
      matchSearch &&
      matchStatus &&
      matchScore
    );
  });

  return (
    <>
      <SearchFilter
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        minScore={minScore}
        setMinScore={setMinScore}
      />

      <div className="overflow-x-auto rounded-3xl bg-slate-900 p-6">
        <table className="w-full text-white">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4">Score</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredCandidates.map((candidate) => (
              <tr
                key={candidate._id}
                className="border-b border-slate-800"
              >
                <td className="p-4">
                  {candidate.name}
                </td>

                <td className="p-4">
                  {candidate.email}
                </td>

                <td className="p-4 text-center">
                  {candidate.score}%
                </td>

                <td className="p-4 text-center">
                  {candidate.status}
                </td>

                <td className="p-4 text-center">
                  <Link
                    href={`/candidates/${candidate._id}`}
                    className="rounded-xl bg-indigo-600 px-4 py-2"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
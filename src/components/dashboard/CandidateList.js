"use client";

import { useEffect, useState } from "react";
import CandidateCard from "./CandidateCard";
import SearchBar from "./SearchBar";

export default function CandidateList() {
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchCandidates() {
      const response = await fetch(
        "/api/candidates"
      );

      const data = await response.json();

      setCandidates(data.candidates);
    }

    fetchCandidates();
  }, []);

  const filteredCandidates =
    candidates.filter((candidate) =>
      candidate.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  return (
    <>
      <SearchBar
        search={search}
        setSearch={setSearch}
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredCandidates.map(
          (candidate) => (
            <CandidateCard
              key={candidate._id}
              candidate={candidate}
            />
          )
        )}
      </div>
    </>
  );
}
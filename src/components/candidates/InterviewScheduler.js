"use client";

import { useState } from "react";

export default function InterviewScheduler({
  candidateId,
}) {
  const [interviewDate, setInterviewDate] =
    useState("");

  const [interviewTime, setInterviewTime] =
    useState("");

  const [meetingLink, setMeetingLink] =
    useState("");

  async function scheduleInterview() {
    try {
      const response = await fetch(
        `/api/candidates/${candidateId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            interviewDate,
            interviewTime,
            meetingLink,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Interview scheduled!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="space-y-4 rounded-3xl bg-slate-900 p-6 text-white">

      <h2 className="text-2xl font-bold">
        Schedule Interview
      </h2>

      <input
        type="date"
        value={interviewDate}
        onChange={(e) =>
          setInterviewDate(e.target.value)
        }
        className="w-full rounded-xl bg-slate-800 p-4"
      />

      <input
        type="time"
        value={interviewTime}
        onChange={(e) =>
          setInterviewTime(e.target.value)
        }
        className="w-full rounded-xl bg-slate-800 p-4"
      />

      <input
        type="text"
        placeholder="Meeting Link"
        value={meetingLink}
        onChange={(e) =>
          setMeetingLink(e.target.value)
        }
        className="w-full rounded-xl bg-slate-800 p-4"
      />

      <button
        onClick={scheduleInterview}
        className="rounded-xl bg-indigo-600 px-6 py-3"
      >
        Schedule Interview
      </button>
    </div>
  );
}
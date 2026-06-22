import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Candidate from "@/models/Candidate";

import extractJDskills from "@/lib/extractJDskills";
import calculateMatch from "@/lib/calculateMatch";

export async function POST(req) {
  try {
    await connectDB();

    const { jobDescription } = await req.json();

    const jdSkills = extractJDskills(jobDescription);

    const candidates = await Candidate.find();

    const results = candidates.map((candidate) => {
      const match = calculateMatch(
        candidate.skills,
        jdSkills
      );

      return {
        ...candidate.toObject(),
        matchScore: match.score,
        matchedSkills: match.matchedSkills,
        missingSkills: match.missingSkills,
      };
    });

    results.sort(
      (a, b) => b.matchScore - a.matchScore
    );

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Matching failed",
      },
      {
        status: 500,
      }
    );
  }
}
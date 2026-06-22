import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Candidate from "@/models/Candidate";

export async function GET() {
  try {
    await connectDB();

    const candidates = await Candidate.find();

    const totalCandidates =
      candidates.length;

    const averageScore =
      totalCandidates > 0
        ? Math.round(
            candidates.reduce(
              (sum, c) => sum + c.score,
              0
            ) / totalCandidates
          )
        : 0;

    const shortlisted =
      candidates.filter(
        (c) =>
          c.status === "Shortlisted"
      ).length;

    const rejected = candidates.filter(
      (c) => c.status === "Rejected"
    ).length;

    const pending = candidates.filter(
      (c) => c.status === "Pending"
    ).length;

    return NextResponse.json({
      totalCandidates,
      averageScore,
      shortlisted,
      rejected,
      pending,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {},
      {
        status: 500,
      }
    );
  }
}
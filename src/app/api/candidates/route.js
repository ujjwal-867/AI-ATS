import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Candidate from "@/models/Candidate";

export async function GET() {
  try {
    await connectDB();

    const candidates = await Candidate.find()
      .sort({ score: -1, createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        candidates,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch candidates",
      },
      {
        status: 500,
      }
    );
  }
}
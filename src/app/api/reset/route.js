import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Candidate from "@/models/Candidate";

export async function GET() {
  try {
    await connectDB();

    await Candidate.deleteMany();

    return NextResponse.json({
      success: true,
      message:
        "All candidates deleted",
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}
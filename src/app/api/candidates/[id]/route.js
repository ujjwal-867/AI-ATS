import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Candidate from "@/models/Candidate";

export async function PATCH(req, { params }) {
  try {
    await connectDB();

    const { status } = await req.json();

    const candidate = await Candidate.findByIdAndUpdate(
      params.id,
      {
        status,
      },
      {
        new: true,
      }
    );

    return NextResponse.json({
      success: true,
      candidate,
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
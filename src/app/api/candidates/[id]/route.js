import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Candidate from "@/models/Candidate";
import mongoose from "mongoose";

export async function GET(req, context) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid ID",
        },
        { status: 400 }
      );
    }

    const candidate = await Candidate.findById(id);

    if (!candidate) {
      return NextResponse.json(
        {
          success: false,
          message: "Candidate not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      candidate,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req, context) {
  try {
    await connectDB();

    const { id } = await context.params;

    const body = await req.json();

    const candidate = await Candidate.findByIdAndUpdate(
      id,
      body,
      { new: true }
    );

    return NextResponse.json({
      success: true,
      candidate,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}

export async function DELETE(req, context) {
  try {
    await connectDB();

    const { id } = await context.params;

    await Candidate.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
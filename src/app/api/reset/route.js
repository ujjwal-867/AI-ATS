import connectDB from "@/lib/mongodb";
import Candidate from "@/models/Candidate";

export async function GET() {
  await connectDB();

  await Candidate.deleteMany({});

  return Response.json({
    success: true,
    message: "All candidates deleted",
  });
}
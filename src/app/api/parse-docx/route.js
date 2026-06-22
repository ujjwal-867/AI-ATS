import mammoth from "mammoth";

import connectDB from "@/lib/mongodb";
import Candidate from "@/models/Candidate";

import calculateATSScore from "@/lib/calculateATSScore";
import extractName from "@/lib/extractName";
import extractEmail from "@/lib/extractEmail";
import extractPhone from "@/lib/extractPhone";
import extractSkills from "@/lib/extractSkills";

export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json(
        {
          success: false,
          message: "No file uploaded",
        },
        {
          status: 400,
        }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await mammoth.extractRawText({
      buffer,
    });

    const resumeText = result.value;

    const requiredSkills = [
      "Python",
      "Machine Learning",
      "Pandas",
      "NumPy",
      "Scikit-learn",
      "SQL",
      "Git",
      "GitHub",
    ];

    const skills = extractSkills(resumeText);

    const ats = calculateATSScore(
      skills,
      requiredSkills
    );

    const candidate = {
      name: extractName(resumeText),
      email: extractEmail(resumeText),
      phone: extractPhone(resumeText),
      skills,
      score: ats.score,
      matchedSkills: ats.matchedSkills,
      resumeText,
    };

    // Prevent duplicates
    const existingCandidate =
      await Candidate.findOne({
        email: candidate.email,
      });

    if (!existingCandidate) {
      await Candidate.create(candidate);
      console.log("Candidate saved successfully");
    } else {
      console.log("Candidate already exists");
    }

    return Response.json({
      success: true,
      message: "Candidate processed successfully",
      candidate,
    });
  } catch (error) {
    console.error("PARSE ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Parsing failed",
      },
      {
        status: 500,
      }
    );
  }
}
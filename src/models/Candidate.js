import mongoose from "mongoose";

const CandidateSchema =
  new mongoose.Schema(
    {
      name: String,
      email: String,
      phone: String,

      skills: [String],

      score: Number,

      matchedSkills: [String],

      resumeText: String,

      status: {
        type: String,
        enum: [
          "Pending",
          "Shortlisted",
          "Rejected",
        ],
        default: "Pending",
      },

      interviewDate: String,

      interviewTime: String,

      meetingLink: String,
    },
    {
      timestamps: true,
    }
  );

const Candidate =
  mongoose.models.Candidate ||
  mongoose.model(
    "Candidate",
    CandidateSchema
  );

export default Candidate;
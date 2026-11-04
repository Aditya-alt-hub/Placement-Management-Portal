import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      // ref: "User",
      ref: "StudentProfile",
      required: true,
    },

    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    interviewDate: {
      type: Date,
      required: true,
    },

    round: {
      type: String,
      enum: ["Coding", "Technical", "HR", "Final"],
      required: true,
    },

    mode: {
      type: String,
      enum: ["Online", "Offline"],
      required: true,
    },

    location: String,

    meetingLink: {
      type: String,
    },

    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled"],
      default: "Scheduled",
    },

    result: {
      type: String,
      enum: ["Pending", "Passed", "Failed"],
      default: "Pending",
    },

    feedback: {
      type: String,
    },
  },
  { timestamps: true },
);

// index to ensure that a student cannot have multiple interviews for the same application and round
interviewSchema.index({ application: 1, round: 1 }, { unique: true });

export const Interview = mongoose.model("Interview", interviewSchema);

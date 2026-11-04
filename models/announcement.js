import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
    },

    recipientType: {
      type: String,
      enum: ["All Students", "Selected Students"],
      required: true,
    },

    recipients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StudentProfile",
      },
    ],

    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    totalRecipients: {
      type: Number,
      default: 0,
    },

    successfulEmails: {
      type: Number,
      default: 0,
    },

    failedEmails: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Pending", "Sending", "Sent", "Partially Sent", "Failed"],
      default: "Pending",
    },

    sentAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

export const Announcement = mongoose.model("Announcement", announcementSchema);

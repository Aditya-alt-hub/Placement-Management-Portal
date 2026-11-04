import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
    },

    drive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlacementDrive",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Applied",
        "Shortlisted",
        "Interview",
        "Selected",
        "Rejected",
        "Placed",
      ],
      default: "Applied",
    },

    statusHistory: [
      {
        status: {
          type: String,
          enum: [
            "Applied",
            "Rejected",
            "Shortlisted",
            "Interview",
            "Selected",
            "Placed",
          ],
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    rejectionReasons: {
      type: [String],
      default: [],
    },

    offer: {
      status: {
        type: String,
        enum: ["Pending", "Offered", "Accepted", "Declined", "Withdrawn"],
        default: "Pending",
      },

      package: {
        type: Number,
        min: 0,
        default: null,
      },

      offeredAt: {
        type: Date,
        default: null,
      },

      respondedAt: {
        type: Date,
        default: null,
      },
    },

    appliedAt: {
      type: Date,
      default: Date.now,
    },

    // offerLetter: {
    //   url: {
    //     type: String,
    //     default: null,
    //   },
    //   publicId: {
    //     type: String,
    //     default: null,
    //   },
    //   source: {
    //     type: String,
    //     enum: ["Generated", "Uploaded"],
    //     default: null,
    //   },
    // },
  },
  { timestamps: true },
);

applicationSchema.index({ student: 1, drive: 1 }, { unique: true });

export const Application = mongoose.model("Application", applicationSchema);

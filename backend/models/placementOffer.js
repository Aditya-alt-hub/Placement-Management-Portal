import mongoose from "mongoose";

const placementOfferSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      unique: true,
    },
    packageLPA: {
      type: Number,
      required: true,
      min: 0,
    },
    offerStatus: {
      type: String,
      enum: ["Offered", "Accepted", "Declined", "Withdrawn"],
      default: "Offered",
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    joiningDate: {
      type: Date,
      default: null,
    },
    placementYear: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

export const PlacementOffer = mongoose.model(
  "PlacementOffer",
  placementOfferSchema,
);

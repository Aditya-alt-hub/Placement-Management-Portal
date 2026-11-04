import { Application } from "../models/application.js";
import { StudentProfile } from "../models/studentProfile.js";

export const updatePlacementStatus = async (studentProfileId) => {
  const acceptedOffer = await Application.exists({
    student: studentProfileId,
    "offer.status": "Accepted",
  });

  const placementStatus = acceptedOffer ? "Placed" : "Not Placed";

  await StudentProfile.findByIdAndUpdate(studentProfileId, {
    placementStatus,
  });

  return placementStatus;
};

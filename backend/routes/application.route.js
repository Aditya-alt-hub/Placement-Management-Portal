import express from "express";

import {
  applyForPlacementDrive,
  getMyApplication,
  getRecruiterApplications,
  shortlistApplication,
  rejectApplication,
  getApplicationStatus,
  issueOffer,
  respondToOffer,
} from "../controllers/application.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { offerLetterUpload } from "../middlewares/multer.js";

const router = express.Router();

// Student applies for a placement drive
router.post(
  "/apply/:driveId",
  protect,
  authorizeRoles("student"),
  applyForPlacementDrive,
);

// Student sees own applications
router.get(
  "/my-applications",
  protect,
  authorizeRoles("student"),
  getMyApplication,
);

// Recruiter sees applications for their drives
router.get(
  "/recruiter",
  protect,
  authorizeRoles("recruiter"),
  getRecruiterApplications,
);

router.patch(
  "/:id/shortlist",
  protect,
  authorizeRoles("recruiter"),
  shortlistApplication,
);

router.patch(
  "/:id/reject",
  protect,
  authorizeRoles("recruiter"),
  rejectApplication,
);

router.get(
  "/:id/status",
  protect,
  authorizeRoles("student"),
  getApplicationStatus,
);

// Recruiter issues an offer
router.patch("/:id/offer", protect, authorizeRoles("recruiter"), issueOffer);

// Student accepts or declines an offer
router.patch(
  "/:id/offer/respond",
  protect,
  authorizeRoles("student"),
  respondToOffer,
);

export default router;

import express from "express";

import {
  scheduleInterview,
  getMyInterviews,
  getRecruiterInterview,
  updateInterviewStatus,
} from "../controllers/interview.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// Schedule interview
router.post("/", protect, authorizeRoles("recruiter"), scheduleInterview);

// Student can View own interviews
router.get(
  "/my-interviews",
  protect,
  authorizeRoles("student"),
  getMyInterviews,
);

// Recruiter can View scheduled interviews
router.get(
  "/recruiter",
  protect,
  authorizeRoles("recruiter"),
  getRecruiterInterview,
);

// Recruiter can Update interview result
router.patch(
  "/:id/result",
  protect,
  authorizeRoles("recruiter"),
  updateInterviewStatus,
);

export default router;

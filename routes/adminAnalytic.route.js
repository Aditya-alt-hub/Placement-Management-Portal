import express from "express";

import {
  getPlacementOverview,
  getBranchAnalytics,
  getCompanyAnalytics,
  getBatchAnalytics,
} from "../controllers/adminAnalytics.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/overview", protect, authorizeRoles("admin"), getPlacementOverview);
router.get("/branches", protect, authorizeRoles("admin"), getBranchAnalytics);
router.get("/companies", protect, authorizeRoles("admin"), getCompanyAnalytics);
router.get("/batches", protect, authorizeRoles("admin"), getBatchAnalytics);

export default router;

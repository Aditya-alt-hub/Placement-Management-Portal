import express from "express";

import {
  createAnnouncement,
  getAnnouncements,
} from "../controllers/announcement.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// Admin sends announcement
router.post("/", protect, authorizeRoles("admin"), createAnnouncement);

// Admin views announcement history
router.get("/", protect, authorizeRoles("admin"), getAnnouncements);

export default router;

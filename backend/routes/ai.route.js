import express from "express";
import { analyzeStudentProfile } from "../controllers/ai.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { getPlacementMatches } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/analyze", protect, analyzeStudentProfile);

router.get("/placement-matches", protect, getPlacementMatches);

export default router;

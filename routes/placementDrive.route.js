import express from "express";

import {
    createPlacementDrive,
    getMyPlacementsDrive,
    getPlacementDriveById,
    availableDrives,
    updatePlacementDrive,
    deletePlacementDrive
} from "../controllers/placementDrive.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();


// Recruiter
router.post(
    "/",
    protect,
    authorizeRoles("recruiter"),
    createPlacementDrive
);

router.get(
    "/my-drives",
    protect,
    authorizeRoles("recruiter"),
    getMyPlacementsDrive
);

router.put(
    "/:id",
    protect,
    authorizeRoles("recruiter"),
    updatePlacementDrive
);

router.delete(
    "/:id",
    protect,
    authorizeRoles("recruiter"),
    deletePlacementDrive
);


// Student
router.get(
    "/available-drives",
    protect,
    authorizeRoles("student","admin"),
    availableDrives
);


// Student + Recruiter
router.get(
    "/:id",
    protect,
    authorizeRoles("student", "recruiter"),
    getPlacementDriveById
);

export default router;
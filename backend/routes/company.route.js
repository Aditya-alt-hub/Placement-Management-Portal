import express from "express";

import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

import {
    createCompany,
    getMyCompany,
    updateMyCompany,
    getAllCompanies,
    approveCompany,
    getapprovedCompaniesByStudent
} from "../controllers/company.controller.js";

const router = express.Router();


// Recruiter routes

router.post(
    "/create-company",
    protect,
    authorizeRoles("recruiter"),
    createCompany
);

router.get(
    "/my-company",
    protect,
    authorizeRoles("recruiter"),
    getMyCompany
);

router.put(
    "/update-my-company",
    protect,
    authorizeRoles("recruiter"),
    updateMyCompany
);

// Admin routes

router.get(
    "/admin/get-allCompanies",
    protect,
    authorizeRoles("admin"),
    getAllCompanies
);

router.patch(
    "/:id/approve",
    protect,
    authorizeRoles("admin"),
    approveCompany
);

router.get("/approved-company", protect, authorizeRoles("student", "admin", "recruiter"), getapprovedCompaniesByStudent);

export default router;

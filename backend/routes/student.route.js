import express from "express";

import {protect} from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import {studentUpload} from "../middlewares/multer.js";
import { createStudentProfile, getStudentProfile, updateStudentProfile } from "../controllers/student.controller.js";



const router=express.Router();

//create profile

router.post("/create-profile",protect,authorizeRoles("student"),studentUpload,createStudentProfile);
router.get("/get-profile",protect,authorizeRoles("student","recruiter","admin"),getStudentProfile);
router.put("/update-profile",protect,authorizeRoles("student"), studentUpload,updateStudentProfile);

export default router;

import express from "express";
import { login, logout, register } from "../controllers/auth.controller.js";
import {protect} from "../middlewares/auth.middleware.js";


const router=express.Router();

router.post("/register",register);
router.post("/login",login);
router.get("/logout",logout);


// Protected route
router.get("/me", protect, (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    });
});

export default router;
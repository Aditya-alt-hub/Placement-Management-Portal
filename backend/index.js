import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import authRoutes from "../backend/routes/auth.route.js";
import studentRoutes from "../backend/routes/student.route.js";
import companyRoutes from "./routes/company.route.js";
import placementDriveRoutes from "./routes/placementDrive.route.js";
import applicationRoutes from "./routes/application.route.js";
import interviewRoutes from "./routes/interview.route.js";
import aiRoutes from "./routes/ai.route.js";
import adminAnalyticsRoutes from "./routes/adminAnalytic.route.js";
import announcementRoutes from "./routes/announcement.routes.js";

dotenv.config();

const port = process.env.PORT || 5000;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
};
app.use(cors(corsOptions));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/drives", placementDriveRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);
app.use("/api/announcements", announcementRoutes);

app.listen(port, () => {
  console.log(`Server Running at ${port}`);
  connectDB();
});

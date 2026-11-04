import { StudentProfile } from "../models/studentProfile.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/dataURI.js";
import { ingestResume } from "../services/ai/ingestResume.js";

export const createStudentProfile = async (req, res) => {
  try {
    const existingProfile = await StudentProfile.findOne({
      user: req.user._id,
    });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "Student Profile already exist",
      });
    }

    //upload profile photo

    let profilePhotoUrl = " ";

    if (req.files?.profilePhoto?.[0]) {
      const file = req.files.profilePhoto[0];

      const fileUri = getDataUri(file);

      const uploadResult = await cloudinary.uploader.upload(fileUri.content, {
        folder: "placement-portal/profile-photos",
        resource_type: "image",
      });
      profilePhotoUrl = uploadResult.secure_url;
    }

    // Resume upload + AI ingestion

    let resumeData = {};

    if (req.files?.resume?.[0]) {
      const file = req.files.resume[0];

      if (
        file.mimetype !== "application/pdf" ||
        !file.originalname?.toLowerCase().endsWith(".pdf")
      ) {
        return res.status(400).json({
          success: false,
          message: "Please upload a PDF resume.",
        });
      }

      const fileUri = getDataUri(file);

      // Upload PDF to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(fileUri.content, {
        folder: "placement-portal/resumes",
        resource_type: "raw",
      });

      resumeData = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };

      // Extract, chunk, and index the PDF in Qdrant
      try {
        const result = await ingestResume(file.buffer, req.user._id.toString());

        console.log("[Resume RAG] Indexed chunks:", result.chunksIndexed);
      } catch (error) {
        console.error("[Resume RAG] Ingestion failed:", error);

        return res.status(500).json({
          success: false,
          message: "Resume uploaded to Cloudinary, but AI indexing failed.",
          resumeUploaded: true,
          aiIndexed: false,
        });
      }
    }
    // await student.save();

    const student = await StudentProfile.create({
      user: req.user._id,
      enrollmentNumber: req.body.enrollmentNumber,
      course: req.body.course,
      branch: req.body.branch,
      graduationYear: req.body.graduationYear,
      tenthPercentage: req.body.tenthPercentage,
      twelfthPercentage: req.body.twelfthPercentage,
      cgpa: req.body.cgpa,
      backlogs: req.body.backlogs,
      // skills: req.body.skills,
      // projects: req.body.projects,
      //   skills: JSON.parse(req.body.skills),
      //   projects: JSON.parse(req.body.projects),

      skills: req.body.skills
        ? req.body.skills.split(",").map((skill) => skill.trim())
        : [],

      projects: req.body.projects ? JSON.parse(req.body.projects) : [],
      profilePhoto: profilePhotoUrl,

      resume: resumeData,
    });

    return res.status(201).json({
      success: true,
      message: "Profile Created Successfully",
    });
  } catch (error) {
    console.error("Create Student Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getStudentProfile = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({
      user: req.user._id,
    }).populate("user", "name email role");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    console.error("Get Student Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateStudentProfile = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({
      user: req.user._id,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    const {
      enrollmentNumber,
      course,
      branch,
      graduationYear,
      tenthPercentage,
      twelfthPercentage,
      cgpa,
      backlogs,
      skills,
      projects,
    } = req.body;

    if (enrollmentNumber !== undefined) {
      student.enrollmentNumber = enrollmentNumber;
    }

    if (course !== undefined) {
      student.course = course;
    }

    if (branch !== undefined) {
      student.branch = branch;
    }

    if (graduationYear !== undefined) {
      student.graduationYear = graduationYear;
    }

    if (tenthPercentage !== undefined) {
      student.tenthPercentage = tenthPercentage;
    }

    if (twelfthPercentage !== undefined) {
      student.twelfthPercentage = twelfthPercentage;
    }

    if (cgpa !== undefined) {
      student.cgpa = cgpa;
    }
    if (backlogs !== undefined) {
      student.backlogs = backlogs;
    }

    if (skills !== undefined) {
      // student.skills = JSON.parse(skills);
      student.skills = skills.split(",").map((skill) => skill.trim());
    }

    if (projects !== undefined) {
      student.projects = JSON.parse(projects);
    }

    // UPDATE PROFILE PHOTO

    if (req.files?.profilePhoto?.[0]) {
      const file = req.files.profilePhoto[0];

      const fileUri = getDataUri(file);

      const uploadResult = await cloudinary.uploader.upload(fileUri.content, {
        folder: "placement-portal/profile-photos",
        resource_type: "image",
      });

      // Delete old resume from Cloudinary
      if (student.profilePhoto?.publicId) {
        await cloudinary.uploader.destroy(student.profilePhoto.publicId, {
          resource_type: "image",
        });
      }

      student.profilePhoto = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };
      // student.profilePhoto = uploadResult.secure_url;
    }
    // UPDATE RESUME + AI INGESTION
    if (req.files?.resume?.[0]) {
      const file = req.files.resume[0];

      // Validate PDF before uploading or indexing
      const isPdf =
        file.mimetype === "application/pdf" &&
        file.originalname?.toLowerCase().endsWith(".pdf");

      if (!isPdf) {
        return res.status(400).json({
          success: false,
          message: "Please upload a valid PDF resume.",
        });
      }

      const fileUri = getDataUri(file);

      //Upload the new resume to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(fileUri.content, {
        folder: "placement-portal/resumes",
        resource_type: "raw",
      });

      // Save the new resume details to the profile
      const previousResume = student.resume;

      student.resume = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };

      await student.save();

      try {
        // Index the uploaded PDF in Qdrant
        // Multer memory storage provides the PDF buffer here.
        const ingestionResult = await ingestResume(
          file.buffer,
          req.user._id.toString(),
        );

        console.log(
          "[Resume RAG] Indexed chunks:",
          ingestionResult.chunksIndexed,
        );
      } catch (ingestionError) {
        console.error("[Resume RAG] Ingestion failed:", ingestionError);
        // If ingestion fails, return a response indicating the issue but keep the uploaded resume.
        return res.status(500).json({
          success: false,
          message:
            "Resume uploaded, but AI indexing failed. Please retry indexing.",
          resumeUploaded: true,
          aiIndexed: false,
        });
      }
      // purane resumee ko tabhi delete krna jab indexing m new resume ka publicId ho aur purana publicId new se alag ho.
      if (
        previousResume?.publicId &&
        previousResume.publicId !== uploadResult.public_id
      ) {
        try {
          await cloudinary.uploader.destroy(previousResume.publicId, {
            resource_type: "raw",
          });
        } catch (cleanupError) {
          console.error(
            "[Cloudinary] Old resume cleanup failed:",
            cleanupError,
          );
        }
      }
    }

    await student.save();

    return res.status(200).json({
      success: true,
      message: "Student profile updated successfully",
      student,
    });
  } catch (error) {
    console.error("Update Student Profile Error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Enrollment number already exists",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

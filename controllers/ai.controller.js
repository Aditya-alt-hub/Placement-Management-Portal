import { analyzeStudent } from "../services/ai/graph.js";
import { matchStudentToPlacementDrive } from "../services/ai/placementMatching.js";

export const analyzeStudentProfile = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can use this analysis endpoint.",
      });
    }

    const question =
      typeof req.body?.question === "string" ? req.body.question.trim() : "";

    if (question.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Question is too long. Please keep it under 1000 characters.",
      });
    }

    const result = await analyzeStudent({
      userId: userId.toString(),
      question,
    });

    return res.status(200).json({
      success: true,
      message: "Student analysis completed successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Student AI analysis error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to analyze your profile right now.",
    });
  }
};

export const getPlacementMatches = async (req, res) => {
  try {
    const userId = req.user._id;

    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can access placement matching.",
      });
    }

    const result = await matchStudentToPlacementDrive(userId);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("[Placement Matching]", error);

    return res.status(500).json({
      success: false,
      message: "Failed to match placement drives.",
      error: error.message,
    });
  }
};

import { Interview } from "../models/interviewDrive.js";
import { Application } from "../models/application.js";
import { Company } from "../models/company.js";
import { StudentProfile } from "../models/studentProfile.js";
import { sendEmail } from "../services/email service/enotification.js";
// Interview round sequence
const ROUND_ORDER = ["Coding", "Technical", "HR", "Final"];
// SCHEDULE INTERVIEW
export const scheduleInterview = async (req, res) => {
  try {
    const { applicationId, interviewDate, mode, meetingLink, location, round } =
      req.body;
    // Validate round
    if (!ROUND_ORDER.includes(round)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview round",
      });
    }
    // Find application
    const application =
      await Application.findById(applicationId).populate("drive");
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }
    // Check application status
    if (application.status !== "Shortlisted") {
      return res.status(400).json({
        success: false,
        message: "Only shortlisted students can be scheduled for an interview",
      });
    }
    // Find recruiter company
    const company = await Company.findOne({
      recruiter: req.user._id,
    });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }
    // Check company authorization
    if (application.drive.company.toString() !== company._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to schedule this interview",
      });
    }
    // Validate interview mode
    if (mode === "Online" && !meetingLink) {
      return res.status(400).json({
        success: false,
        message: "Meeting link is required for online interview",
      });
    }
    if (mode === "Offline" && !location) {
      return res.status(400).json({
        success: false,
        message: "Location is required for offline interview",
      });
    }
    if (!["Online", "Offline"].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: "Mode must be Online or Offline",
      });
    }
    // Check previous rounds
    const currentRoundIndex = ROUND_ORDER.indexOf(round);

    const previousRounds = ROUND_ORDER.slice(0, currentRoundIndex);

    for (const previousRound of previousRounds) {
      const previousInterview = await Interview.findOne({
        application: application._id,
        round: previousRound,
      });

      if (
        !previousInterview ||
        previousInterview.status !== "Completed" ||
        previousInterview.result !== "Passed"
      ) {
        return res.status(400).json({
          success: false,
          message: `${previousRound} round must be passed before scheduling ${round} round`,
        });
      }
    }

    // Prevent duplicate interview for the same round
    const existingInterview = await Interview.findOne({
      application: application._id,
      round,
    });

    if (existingInterview) {
      return res.status(400).json({
        success: false,
        message: `${round} interview is already scheduled or completed`,
      });
    }
    // Create interview
    const interview = await Interview.create({
      application: application._id,
      student: application.student,
      recruiter: req.user._id,
      interviewDate,
      mode,
      meetingLink,
      location,
      round,
    });
    // Update application status
    application.status = "Interview";

    application.statusHistory.push({
      status: "Interview",
    });

    await application.save();

    return res.status(201).json({
      success: true,
      message: `${round} interview scheduled successfully`,
      interview,
    });
  } catch (error) {
    console.error("Schedule Interview Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An interview for this round already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// GET STUDENT INTERVIEWS
export const getMyInterviews = async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findOne({
      user: req.user._id,
    });

    if (!studentProfile) {
      return res.status(200).json({
        success: true,
        count: 0,
        interviews: [],
      });
    }

    const interviews = await Interview.find({
      student: studentProfile._id,
    })
      .populate("recruiter", "name email")
      .populate({
        path: "application",
        populate: {
          path: "drive",
          populate: {
            path: "company",
            select: "name logo",
          },
        },
      })
      .sort({ interviewDate: 1 });

    return res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    console.error("Get My Interviews Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// GET RECRUITER INTERVIEWS
export const getRecruiterInterview = async (req, res) => {
  try {
    const interviews = await Interview.find({
      recruiter: req.user._id,
    })
      .populate({
        path: "student",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate({
        path: "application",
        populate: {
          path: "drive",
          select: "title jobType salary location",
        },
      })
      .sort({ interviewDate: 1 });

    return res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    console.error("Get Recruiter Interviews Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// UPDATE INTERVIEW RESULT
export const updateInterviewStatus = async (req, res) => {
  try {
    const { result, feedback } = req.body;

    if (!["Passed", "Failed"].includes(result)) {
      return res.status(400).json({
        success: false,
        message: "Result must be Passed or Failed",
      });
    }

    // Find interview
    const interview = await Interview.findOne({
      _id: req.params.id,
      recruiter: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    if (interview.status === "Completed") {
      return res.status(400).json({
        success: false,
        message: "Interview result has already been submitted",
      });
    }

    // Find application and student details
    const application = await Application.findById(interview.application)
      .populate("drive")
      .populate({
        path: "student",
        populate: {
          path: "user",
          select: "name email",
        },
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (application.status !== "Interview") {
      return res.status(400).json({
        success: false,
        message: "Application is not currently in an interview",
      });
    }

    if (!ROUND_ORDER.includes(interview.round)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview round",
      });
    }

    // Verify previous rounds before passing Final
    if (result === "Passed" && interview.round === "Final") {
      const previousRounds = ROUND_ORDER.slice(0, ROUND_ORDER.indexOf("Final"));

      for (const round of previousRounds) {
        const previousInterview = await Interview.findOne({
          application: application._id,
          round,
        });

        if (
          !previousInterview ||
          previousInterview.status !== "Completed" ||
          previousInterview.result !== "Passed"
        ) {
          return res.status(400).json({
            success: false,
            message: `${round} round must be passed before selecting the candidate`,
          });
        }
      }
    }

    // Update interview
    interview.result = result;
    interview.status = "Completed";

    if (feedback !== undefined) {
      interview.feedback = feedback;
    }

    let nextRound = null;

    // Update application
    if (result === "Passed") {
      if (interview.round === "Final") {
        application.status = "Selected";

        application.statusHistory.push({
          status: "Selected",
        });
      } else {
        application.status = "Shortlisted";

        application.statusHistory.push({
          status: "Shortlisted",
        });

        // Find the next round dynamically
        const currentIndex = ROUND_ORDER.indexOf(interview.round);
        nextRound = ROUND_ORDER[currentIndex + 1];

        if (!nextRound) {
          return res.status(400).json({
            success: false,
            message: "Next interview round is not configured",
          });
        }
      }
    } else {
      application.status = "Rejected";

      application.rejectionReasons = [
        `Candidate did not pass the ${interview.round} interview`,
      ];

      application.statusHistory.push({
        status: "Rejected",
      });
    }

    // Save both documents
    await interview.save();
    await application.save();

    // Email notification
    let emailSent = false;
    let emailError = null;

    const studentUser = application.student?.user;

    if (result === "Passed" && studentUser?.email) {
      try {
        const company = await Company.findOne({
          recruiter: req.user._id,
        });

        const companyName = company?.name || "Our Company";
        const studentName = studentUser.name || "Student";
        const jobTitle = application.drive.title;

        let subject;
        let emailHtml;

        if (interview.round === "Final") {
          subject = `Congratulations! You have been selected - ${companyName}`;

          emailHtml = `
            <h2>Congratulations ${studentName}!</h2>

            <p>We are delighted to inform you that you have
            <strong>successfully passed the Final Round</strong>.</p>

            <p>You have been selected for the following position:</p>

            <h3>Selection Details</h3>
            <p><strong>Company:</strong> ${companyName}</p>
            <p><strong>Job Role:</strong> ${jobTitle}</p>
            <p><strong>Completed Round:</strong> Final</p>
            <p><strong>Status:</strong> Selected</p>

            <p>Please log in to your Placement Management Portal
            for further updates regarding your offer.</p>

            <p>Best wishes!</p>
            <p><strong>Placement Management Team</strong></p>
          `;
        } else {
          subject = `Congratulations! Shortlisted for ${nextRound} Round - ${companyName}`;

          emailHtml = `
            <h2>Congratulations ${studentName}!</h2>

            <p>We are pleased to inform you that you have
            successfully passed the <strong>${interview.round} Round</strong>.</p>

            <p>You have been
            <strong>shortlisted for the ${nextRound} Round</strong>
            of the placement selection process.</p>

            <h3>Application Details</h3>
            <p><strong>Company:</strong> ${companyName}</p>
            <p><strong>Job Role:</strong> ${jobTitle}</p>
            <p><strong>Completed Round:</strong> ${interview.round}</p>
            <p><strong>Next Round:</strong> ${nextRound}</p>
            <p><strong>Current Status:</strong> Shortlisted</p>

            <p>Please log in to your Placement Management Portal
            regularly for further updates.</p>

            <p>Best wishes!</p>
            <p><strong>Placement Management Team</strong></p>
          `;
        }

        await sendEmail({
          to: studentUser.email,
          subject,
          html: emailHtml,
        });

        emailSent = true;
      } catch (error) {
        console.error("Interview Result Email Error:", error);
        emailError = error.message;
      }
    } else if (result === "Passed") {
      emailError = "Student email address not found.";
    }

    return res.status(200).json({
      success: true,
      message: `${interview.round} interview result updated successfully`,
      emailSent,
      emailError,
      nextRound,
      interview,
      application,
    });
  } catch (error) {
    console.error("Update Interview Result Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

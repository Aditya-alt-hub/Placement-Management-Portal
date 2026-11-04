import mongoose from "mongoose";
import { Application } from "../models/application.js";
import { PlacementDrive } from "../models/placementDrive.js";
import { StudentProfile } from "../models/studentProfile.js";
import { checkEligibility } from "../utils/eligibility.js";
import { Company } from "../models/company.js";
import { updatePlacementStatus } from "../utils/updatePlacementStatus.js";
import { generateOfferLetter } from "../services/email service/offerLetter.service.js";
import { sendEmail } from "../services/email service/enotification.js";

//api for apply in placment drive
export const applyForPlacementDrive = async (req, res) => {
  try {
    const driveId = req.params.driveId;

    //find student profile
    const student = await StudentProfile.findOne({
      user: req.user._id,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found. Please create your profile first.",
      });
    }

    //find placement drive
    const drive = await PlacementDrive.findById(driveId);

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Placement drive not found",
      });
    }

    //check whether the drive is open or not
    if (drive.status !== "Open") {
      return res.status(404).json({
        success: false,
        message: "This placement drive is not currently open",
      });
    }

    //check application deadline
    if (
      drive.applicationDeadline &&
      new Date() > new Date(drive.applicationDeadline)
    ) {
      return res.status(400).json({
        success: false,
        message: "Application deadline has passed",
      });
    }

    // check if student already applied
    const existingApplication = await Application.findOne({
      student: student._id,
      drive: driveId,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this placement drive",
        application: existingApplication,
      });
    }

    // now run eligibility engine
    const eligibilityResult = await checkEligibility(student, drive);

    //it automatically reject the application due to not fulfill eligibility criteria
    if (!eligibilityResult.eligible) {
      const application = await Application.create({
        student: student._id,
        drive: driveId,
        status: "Rejected",
        statusHistory: [
          {
            status: "Rejected",
          },
        ],
        rejectionReasons: eligibilityResult.reasons,
      });

      return res.status(201).json({
        success: true,
        eligible: false,
        message: "You are not eligible for this placement drive",
        reasons: eligibilityResult.reasons,
        application,
      });
    }

    //if student is eligible

    const application = await Application.create({
      student: student._id,
      drive: driveId,
      status: "Applied",
      statusHistory: [
        {
          status: "Applied",
        },
      ],
      rejectionReasons: [],
    });

    return res.status(201).json({
      success: true,
      eligible: true,
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    console.error("Apply For Placement Drive Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//get my(student) application

export const getMyApplication = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({
      user: req.user._id,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found.",
      });
    }
    const applications = await Application.find({
      student: student._id,
    })
      .populate({
        path: "drive",
        populate: {
          path: "company",
          select: "name logo industry location",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get My Applications Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//get applications for recruiter

export const getRecruiterApplications = async (req, res) => {
  try {
    //first find recruters company
    const company = await Company.findOne({
      recruiter: req.user._id,
    });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Find drives belonging to this company
    const drives = await PlacementDrive.find({
      company: company._id,
    }).select("_id");

    const driveIds = drives.map((drive) => drive._id);

    // Find applications for those drives
    const applications = await Application.find({
      drive: { $in: driveIds },
    })
      // .populate("student", "name email")
      .populate({
        path: "student",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate("drive", "title jobType salary location status")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get Recruiter Applications Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
//update application
export const shortlistApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
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

    const { roundName } = req.body;

    if (!roundName) {
      return res.status(400).json({
        success: false,
        message: "Please provide the next round name.",
      });
    }

    const company = await Company.findOne({
      recruiter: req.user._id,
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Verify application belongs to recruiter's company
    if (application.drive.company.toString() !== company._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to modify this application",
      });
    }

    if (application.status !== "Applied") {
      return res.status(400).json({
        success: false,
        message: `Application cannot be shortlisted because its current status is ${application.status}`,
      });
    }

    // Update application status
    application.status = "Shortlisted";

    application.statusHistory.push({
      status: "Shortlisted",
    });

    application.rejectionReasons = [];

    await application.save();

    // Get student details
    const studentUser = application.student?.user;

    let emailSent = false;
    let emailError = null;

    // Send shortlist notification
    if (studentUser?.email) {
      try {
        await sendEmail({
          to: studentUser.email,
          subject: `Congratulations! You have been shortlisted - ${company.name}`,
          html: `
            <h2>Congratulations ${studentUser.name || "Student"}!</h2>

            <p>We are pleased to inform you that you have been
            <strong>shortlisted for the next round</strong>
            of the placement selection process.</p>

            <h3>Application Details</h3>

            <p><strong>Company:</strong> ${company.name}</p>
            <p><strong>Job Role:</strong> ${application.drive.title}</p>
            <p><strong>Current Status:</strong> Shortlisted</p>

            <p>Please log in to your Placement Management Portal
            regularly for updates regarding the next round.</p>

            <p>Best wishes!</p>
            <p><strong>Placement Management Team</strong></p>
          `,
        });

        emailSent = true;
      } catch (error) {
        console.error("Shortlist Email Error:", error);
        emailError = error.message;
      }
    } else {
      emailError = "Student email address not found.";
    }

    return res.status(200).json({
      success: true,
      message: "Student shortlisted successfully",
      emailSent,
      emailError,
      application,
    });
  } catch (error) {
    console.error("Shortlist Application Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const rejectApplication = async (req, res) => {
  try {
    const { reason } = req.body || {};

    const application = await Application.findById(req.params.id).populate(
      "drive",
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const company = await Company.findOne({
      recruiter: req.user._id,
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    if (application.drive.company.toString() !== company._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to modify this application",
      });
    }

    application.status = "Rejected";
    application.statusHistory.push({
      status: "Rejected",
    });

    application.rejectionReasons = reason
      ? [reason]
      : ["Rejected by recruiter"];

    await application.save();

    return res.status(200).json({
      success: true,
      message: "Application rejected successfully",
      application,
    });
  } catch (error) {
    console.error("Reject Application Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//application status tracking
export const getApplicationStatus = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({
      user: req.user._id,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found.",
      });
    }
    const application = await Application.findOne({
      _id: req.params.id,
      student: student._id,
    }).populate({
      path: "drive",
      populate: {
        path: "company",
        select: "name logo",
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    return res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Get Application Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const issueOffer = async (req, res) => {
  try {
    const { package: offeredPackage } = req.body || {};

    // Validate package
    if (
      offeredPackage === undefined ||
      offeredPackage === null ||
      offeredPackage === "" ||
      !Number.isFinite(Number(offeredPackage)) ||
      Number(offeredPackage) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid annual package greater than zero.",
      });
    }

    // Find application and placement drive
    const application = await Application.findById(req.params.id).populate(
      "drive",
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Verify recruiter company
    const company = await Company.findOne({
      recruiter: req.user._id,
    });

    if (
      !company ||
      !application.drive ||
      application.drive.company.toString() !== company._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to issue this offer.",
      });
    }

    // Only selected students can receive offers
    if (application.status !== "Selected") {
      return res.status(400).json({
        success: false,
        message: "Only selected applicants can receive an offer.",
      });
    }

    if (application.offer?.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "An offer has already been issued or processed.",
      });
    }

    // Retrieve student profile and registered email
    const student = await StudentProfile.findById(application.student).populate(
      "user",
      "name email",
    );

    if (!student || !student.user || !student.user.email) {
      return res.status(404).json({
        success: false,
        message: "Student email address not found.",
      });
    }

    // Generate PDF offer letter
    const offerPdf = await generateOfferLetter({
      studentName: student.user.name || "Student",
      companyName: company.name,
      jobTitle: application.drive.title,
      packageAmount: Number(offeredPackage),
      location: application.drive.location,
      issueDate: new Date(),
    });

    // Save offer in MongoDB first
    application.offer.status = "Offered";
    application.offer.package = Number(offeredPackage);
    application.offer.offeredAt = new Date();
    application.offer.respondedAt = null;

    await application.save();

    // Send offer letter through email
    let emailSent = false;
    let emailError = null;

    try {
      await sendEmail({
        to: student.user.email,
        subject: `Employment Offer - ${application.drive.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Congratulations, ${student.user.name || "Student"}!</h2>

            <p>
              You have received an employment offer from
              <strong>${company.name}</strong>.
            </p>

            <p><strong>Position:</strong> ${application.drive.title}</p>
            <p><strong>Annual Package:</strong> ${Number(offeredPackage).toLocaleString("en-IN")} INR</p>

            <p>
              Your offer letter is attached to this email.
              Please log in to the Placement Management Portal
              to accept or decline the offer.
            </p>

            <p>Regards,<br/>${company.name} Recruitment Team</p>
          </div>
        `,
        attachments: [
          {
            filename: "Offer-Letter.pdf",
            content: offerPdf,
            contentType: "application/pdf",
          },
        ],
      });

      emailSent = true;
    } catch (emailErrorValue) {
      emailError = emailErrorValue.message;

      console.error("Offer Email Failed:", emailErrorValue);
    }

    return res.status(200).json({
      success: true,
      message: emailSent
        ? "Offer issued and email sent successfully."
        : "Offer issued successfully, but email delivery failed.",
      emailSent,
      emailError: emailSent ? null : emailError,
      application,
    });
  } catch (error) {
    console.error("Issue Offer Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const respondToOffer = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { decision } = req.body || {};

    if (!["Accepted", "Declined"].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "Decision must be Accepted or Declined.",
      });
    }

    let updatedApplication;
    let placementStatus;

    // Database transaction
    await session.withTransaction(async () => {
      const studentProfile = await StudentProfile.findOne({
        user: req.user._id,
      }).session(session);

      if (!studentProfile) {
        throw Object.assign(new Error("Student profile not found."), {
          statusCode: 404,
        });
      }

      const application = await Application.findOne({
        _id: req.params.id,
        student: studentProfile._id,
      }).session(session);

      if (!application) {
        throw Object.assign(new Error("Application not found."), {
          statusCode: 404,
        });
      }

      if (application.offer?.status !== "Offered") {
        throw Object.assign(
          new Error("There is no pending offer to respond to."),
          { statusCode: 400 },
        );
      }

      // Prevent accepting multiple offers
      if (decision === "Accepted") {
        const existingAcceptedOffer = await Application.findOne({
          student: studentProfile._id,
          "offer.status": "Accepted",
          _id: { $ne: application._id },
        }).session(session);

        if (existingAcceptedOffer) {
          throw Object.assign(
            new Error("You have already accepted another placement offer."),
            { statusCode: 400 },
          );
        }

        application.status = "Placed";

        application.statusHistory.push({
          status: "Placed",
        });

        studentProfile.placementStatus = "Placed";
      }

      application.offer.status = decision;
      application.offer.respondedAt = new Date();

      await application.save({ session });

      if (decision === "Accepted") {
        await studentProfile.save({ session });
      }

      updatedApplication = application;
      placementStatus = studentProfile.placementStatus;
    });

    // Email notification AFTER successful transaction
    let emailSent = false;
    let emailError = null;

    try {
      // Fetch application details
      const notificationApplication = await Application.findById(
        updatedApplication._id,
      )
        .populate({
          path: "student",
          populate: {
            path: "user",
            select: "name email",
          },
        })
        .populate({
          path: "drive",
          select: "title company",
        });

      const studentUser = notificationApplication?.student?.user;

      // Find company and recruiter
      const company = await Company.findById(
        notificationApplication.drive.company,
      ).populate("recruiter", "name email");

      const recruiter = company?.recruiter;

      if (!recruiter?.email) {
        throw new Error("Recruiter email address not found.");
      }

      const studentName = studentUser?.name || "Student";
      const companyName = company.name;
      const jobTitle = notificationApplication.drive.title;

      const isAccepted = decision === "Accepted";

      const subject = isAccepted
        ? `Offer Accepted - ${studentName}`
        : `Offer Declined - ${studentName}`;

      const emailHtml = `
        <h2>Offer Response Notification</h2>

        <p>Hello ${recruiter.name || "Recruiter"},</p>

        <p>
          ${studentName} has
          <strong>${isAccepted ? "accepted" : "declined"}</strong>
          the placement offer issued by ${companyName}.
        </p>

        <h3>Application Details</h3>

        <p><strong>Student:</strong> ${studentName}</p>
        <p><strong>Company:</strong> ${companyName}</p>
        <p><strong>Job Role:</strong> ${jobTitle}</p>
        <p><strong>Package:</strong> ₹${Number(
          notificationApplication.offer.package,
        ).toLocaleString("en-IN")}</p>
        <p><strong>Offer Decision:</strong> ${decision}</p>
        <p><strong>Response Date:</strong> ${new Date().toLocaleString("en-IN")}</p>

        <p>Please log in to your Placement Management Portal
        to view the application details.</p>

        <p>
          <strong>Placement Management Portal</strong>
        </p>
      `;

      await sendEmail({
        to: recruiter.email,
        subject,
        html: emailHtml,
      });

      emailSent = true;
    } catch (emailErrorInstance) {
      console.error("Recruiter Offer Notification Error:", emailErrorInstance);
      emailError = emailErrorInstance.message;
    }

    return res.status(200).json({
      success: true,
      message:
        decision === "Accepted"
          ? "Offer accepted successfully. Congratulations!"
          : "Offer declined successfully.",
      emailSent,
      emailError,
      placementStatus,
      application: updatedApplication,
    });
  } catch (error) {
    console.error("Respond To Offer Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  } finally {
    await session.endSession();
  }
};

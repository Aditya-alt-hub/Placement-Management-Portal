import { Announcement } from "../models/announcement.js";
import { StudentProfile } from "../models/studentProfile.js";
import { sendEmail } from "../services/email service/enotification.js";

// Prevent HTML injection in announcement content
const escapeHtml = (value = "") => {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });
};

// Create and send announcement
export const createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      subject,
      message,
      recipientType,
      recipients = [],
    } = req.body;

    // Validate required fields
    if (!title || !subject || !message || !recipientType) {
      return res.status(400).json({
        success: false,
        message: "Title, subject, message and recipient type are required",
      });
    }

    if (!["All Students", "Selected Students"].includes(recipientType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipient type",
      });
    }

    if (
      recipientType === "Selected Students" &&
      (!Array.isArray(recipients) || recipients.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one student",
      });
    }

    // Find students
    let studentProfiles;

    if (recipientType === "All Students") {
      studentProfiles = await StudentProfile.find().populate({
        path: "user",
        select: "name email isActive",
      });
    } else {
      studentProfiles = await StudentProfile.find({
        _id: { $in: recipients },
      }).populate({
        path: "user",
        select: "name email isActive",
      });

      // Ensure every requested student exists
      if (studentProfiles.length !== new Set(recipients).size) {
        return res.status(400).json({
          success: false,
          message: "One or more selected students were not found",
        });
      }
    }

    // Only active students with valid email addresses
    const validStudents = studentProfiles.filter(
      (student) => student.user && student.user.isActive && student.user.email,
    );

    const missingEmailCount = studentProfiles.length - validStudents.length;

    if (validStudents.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No active students with valid email addresses found",
      });
    }

    // Save announcement before sending emails
    const announcement = await Announcement.create({
      title,
      subject,
      message,
      recipientType,
      recipients: studentProfiles.map((student) => student._id),
      sentBy: req.user._id,
      totalRecipients: studentProfiles.length,
      successfulEmails: 0,
      failedEmails: missingEmailCount,
      status: "Sending",
    });

    const safeTitle = escapeHtml(title);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; padding: 25px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #1d4ed8;">${safeTitle}</h2>

        <div style="font-size: 15px; line-height: 1.7; color: #333;">
          ${safeMessage}
        </div>

        <hr style="margin-top: 30px; border: 0; border-top: 1px solid #ddd;" />

        <p style="font-size: 13px; color: #777;">
          This is an official announcement from the Placement Management Portal.
        </p>
      </div>
    `;

    let successfulEmails = 0;
    let failedEmails = missingEmailCount;

    // Send individual emails in batches of 5
    const batchSize = 5;

    for (let i = 0; i < validStudents.length; i += batchSize) {
      const batch = validStudents.slice(i, i + batchSize);

      const results = await Promise.allSettled(
        batch.map((student) =>
          sendEmail({
            to: student.user.email,
            subject,
            html,
          }),
        ),
      );

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          successfulEmails++;
        } else {
          failedEmails++;

          console.error(
            `Announcement email failed for ${batch[index].user.email}:`,
            result.reason,
          );
        }
      });
    }

    // Update announcement delivery statistics
    announcement.successfulEmails = successfulEmails;
    announcement.failedEmails = failedEmails;

    if (failedEmails === 0) {
      announcement.status = "Sent";
    } else if (successfulEmails > 0) {
      announcement.status = "Partially Sent";
    } else {
      announcement.status = "Failed";
    }

    announcement.sentAt = new Date();

    await announcement.save();

    return res.status(201).json({
      success: true,
      message: "Announcement sending process completed",
      announcement: {
        id: announcement._id,
        title: announcement.title,
        recipientType: announcement.recipientType,
        totalRecipients: announcement.totalRecipients,
        successfulEmails: announcement.successfulEmails,
        failedEmails: announcement.failedEmails,
        status: announcement.status,
        sentAt: announcement.sentAt,
      },
    });
  } catch (error) {
    console.error("Create Announcement Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create announcement",
    });
  }
};

// Get announcement history
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate("sentBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: announcements.length,
      announcements,
    });
  } catch (error) {
    console.error("Get Announcements Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch announcements",
    });
  }
};

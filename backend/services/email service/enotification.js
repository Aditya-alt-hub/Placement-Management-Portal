import transporter from "../../config/email.js";
import dotenv from "dotenv";
dotenv.config();

export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    if (!to || !String(to).trim()) {
      throw new Error("Recipient email address is missing");
    }

    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: String(to).trim(),
      subject,
      html,
      attachments,
    });

    console.log("Email sent successfully:", result.messageId);

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error) {
    console.error("Email Sending Error:", error);
    throw error;
  }
};

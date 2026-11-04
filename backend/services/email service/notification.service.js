import { sendEmail } from "./email service/enotification.js";

//Student shortlist notification
export const sendShortlistNotification = async ({
  student,
  company,
  jobTitle,
  nextRound,
}) => {
  return sendEmail({
    to: student.email,
    subject: `Congratulations! Shortlisted for ${nextRound} Round - ${company}`,
    html: `
      <h2>Congratulations ${student.name || "Student"}!</h2>
      <p>You have been shortlisted for the <strong>${nextRound} Round</strong>.</p>
      <p><strong>Company:</strong> ${company}</p>
      <p><strong>Job Role:</strong> ${jobTitle}</p>
      <p>Please check your placement portal for further updates.</p>
      <p>Best wishes!<br/>Placement Management Team</p>
    `,
  });
};

//Interview result notification
export const sendInterviewResultNotification = async ({
  student,
  company,
  jobTitle,
  completedRound,
  nextRound,
}) => {
  const isSelected = completedRound === "Final";

  return sendEmail({
    to: student.email,
    subject: isSelected
      ? `Congratulations! You have been selected - ${company}`
      : `Shortlisted for ${nextRound} Round - ${company}`,
    html: `
      <h2>Congratulations ${student.name || "Student"}!</h2>

      ${
        isSelected
          ? `<p>You have successfully passed the Final Round and have been <strong>Selected</strong>.</p>`
          : `<p>You have successfully passed the <strong>${completedRound} Round</strong>.</p>
             <p>You are shortlisted for the <strong>${nextRound} Round</strong>.</p>`
      }

      <h3>Application Details</h3>
      <p><strong>Company:</strong> ${company}</p>
      <p><strong>Job Role:</strong> ${jobTitle}</p>
      <p><strong>Completed Round:</strong> ${completedRound}</p>

      <p>Please check your placement portal for further updates.</p>
      <p>Best wishes!<br/>Placement Management Team</p>
    `,
  });
};

// 3. Recruiter offer response notification
export const sendOfferResponseNotification = async ({
  recruiter,
  studentName,
  company,
  jobTitle,
  packageAmount,
  decision,
}) => {
  const accepted = decision === "Accepted";

  return sendEmail({
    to: recruiter.email,
    subject: accepted
      ? `Offer Accepted - ${studentName}`
      : `Offer Declined - ${studentName}`,
    html: `
      <h2>Offer Response Notification</h2>

      <p>Hello ${recruiter.name || "Recruiter"},</p>

      <p>
        ${studentName} has
        <strong>${decision.toLowerCase()}</strong>
        your placement offer.
      </p>

      <h3>Application Details</h3>
      <p><strong>Student:</strong> ${studentName}</p>
      <p><strong>Company:</strong> ${company}</p>
      <p><strong>Job Role:</strong> ${jobTitle}</p>
      <p><strong>Package:</strong> ₹${Number(packageAmount).toLocaleString("en-IN")}</p>
      <p><strong>Decision:</strong> ${decision}</p>

      <p>Please log in to your Placement Management Portal for details.</p>
      <p>Placement Management Team</p>
    `,
  });
};

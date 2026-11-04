import transporter from "../config/email.js";

try {
  await transporter.verify();

  console.log("SMTP connection successful!");
} catch (error) {
  console.error("SMTP connection failed:");
  console.error(error);
}

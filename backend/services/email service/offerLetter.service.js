import PDFDocument from "pdfkit";

export const generateOfferLetter = ({
  studentName,
  companyName,
  jobTitle,
  packageAmount,
  location,
  issueDate = new Date(),
}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 55,
      });

      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));

      doc.on("end", () => {
        resolve(Buffer.concat(chunks));
      });

      doc.on("error", reject);

      // Header
      doc
        .fontSize(22)
        .font("Helvetica-Bold")
        .text(companyName, { align: "center" });

      doc.moveDown(0.5);

      doc
        .fontSize(11)
        .font("Helvetica")
        .text("OFFICIAL OFFER LETTER", { align: "center" });

      doc.moveDown(2);

      // Date
      doc
        .fontSize(11)
        .text(`Date: ${new Date(issueDate).toLocaleDateString("en-IN")}`, {
          align: "right",
        });

      doc.moveDown(2);

      // Candidate details
      doc.font("Helvetica-Bold").text(`Dear ${studentName},`);

      doc.moveDown();

      doc
        .font("Helvetica")
        .text(
          `We are pleased to present this employment offer for the position of ${jobTitle} at ${companyName}.`,
        );

      doc.moveDown();

      doc.font("Helvetica-Bold").text("Offer Details");

      doc.moveDown(0.5);

      doc
        .font("Helvetica")
        .text(`Candidate Name: ${studentName}`)
        .text(`Company: ${companyName}`)
        .text(`Position: ${jobTitle}`)
        .text(
          `Annual Package: ${Number(packageAmount).toLocaleString("en-IN")} INR`,
        )
        .text(`Location: ${location || "As communicated by the company"}`);

      doc.moveDown();

      doc.text(
        "The employment terms, joining date, probation period, benefits and other conditions will be governed by the official terms communicated by the company.",
      );

      doc.moveDown();

      doc.text(
        "Please review the offer details and contact the recruiting company if you require clarification.",
      );

      doc.moveDown(2);

      doc.font("Helvetica-Bold").text("Regards,");

      doc.font("Helvetica").text("Recruitment Team").text(companyName);

      doc.moveDown(3);

      doc
        .fontSize(9)
        .fillColor("gray")
        .text(
          "Generated through the Placement Management Portal. This document should be reviewed and authorized by the recruiting company before being treated as its official employment offer.",
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

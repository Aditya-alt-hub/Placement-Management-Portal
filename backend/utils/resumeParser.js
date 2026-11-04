import { PDFParse } from "pdf-parse";

export const extractResumeText = async (buffer) => {
  let parser;

  try {
    parser = new PDFParse({
      data: new Uint8Array(buffer),
    });

    const result = await parser.getText();
    const text = result.text?.trim();

    if (!text) {
      throw new Error(
        "No readable text found in the resume PDF. It may be scanned.",
      );
    }

    return text;
  } catch (error) {
    console.error("Resume PDF parsing error:", error);
    throw new Error("Failed to extract text from resume PDF.");
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
};

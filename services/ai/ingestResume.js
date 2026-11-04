import { extractResumeText } from "../../utils/resumeParser.js";
import { splitResumeText } from "./textSplitter.js";
import { prepareResumeDocuments } from "./prepareDocuments.js";
import { saveResumeDocuments } from "./vectorStore.js";

export const ingestResume = async (pdfBuffer, userId) => {
  if (!pdfBuffer || !userId) {
    throw new Error("Resume PDF and student user ID are required.");
  }

  // Extract text from the PDF
  const resumeText = await extractResumeText(pdfBuffer);

  console.log("[Resume RAG] Extracted characters:", resumeText.length);

  // Split the resume into chunks
  const chunks = await splitResumeText(resumeText);

  console.log("[Resume RAG] Chunks created:", chunks.length);

  // Attach student-specific metadata
  const documents = prepareResumeDocuments(chunks, userId);

  console.log("[Resume RAG] Metadata sample:", documents[0]?.metadata);

  // Store the chunks in Qdrant
  await saveResumeDocuments(documents);

  console.log("[Resume RAG] Ingestion completed successfully.");

  return {
    success: true,
    chunksIndexed: documents.length,
  };
};

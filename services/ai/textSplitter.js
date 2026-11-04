import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 150,
});

export const splitResumeText = async (text) => {
  if (!text || !text.trim()) {
    throw new Error("Resume text cannot be empty.");
  }

  return await splitter.createDocuments([text]);
};

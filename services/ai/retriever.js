import { getVectorStore } from "./vectorStore.js";

export const getStudentResumeRetriever = async (userId) => {
  if (!userId) {
    throw new Error("Authenticated student user ID is required.");
  }

  const vectorStore = await getVectorStore();

  return vectorStore.asRetriever({
    k: 4,
    filter: {
      must: [
        {
          key: "metadata.userId",
          match: {
            value: userId.toString(),
          },
        },
        {
          key: "metadata.source",
          match: {
            value: "resume",
          },
        },
      ],
    },
  });
};

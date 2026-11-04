export const prepareResumeDocuments = (documents, userId) => {
  if (!userId) {
    throw new Error("Student user ID is required.");
  }

  return documents.map((doc, index) => ({
    ...doc,
    metadata: {
      ...doc.metadata,
      userId: userId.toString(),
      source: "resume",
      chunkIndex: index,
    },
  }));
};

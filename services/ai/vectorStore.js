import { QdrantClient } from "@qdrant/js-client-rest";
import { QdrantVectorStore } from "@langchain/qdrant";
import { embeddings } from "./embeddings.js";
import dotenv from "dotenv";

dotenv.config();

const COLLECTION = "placement_student_knowledge";

const getClient = () => {
  if (!process.env.QDRANT_CLUSTER_ENDPOINT) {
    throw new Error("QDRANT_CLUSTER_ENDPOINT is missing.");
  }

  return new QdrantClient({
    url: process.env.QDRANT_CLUSTER_ENDPOINT,
    apiKey: process.env.QDRANT_API_KEY,
  });
};

const ensureCollection = async (client) => {
  const { exists } = await client.collectionExists(COLLECTION);

  if (!exists) {
    // Determine the vector dimension from the configured embedding model.
    const sampleVector = await embeddings.embedQuery(
      "Placement portal collection initialization",
    );

    await client.createCollection(COLLECTION, {
      vectors: {
        size: sampleVector.length,
        distance: "Cosine",
      },
    });
  }
};

export const getVectorStore = async () => {
  const client = getClient();

  await ensureCollection(client);
  await ensurePayloadIndexes(client);

  return QdrantVectorStore.fromExistingCollection(embeddings, {
    client,
    collectionName: COLLECTION,
  });
};

export const saveResumeDocuments = async (documents) => {
  if (!documents?.length) {
    throw new Error("No resume chunks provided.");
  }

  const userId = documents[0].metadata?.userId;

  if (!userId) {
    throw new Error("Student user ID is missing from document metadata.");
  }

  // Ensure all chunks belong to the same student.
  const validOwner = documents.every(
    (doc) =>
      doc.metadata?.userId === userId && doc.metadata?.source === "resume",
  );

  if (!validOwner) {
    throw new Error("Invalid or inconsistent resume metadata.");
  }

  const client = getClient();

  await ensureCollection(client);

  // Remove this student's previous resume chunks only.
  await client.delete(COLLECTION, {
    wait: true,
    filter: {
      must: [
        {
          key: "metadata.userId",
          match: { value: userId },
        },
        {
          key: "metadata.source",
          match: { value: "resume" },
        },
      ],
    },
  });

  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: process.env.QDRANT_CLUSTER_ENDPOINT,
      apiKey: process.env.QDRANT_API_KEY,
      collectionName: COLLECTION,
    },
  );

  await vectorStore.addDocuments(documents);

  return vectorStore;
};

const ensurePayloadIndexes = async (client) => {
  const indexes = [
    { field_name: "metadata.userId", field_schema: "keyword" },
    { field_name: "metadata.source", field_schema: "keyword" },
  ];

  for (const index of indexes) {
    try {
      await client.createPayloadIndex(COLLECTION, {
        field_name: index.field_name,
        field_schema: index.field_schema,
        wait: true,
      });
    } catch (error) {
      // Do not silently ignore unrelated index-creation errors.
      const message = String(error?.message ?? error);

      if (
        !message.toLowerCase().includes("already exists") &&
        !message.toLowerCase().includes("already indexed")
      ) {
        throw error;
      }
    }
  }
};

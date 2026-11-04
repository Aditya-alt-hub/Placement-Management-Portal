import { ChatGroq } from "@langchain/groq";
import dotenv from "dotenv";

dotenv.config();

const groq = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
  temperature: 0,
  maxRetries: 2,
});

export const getModel = async (agent = "chat") => {
  switch (agent) {
    case "chat":
    case "analysis":
      return groq;

    default:
      return groq;
  }
};

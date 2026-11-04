import { Annotation, StateGraph, START, END } from "@langchain/langgraph";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { getProfileContext } from "../ai/profileContext.js";
import { getStudentResumeRetriever } from "../ai/retriever.js";

import {
  SYSTEM_PROMPT,
  buildAnalysisPrompt,
  buildScorePrompt,
} from "../ai/prompt.js";

import { getModel } from "../../config/llm.js";

const AnalysisState = Annotation.Root({
  userId: Annotation(),
  question: Annotation(),
  profile: Annotation(),
  resumeChunks: Annotation(),
  answer: Annotation(),
  scores: Annotation(),
});

//Fetch structured profile from MongoDB
const loadProfile = async (state) => {
  const profile = await getProfileContext(state.userId);

  return { profile };
};
const retrieveResume = async (state) => {
  const userId = state.userId?.toString();

  if (!userId) {
    throw new Error("Student user ID is missing.");
  }

  const retriever = await getStudentResumeRetriever(userId);

  const query =
    state.question || "Summarize my resume, skills, education, and projects.";

  const documents = await retriever.invoke(query);

  console.log("[Resume RAG] Retrieval results:", {
    requestedUserId: userId,
    queryLength: query.length,
    retrievedChunks: documents.length,
    metadata: documents.map((doc) => ({
      userId: doc.metadata?.userId,
      source: doc.metadata?.source,
      chunkIndex: doc.metadata?.chunkIndex,
    })),
  });

  return {
    resumeChunks: documents.map((doc) => doc.pageContent),
  };
};

const clampScore = (value) =>
  Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : 0;

const calculateProfileScore = (profile) => {
  const education = profile?.education ?? {};
  const skills = profile?.skills ?? [];
  const projects = profile?.projects ?? [];

  const hasValue = (value) =>
    value !== undefined &&
    value !== null &&
    value !== "" &&
    value !== "Not provided";

  const profileCompletenessFields = [
    education.course,
    education.branch,
    education.graduationYear,
  ];

  const educationFields = [
    education.tenthPercentage,
    education.twelfthPercentage,
    education.cgpa,
  ];

  const completeness =
    (profileCompletenessFields.filter(hasValue).length / 3) * 100;

  const educationScore = (educationFields.filter(hasValue).length / 3) * 100;

  const skillsScore = Math.min(skills.length / 8, 1) * 100;
  const projectsScore = Math.min(projects.length / 3, 1) * 100;

  const score =
    completeness * 0.25 +
    educationScore * 0.2 +
    skillsScore * 0.25 +
    projectsScore * 0.3;

  return {
    profileScore: clampScore(score),
    profileBreakdown: {
      profileCompleteness: clampScore(completeness),
      educationInformation: clampScore(educationScore),
      skillsListed: clampScore(skillsScore),
      projectsListed: clampScore(projectsScore),
    },
  };
};

const parseModelJson = (content) => {
  const text = typeof content === "string" ? content : JSON.stringify(content);

  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  return JSON.parse(cleaned);
};

const calculateWeightedScore = (breakdown) => {
  const weights = {
    structureAndReadability: 0.2,
    skillsEvidence: 0.25,
    projects: 0.25,
    experienceAndAchievements: 0.2,
    consistency: 0.1,
  };

  const values = Object.entries(weights).map(([key, weight]) => {
    const value = breakdown?.[key];

    if (
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      value < 0 ||
      value > 100
    ) {
      return null;
    }

    return value * weight;
  });

  // Do not manufacture a score if any required category is missing.
  if (values.some((value) => value === null)) {
    return null;
  }

  return clampScore(values.reduce((sum, value) => sum + value, 0));
};

//ask the llm to analyze the profile and resume chunks
const analyzeStudentNode = async (state) => {
  const model = await getModel("chat");

  console.log("Model type:", model?.constructor?.name);
  console.log("Model invoke:", typeof model?.invoke);

  const prompt = buildAnalysisPrompt({
    profile: state.profile,
    resumeChunks: state.resumeChunks ?? [],
    question: state.question,
  });

  const response = await model.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(prompt),
  ]);

  const answer =
    typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);

  return { answer };
};

const scoreStudentNode = async (state) => {
  const profileScores = calculateProfileScore(state.profile);
  const model = await getModel("chat");

  try {
    const response = await model.invoke([
      new SystemMessage(
        "You evaluate resume quality using supplied evidence. Return valid JSON only.",
      ),
      new HumanMessage(
        buildScorePrompt({
          profile: state.profile,
          resumeChunks: state.resumeChunks ?? [],
        }),
      ),
    ]);

    const parsed = parseModelJson(response.content);
    const resumeBreakdown = parsed.resumeBreakdown ?? {};

    const resumeScore = calculateWeightedScore(resumeBreakdown);

    // The overall score requires both component scores.
    const overallScore =
      resumeScore === null
        ? null
        : clampScore(profileScores.profileScore * 0.4 + resumeScore * 0.6);

    return {
      scores: {
        ...profileScores,
        resumeScore,
        overallScore,
        resumeBreakdown: resumeScore === null ? null : resumeBreakdown,
        evidence: parsed.evidence ?? {
          strengths: [],
          improvements: [],
        },
      },
    };
  } catch (error) {
    console.error("[Student Scoring] Failed:", error.message);

    return {
      scores: {
        ...profileScores,
        resumeScore: null,
        overallScore: null,
        resumeBreakdown: null,
        evidence: {
          strengths: [],
          improvements: [
            "Resume scoring could not be completed. Please try again.",
          ],
        },
      },
    };
  }
};

//build and complile the state graph
const workflow = new StateGraph(AnalysisState)
  .addNode("loadProfile", loadProfile)
  .addNode("retrieveResume", retrieveResume)
  .addNode("analyzeStudent", analyzeStudentNode)
  .addNode("scoreStudent", scoreStudentNode)
  .addEdge(START, "loadProfile")
  .addEdge("loadProfile", "retrieveResume")
  .addEdge("retrieveResume", "analyzeStudent")
  .addEdge("analyzeStudent", "scoreStudent")
  .addEdge("scoreStudent", END);

export const studentAnalysisGraph = workflow.compile();

export const analyzeStudent = async ({ userId, question }) => {
  if (!userId) {
    throw new Error("Authenticated student user ID is required.");
  }
  const result = await studentAnalysisGraph.invoke({
    userId: userId.toString(),
    question: question?.trim() || "",
    profile: null,
    resumeChunks: [],
    answer: "",
  });

  return {
    answer: result.answer,
    scores: result.scores ?? null,
  };
};

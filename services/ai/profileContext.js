import { StudentProfile } from "../../models/studentProfile.js";

export const getProfileContext = async (userId) => {
  const profile = await StudentProfile.findOne({
    user: userId,
  }).select(
    "course branch graduationYear tenthPercentage twelfthPercentage cgpa skills projects placementStatus",
  );

  if (!profile) {
    throw new Error("Student profile not found");
  }

  return {
    education: {
      course: profile.course ?? "Not provided",
      branch: profile.branch ?? "Not provided",
      graduationYear: profile.graduationYear ?? "Not provided",
      tenthPercentage: profile.tenthPercentage ?? "Not provided",
      twelfthPercentage: profile.twelfthPercentage ?? "Not provided",
      cgpa: profile.cgpa ?? "Not provided",
    },

    skills: profile.skills ?? [],

    projects: (profile.projects ?? []).map((project) => ({
      title: project.title,
      description: project.description,
      technologies: project.technologies ?? [],
      github: project.github ?? null,
    })),

    placementStatus: profile.placementStatus ?? "Not provided",
  };
};

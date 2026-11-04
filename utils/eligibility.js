export const checkEligibility = async (student, drive) => {
  const reasons = [];

  const eligibility = drive.eligibility || {};

  //minimum cgpa
  if (eligibility.minCgpa !== undefined && student.cgpa < eligibility.minCgpa) {
    reasons.push(
      `Minimum CGPA required is ${eligibility.minCgpa},but your CGPA is ${student.cgpa}`,
    );
  }
  //minimum 10th percentage
  if (
    eligibility.minTenthPercentage !== undefined &&
    student.tenthPercentage < eligibility.minTenthPercentage
  ) {
    reasons.push(
      `Minimum CGPA required is ${eligibility.minTenthPercentage},but your Percentage is ${student.tenthPercentage}`,
    );
  }
  // minimum 12th percentage
  if (
    eligibility.minTwelfthPercentage !== undefined &&
    student.twelfthPercentage < eligibility.minTwelfthPercentage
  ) {
    reasons.push(
      `Minimum 12th percentage required is ${eligibility.minTwelfthPercentage}%, but your percentage is ${student.twelfthPercentage}%`,
    );
  }
  //allowed branches
  if (eligibility.allowedBranches && eligibility.allowedBranches.length > 0) {
    const studentBranch = student.branch?.trim().toLowerCase();

    const allowedBranches = eligibility.allowedBranches.map((branch) =>
      branch.trim().toLowerCase(),
    );

    if (!allowedBranches.includes(studentBranch)) {
      reasons.push(
        `Your branch (${student.branch}) is not eligible for this placement drive`,
      );
    }
  }

  //Graduation Year
  if (
    eligibility.graduationYear !== undefined &&
    student.graduationYear !== eligibility.graduationYear
  ) {
    reasons.push(
      `Graduation year required is ${eligibility.graduationYear}, but your graduation year is ${student.graduationYear}`,
    );
  }

  //Backlogs
  if (eligibility.backlogsAllowed === false && student.backlogs > 0) {
    reasons.push(
      `Backlogs are not allowed. You currently have ${student.backlogs} backlog(s)`,
    );
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
};

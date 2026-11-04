import { StudentProfile } from "../models/studentProfile.js";
import { Application } from "../models/application.js";
import { Interview } from "../models/interviewDrive.js";
import { PlacementDrive } from "../models/placementDrive.js";
import { Company } from "../models/company.js";

//Admin Placement Overview Analytics
export const getPlacementOverview = async (req, res) => {
  try {
    //fetch basic counts and accepted placement statistics
    const [
      totalStudents,
      totalCompanies,
      totalDrives,
      totalApplications,
      approvedCompanies,
      openDrives,
      placementStats,
    ] = await Promise.all([
      //total registered students profile
      StudentProfile.countDocuments(),

      //total registered companies
      Company.countDocuments(),

      //total placement drives
      PlacementDrive.countDocuments(),

      //total applications
      Application.countDocuments(),

      //approved companies
      Company.countDocuments({ isApproved: true }),

      //currewntly open placement drives
      PlacementDrive.countDocuments({ status: "Open" }),

      //acceopted offer statistics
      Application.aggregate([
        {
          $match: {
            "offer.status": "Accepted",
            "offer.package": { $gt: 0 },
          },
        },

        // One record per student, preventing duplicate counting
        {
          $sort: {
            "offer.respondedAt": -1,
          },
        },
        {
          $group: {
            _id: "$student",
            package: { $first: "$offer.package" },
          },
        },
        //calculate placement and packages statistics
        {
          $group: {
            _id: null,
            placedStudents: { $sum: 1 },
            averagePackage: { $avg: "$package" },
            highestPackage: { $max: "$package" },
            lowestPackage: { $min: "$package" },
          },
        },
      ]),
    ]);

    const stats = placementStats[0] || {
      placedStudents: 0,
      averagePackage: 0,
      highestPackage: 0,
      lowestPackage: 0,
    };

    const notPlacedStudents = totalStudents - stats.placedStudents;

    const placementRate =
      totalStudents > 0
        ? Number(((stats.placedStudents / totalStudents) * 100).toFixed(2))
        : 0;

    return res.status(200).json({
      success: true,
      message: "Placement analytics fetched successfully",

      overview: {
        totalStudents,
        placedStudents: stats.placedStudents,
        notPlacedStudents,
        placementRate,

        averagePackage: Number((stats.averagePackage || 0).toFixed(2)),

        highestPackage: stats.highestPackage || 0,
        lowestPackage: stats.lowestPackage || 0,

        totalCompanies,
        approvedCompanies,
        totalDrives,
        openDrives,
        totalApplications,
      },
    });
  } catch (error) {
    console.error("Admin Placement Analytics Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch placement analytics",
    });
  }
};

//Branch-wise Placement Analytics

export const getBranchAnalytics = async (req, res) => {
  try {
    const branchStats = await StudentProfile.aggregate([
      {
        $lookup: {
          from: "applications",
          let: { studentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$student", "$$studentId"] },
                    { $eq: ["$offer.status", "Accepted"] },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: "acceptedOffers",
        },
      },
      {
        $group: {
          _id: { $ifNull: ["$branch", "Unknown"] },
          totalStudents: { $sum: 1 },
          placedStudents: {
            $sum: {
              $cond: [{ $gt: [{ $size: "$acceptedOffers" }, 0] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          branch: "$_id",
          totalStudents: 1,
          placedStudents: 1,
          notPlacedStudents: {
            $subtract: ["$totalStudents", "$placedStudents"],
          },
          placementRate: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: ["$placedStudents", "$totalStudents"],
                  },
                  100,
                ],
              },
              2,
            ],
          },
        },
      },
      { $sort: { placementRate: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      count: branchStats.length,
      branchStats,
    });
  } catch (error) {
    console.error("Branch Analytics Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch branch analytics",
    });
  }
};

//company-wise placement analytics
export const getCompanyAnalytics = async (req, res) => {
  try {
    const companyStats = await PlacementDrive.aggregate([
      {
        $lookup: {
          from: "applications",
          let: { driveId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$drive", "$$driveId"] },
                    { $eq: ["$offer.status", "Accepted"] },
                  ],
                },
              },
            },
            {
              $project: {
                student: 1,
                package: "$offer.package",
              },
            },
          ],
          as: "acceptedApplications",
        },
      },
      {
        $unwind: "$acceptedApplications",
      },
      {
        $group: {
          _id: "$company",
          students: {
            $addToSet: "$acceptedApplications.student",
          },
          totalAcceptedOffers: {
            $sum: 1,
          },
          averagePackage: {
            $avg: "$acceptedApplications.package",
          },
          highestPackage: {
            $max: "$acceptedApplications.package",
          },
          lowestPackage: {
            $min: "$acceptedApplications.package",
          },
        },
      },
      {
        $lookup: {
          from: "companies",
          localField: "_id",
          foreignField: "_id",
          as: "company",
        },
      },
      {
        $unwind: "$company",
      },
      {
        $project: {
          _id: 0,
          companyId: "$company._id",
          companyName: "$company.name",
          totalPlacedStudents: {
            $size: "$students",
          },
          totalAcceptedOffers: 1,
          averagePackage: {
            $round: [{ $ifNull: ["$averagePackage", 0] }, 2],
          },
          highestPackage: {
            $ifNull: ["$highestPackage", 0],
          },
          lowestPackage: {
            $ifNull: ["$lowestPackage", 0],
          },
        },
      },
      {
        $sort: {
          totalPlacedStudents: -1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      count: companyStats.length,
      companyStats,
    });
  } catch (error) {
    console.error("Company Analytics Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch company analytics",
    });
  }
};

//batch-wise placement analysis

export const getBatchAnalytics = async (req, res) => {
  try {
    const batchStats = await StudentProfile.aggregate([
      {
        $lookup: {
          from: "applications",
          let: { studentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$student", "$$studentId"] },
                    { $eq: ["$offer.status", "Accepted"] },
                  ],
                },
              },
            },
            {
              $sort: {
                "offer.respondedAt": -1,
              },
            },
            {
              $limit: 1,
            },
            {
              $project: {
                package: "$offer.package",
              },
            },
          ],
          as: "acceptedOffers",
        },
      },
      {
        $addFields: {
          acceptedOffer: {
            $arrayElemAt: ["$acceptedOffers", 0],
          },
        },
      },
      {
        $group: {
          _id: {
            $ifNull: ["$graduationYear", "Unknown"],
          },

          totalStudents: {
            $sum: 1,
          },

          placedStudents: {
            $sum: {
              $cond: [{ $ne: ["$acceptedOffer", null] }, 1, 0],
            },
          },

          averagePackage: {
            $avg: "$acceptedOffer.package",
          },

          highestPackage: {
            $max: "$acceptedOffer.package",
          },

          lowestPackage: {
            $min: "$acceptedOffer.package",
          },
        },
      },
      {
        $project: {
          _id: 0,
          graduationYear: "$_id",
          totalStudents: 1,
          placedStudents: 1,

          notPlacedStudents: {
            $subtract: ["$totalStudents", "$placedStudents"],
          },

          placementRate: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: ["$placedStudents", "$totalStudents"],
                  },
                  100,
                ],
              },
              2,
            ],
          },

          averagePackage: {
            $round: [{ $ifNull: ["$averagePackage", 0] }, 2],
          },

          highestPackage: {
            $ifNull: ["$highestPackage", 0],
          },

          lowestPackage: {
            $ifNull: ["$lowestPackage", 0],
          },
        },
      },
      {
        $sort: {
          graduationYear: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      count: batchStats.length,
      batchStats,
    });
  } catch (error) {
    console.error("Batch Analytics Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch batch analytics",
    });
  }
};

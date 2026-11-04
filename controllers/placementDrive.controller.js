import { PlacementDrive } from "../models/placementDrive.js";
import { Company } from "../models/company.js";

//create placement drive by recruiter

export const createPlacementDrive = async (req, res) => {
  try {
    const {
      title,
      description,
      jobType,
      salary,
      location,
      eligibility,
      applicationDeadline,
      driveDate,
      status,
    } = req.body;

    //find compmany of logged in recruiter
    const company = await Company.findOne({
      recruiter: req.user._id,
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found. Create a company first.",
      });
    }

    if (!company.isApproved) {
      return res.status(404).json({
        success: false,
        message: "Your Company is not approved by admin",
      });
    }

    const drive = await PlacementDrive.create({
      company: company._id,
      title,
      description,
      jobType,
      salary,
      location,
      eligibility,
      applicationDeadline,
      driveDate,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Placement drive created successfully",
      drive,
    });
  } catch (error) {
    console.error("Create Placement Drive Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//recruiter get placement drive detail
export const getMyPlacementsDrive = async (req, res) => {
  try {
    const company = await Company.findOne({
      recruiter: req.user._id,
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const drives = await PlacementDrive.find({
      company: company._id,
    })
      .populate("company", "name logo industry location")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: drives.length,
      drives,
    });
  } catch (error) {
    console.error("Get My Placement Drives Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//student can check placement drive detail after api hit
export const getPlacementDriveById = async (req, res) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id).populate(
      "company",
      "name description website logo industry location",
    );

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Placement drive not found",
      });
    }

    return res.status(200).json({
      success: true,
      drive,
    });
  } catch (error) {
    console.error("Get Placement Drive Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//api for available drives
export const availableDrives = async (req, res) => {
  try {
    const drives = await PlacementDrive.find({
      status: {
        $in: ["Upcoming", "Open"],
      },
      applicationDeadline: {
        $gte: new Date(),
      },
    })
      .populate("company", "name logo industry location website")
      .sort({ applicationDeadline: 1 });

    return res.status(200).json({
      success: true,
      count: drives.length,
      drives,
    });
  } catch (error) {
    console.error("Get Available Drives Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//update placement drive
export const updatePlacementDrive = async (req, res) => {
  try {
    const company = await Company.findOne({
      recruiter: req.user._id,
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const drive = await PlacementDrive.findOne({
      _id: req.params.id,
      company: company._id,
    });

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Placement drive not found",
      });
    }

    const {
      title,
      description,
      jobType,
      salary,
      location,
      eligibility,
      applicationDeadline,
      driveDate,
      status,
    } = req.body;

    if (title !== undefined) drive.title = title;
    if (description !== undefined) drive.description = description;
    if (jobType !== undefined) drive.jobType = jobType;
    if (salary !== undefined) drive.salary = salary;
    if (location !== undefined) drive.location = location;
    if (eligibility !== undefined) drive.eligibility = eligibility;
    if (applicationDeadline !== undefined) {
      drive.applicationDeadline = applicationDeadline;
    }
    if (driveDate !== undefined) {
      drive.driveDate = driveDate;
    }
    if (status !== undefined) drive.status = status;

    await drive.save();

    return res.status(200).json({
      success: true,
      message: "Placement drive updated successfully",
      drive,
    });
  } catch (error) {
    console.error("Update Placement Drive Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//delete placement drive
export const deletePlacementDrive = async (req, res) => {
  try {
    const company = await Company.findOne({
      recruiter: req.user._id,
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const drive = await PlacementDrive.findOne({
      _id: req.params.id,
      company: company._id,
    });

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Placement drive not found",
      });
    }

    await drive.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Placement drive deleted successfully",
    });
  } catch (error) {
    console.error("Delete Placement Drive Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

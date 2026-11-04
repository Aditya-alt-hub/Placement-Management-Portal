import { Company } from "../models/company.js";

//create company by company recruiter
export const createCompany = async (req, res) => {
  try {
    //check if recruiter already has a company
    const existCompany = await Company.findOne({
      recruiter: req.user._id,
    });

    if (existCompany) {
      return res.status(400).json({
        success: false,
        message: "You already have a company",
      });
    }

    //create company
    const company = await Company.create({
      name: req.body.name,
      description: req.body.description,
      website: req.body.website,
      logo: req.body.logo,
      industry: req.body.industry,
      location: req.body.location,

      recruiter: req.user._id,

      isApproved: false,
    });

    return res.status(201).json({
      success: true,
      message: "Company created successfully. Waiting for admin approval.",
      company,
    });
  } catch (error) {
    console.error("Create Company Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// get my company

export const getMyCompany = async (req, res) => {
  try {
    const company = await Company.findOne({
      recruiter: req.user._id,
    }).populate("recruiter", "name email role");

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    return res.status(200).json({
      success: true,
      company,
    });
  } catch (error) {
    console.error("Get My Company Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update My Company

export const updateMyCompany = async (req, res) => {
  try {
    //find my company
    const company = await Company.findOne({
      recruiter: req.user._id,
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const { name, description, website, logo, industry, location } = req.body;

    if (name !== undefined) {
      company.name = name;
    }

    if (description !== undefined) {
      company.description = description;
    }

    if (website !== undefined) {
      company.website = website;
    }

    if (logo !== undefined) {
      company.logo = logo;
    }

    if (industry !== undefined) {
      company.industry = industry;
    }

    if (location !== undefined) {
      company.location = location;
    }

    await company.save();

    return res.status(200).json({
      success: true,
      message: "Company updated successfully",
      company,
    });
  } catch (error) {
    console.error("Update Company Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// get all companies

export const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find()
      .populate("recruiter", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: companies.length,
      companies,
    });
  } catch (error) {
    console.error("Get All Companies Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Approve Company

export const approveCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    if (company.isApproved) {
      return res.status(400).json({
        success: false,
        message: "Company is already approved",
      });
    }

    company.isApproved = true;

    await company.save();

    return res.status(200).json({
      success: true,
      message: "Company approved successfully",
      company,
    });
  } catch (error) {
    console.error("Approve Company Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//get all approved companies to student

export const getapprovedCompaniesByStudent = async (req, res) => {
  try {
    const companies = await Company.find({
      isApproved: true,
    }).select("name description website logo industry location");

    return res.status(200).json({
      success: true,
      count: companies.length,
      companies,
    });
  } catch (error) {
    console.error("Get Approved Companies Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

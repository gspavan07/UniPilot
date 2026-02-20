import { JobPosting, Company, PlacementDrive } from "../models/index.js";
import logger from "../utils/logger.js";

/**
 * Job Posting Controller
 * Handles CRUD operations for placement job postings
 */

// @desc    Get all job postings
// @route   GET /api/placement/job-postings
// @access  Private
export const getJobPostings = async (req, res) => {
  try {
    const { company_id, active } = req.query;
    const where = {};

    if (company_id) where.company_id = company_id;
    if (active === "true") where.is_active = true;

    const postings = await JobPosting.findAll({
      where,
      include: [
        {
          model: Company,
          as: "company",
          attributes: ["id", "name", "logo_url"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: postings.length,
      data: postings,
    });
  } catch (error) {
    logger.error("Error in getJobPostings:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Get single job posting
// @route   GET /api/placement/job-postings/:id
// @access  Private
export const getJobPostingById = async (req, res) => {
  try {
    const posting = await JobPosting.findByPk(req.params.id, {
      include: [
        {
          model: Company,
          as: "company",
        },
        {
          model: PlacementDrive,
          as: "drives",
        },
      ],
    });

    if (!posting) {
      return res.status(404).json({
        success: false,
        error: "Job posting not found",
      });
    }

    res.status(200).json({
      success: true,
      data: posting,
    });
  } catch (error) {
    logger.error("Error in getJobPostingById:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Create new job posting
// @route   POST /api/placement/job-postings
// @access  Private/TPO
export const createJobPosting = async (req, res) => {
  try {
    const posting = await JobPosting.create(req.body);

    res.status(201).json({
      success: true,
      data: posting,
    });
  } catch (error) {
    logger.error("Error in createJobPosting:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Update job posting
// @route   PUT /api/placement/job-postings/:id
// @access  Private/TPO
export const updateJobPosting = async (req, res) => {
  try {
    let posting = await JobPosting.findByPk(req.params.id);

    if (!posting) {
      return res.status(404).json({
        success: false,
        error: "Job posting not found",
      });
    }

    posting = await posting.update(req.body);

    res.status(200).json({
      success: true,
      data: posting,
    });
  } catch (error) {
    logger.error("Error in updateJobPosting:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Delete job posting
// @route   DELETE /api/placement/job-postings/:id
// @access  Private/TPO
export const deleteJobPosting = async (req, res) => {
  try {
    const posting = await JobPosting.findByPk(req.params.id);

    if (!posting) {
      return res.status(404).json({
        success: false,
        error: "Job posting not found",
      });
    }

    await posting.destroy();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    logger.error("Error in deleteJobPosting:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

export default {
  getJobPostings,
  getJobPostingById,
  createJobPosting,
  updateJobPosting,
  deleteJobPosting,
};

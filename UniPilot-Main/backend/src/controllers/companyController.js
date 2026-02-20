import { Company, CompanyContact, JobPosting, PlacementDrive } from "../models/index.js";
import { Op } from "sequelize";
import logger from "../utils/logger.js";

/**
 * Company Controller
 * Handles CRUD operations for placement companies
 */

// @desc    Get all companies
// @route   GET /api/placement/companies
// @access  Private/TPO
export const getCompanies = async (req, res) => {
  try {
    const { tier, industry, search } = req.query;
    const where = { is_active: true };

    if (tier) where.company_tier = tier;
    if (industry) where.industry = industry;
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    const companies = await Company.findAll({
      where,
      include: [
        {
          model: CompanyContact,
          as: "contacts",
        },
      ],
      order: [["name", "ASC"]],
    });

    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies,
    });
  } catch (error) {
    logger.error("Error in getCompanies:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Get single company
// @route   GET /api/placement/companies/:id
// @access  Private
export const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id, {
      include: [
        {
          model: CompanyContact,
          as: "contacts",
        },
        {
          model: JobPosting,
          as: "job_postings",
          include: [
            {
              model: PlacementDrive,
              as: "drives",
            },
          ],
        },
      ],
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: "Company not found",
      });
    }

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    logger.error("Error in getCompanyById:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Create new company
// @route   POST /api/placement/companies
// @access  Private/TPO
export const createCompany = async (req, res) => {
  try {
    const { contacts, ...companyData } = req.body;
    const company = await Company.create(companyData);

    if (contacts && Array.isArray(contacts)) {
      await Promise.all(
        contacts.map((contact) =>
          CompanyContact.create({ ...contact, company_id: company.id }),
        ),
      );
    }

    res.status(201).json({
      success: true,
      data: company,
    });
  } catch (error) {
    logger.error("Error in createCompany:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        error: "Company already exists",
      });
    }
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Update company
// @route   PUT /api/placement/companies/:id
// @access  Private/TPO
export const updateCompany = async (req, res) => {
  try {
    let company = await Company.findByPk(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        error: "Company not found",
      });
    }

    const { contacts, ...companyData } = req.body;
    company = await company.update(companyData);

    if (contacts && Array.isArray(contacts)) {
      // For simplicity, we'll replace contacts or update them.
      // A more robust way would be to sync them, but for now, let's just handle the primary one if it's passed.
      // Or we can delete existing and re-create if it's a full sync.
      // Let's assume for now we just want to update the primary contact if it exists in the payload.
      for (const contactData of contacts) {
        if (contactData.id) {
          const existingContact = await CompanyContact.findByPk(contactData.id);
          if (existingContact) await existingContact.update(contactData);
        } else {
          await CompanyContact.create({
            ...contactData,
            company_id: company.id,
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    logger.error("Error in updateCompany:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Delete company (soft delete)
// @route   DELETE /api/placement/companies/:id
// @access  Private/TPO
export const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        error: "Company not found",
      });
    }

    await company.update({ is_active: false });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    logger.error("Error in deleteCompany:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Add company contact
// @route   POST /api/placement/companies/:id/contacts
// @access  Private/TPO
export const addCompanyContact = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        error: "Company not found",
      });
    }

    const contact = await CompanyContact.create({
      ...req.body,
      company_id: req.params.id,
    });

    res.status(201).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    logger.error("Error in addCompanyContact:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Update company contact
// @route   PUT /api/placement/contacts/:id
// @access  Private/TPO
export const updateCompanyContact = async (req, res) => {
  try {
    let contact = await CompanyContact.findByPk(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: "Contact not found",
      });
    }

    contact = await contact.update(req.body);

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    logger.error("Error in updateCompanyContact:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Delete company contact
// @route   DELETE /api/placement/contacts/:id
// @access  Private/TPO
export const deleteCompanyContact = async (req, res) => {
  try {
    const contact = await CompanyContact.findByPk(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: "Contact not found",
      });
    }

    await contact.destroy();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    logger.error("Error in deleteCompanyContact:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

export default {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  addCompanyContact,
  updateCompanyContact,
  deleteCompanyContact,
};

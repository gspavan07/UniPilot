const Regulation = require("../models/Regulation");
const logger = require("../utils/logger");

/**
 * @desc    Get all regulations
 * @route   GET /api/regulations
 * @access  Private
 */
exports.getAllRegulations = async (req, res) => {
  try {
    const regulations = await Regulation.findAll({
      order: [["academic_year", "DESC"]],
    });
    res.status(200).json({ success: true, data: regulations });
  } catch (error) {
    logger.error("Error fetching regulations:", error);
    res.status(500).json({ error: "Failed to fetch regulations" });
  }
};

/**
 * @desc    Get single regulation by ID
 * @route   GET /api/regulations/:id
 * @access  Private
 */
exports.getRegulationById = async (req, res) => {
  try {
    const regulation = await Regulation.findByPk(req.params.id);
    if (!regulation) {
      return res.status(404).json({ error: "Regulation not found" });
    }
    res.status(200).json({ success: true, data: regulation });
  } catch (error) {
    logger.error("Error fetching regulation:", error);
    res.status(500).json({ error: "Failed to fetch regulation" });
  }
};

/**
 * @desc    Create new regulation
 * @route   POST /api/regulations
 * @access  Private/Admin
 */
exports.createRegulation = async (req, res) => {
  try {
    const regulation = await Regulation.create(req.body);
    res.status(201).json({ success: true, data: regulation });
  } catch (error) {
    logger.error("Error creating regulation:", error);
    res.status(500).json({ error: "Failed to create regulation" });
  }
};



/**
 * @desc    Update regulation
 * @route   PUT /api/regulations/:id
 * @access  Private/Admin
 */
exports.updateRegulation = async (req, res) => {
  try {
    const regulation = await Regulation.findByPk(req.params.id);
    if (!regulation) {
      return res.status(404).json({ error: "Regulation not found" });
    }

    await regulation.update(req.body);
    res.status(200).json({ success: true, data: regulation });
  } catch (error) {
    logger.error("Error updating regulation:", error);
    res.status(500).json({ error: "Failed to update regulation" });
  }
};

/**
 * @desc    Delete regulation
 * @route   DELETE /api/regulations/:id
 * @access  Private/Admin
 */
exports.deleteRegulation = async (req, res) => {
  try {
    const regulation = await Regulation.findByPk(req.params.id);
    if (!regulation) {
      return res.status(404).json({ error: "Regulation not found" });
    }

    await regulation.destroy();
    res.status(200).json({
      success: true,
      message: "Regulation deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting regulation:", error);
    res.status(500).json({ error: "Failed to delete regulation" });
  }
};



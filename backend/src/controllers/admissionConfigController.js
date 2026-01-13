const { AdmissionConfig } = require("../models");
const logger = require("../utils/logger");

// @desc    Get all admission configurations
// @route   GET /api/admission/configs
// @access  Private (Admin/Admission Admin)
exports.getAdmissionConfigs = async (req, res) => {
  try {
    const configs = await AdmissionConfig.findAll({
      order: [["batch_year", "DESC"]],
    });
    res.status(200).json({ success: true, data: configs });
  } catch (error) {
    logger.error("Error in getAdmissionConfigs:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Create or update admission configuration
// @route   POST /api/admission/configs
// @access  Private (Admin/Admission Admin)
exports.saveAdmissionConfig = async (req, res) => {
  try {
    const {
      batch_year,
      university_code,
      id_format,
      temp_id_format,
      is_active,
    } = req.body;

    const [config, created] = await AdmissionConfig.findOrCreate({
      where: { batch_year },
      defaults: {
        university_code,
        id_format,
        temp_id_format,
        is_active,
      },
    });

    if (!created) {
      await config.update({
        university_code,
        id_format,
        temp_id_format,
        is_active,
      });
    }

    res.status(200).json({ success: true, data: config });
  } catch (error) {
    logger.error("Error in saveAdmissionConfig:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

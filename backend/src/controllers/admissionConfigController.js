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
      required_documents,
      field_config,
      seat_matrix,
    } = req.body;

    const [config, created] = await AdmissionConfig.findOrCreate({
      where: { batch_year },
      defaults: {
        university_code,
        id_format,
        temp_id_format,
        is_active,
        required_documents,
        field_config,
        seat_matrix,
      },
    });

    if (!created) {
      // Logic to merge or overwrite? Usually overwrite for admin configs is safer to ensure consistency with UI state.
      // But let's verify if we want partial updates.
      // User said "not saving configurations... correctly".
      // Assuming frontend sends full object, we should update all.

      await config.update({
        university_code,
        id_format,
        temp_id_format,
        is_active,
        required_documents,
        field_config,
        seat_matrix,
      });
    }

    res.status(200).json({ success: true, data: config });
  } catch (error) {
    logger.error("Error in saveAdmissionConfig:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Delete admission configuration
// @route   DELETE /api/admission/configs/:id
// @access  Private (Admin/Admission Admin)
exports.deleteAdmissionConfig = async (req, res) => {
  try {
    const config = await AdmissionConfig.findByPk(req.params.id);

    if (!config) {
      return res.status(404).json({
        success: false,
        error: "Configuration not found",
      });
    }

    await config.destroy();

    res.status(200).json({
      success: true,
      data: {},
      message: "Configuration deleted successfully",
    });
  } catch (error) {
    logger.error("Error in deleteAdmissionConfig:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

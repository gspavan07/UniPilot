import { InstitutionSetting } from "../models/index.js";
import logger from "../utils/logger.js";

// @desc    Get matching settings
// @route   GET /api/settings
// @access  Private
export const getSettings = async (req, res) => {
  try {
    const { keys } = req.query; // Expecting comma separated keys
    let where = {};
    if (keys) {
      where.setting_key = keys.split(",");
    }

    const settings = await InstitutionSetting.findAll({ where });

    // Transform into a key-value object for easier frontend consumption
    const settingsObj = {};
    settings.forEach((s) => {
      settingsObj[s.setting_key] = s.setting_value;
    });

    res.status(200).json({ success: true, data: settingsObj });
  } catch (error) {
    logger.error("Error fetching settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
};

// @desc    Update or create settings
// @route   POST /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
  try {
    const { settings } = req.body; // Expecting { key1: value1, key2: value2 }

    if (!settings || typeof settings !== "object") {
      return res.status(400).json({ error: "Invalid settings format" });
    }

    const updatePromises = Object.entries(settings).map(([key, value]) => {
      return InstitutionSetting.upsert({
        setting_key: key,
        setting_value: String(value),
      });
    });

    await Promise.all(updatePromises);

    res
      .status(200)
      .json({ success: true, message: "Settings updated successfully" });
  } catch (error) {
    logger.error("Error updating settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
};

export default {
  getSettings,
  updateSettings,
};

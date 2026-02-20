import { Holiday } from "../models/index.js";
import logger from "../utils/logger.js";
import { Op } from "sequelize";

// @desc    Get all holidays
// @route   GET /api/holidays
// @access  Private
export const getHolidays = async (req, res) => {
  try {
    const { target } = req.query;
    const whereClause = {};
    if (target) {
      whereClause.target = { [Op.in]: [target, "both"] };
    }

    const holidays = await Holiday.findAll({
      where: whereClause,
      order: [["date", "ASC"]],
    });
    res.status(200).json({ success: true, data: holidays });
  } catch (error) {
    logger.error("Error fetching holidays:", error);
    res.status(500).json({ error: "Failed to fetch holidays" });
  }
};

// @desc    Create a holiday (supports bunch holidays via duration)
// @route   POST /api/holidays
// @access  Private/Admin
export const createHoliday = async (req, res) => {
  try {
    const {
      name,
      date,
      type,
      description,
      duration = 1,
      target = "staff",
    } = req.body;

    if (!name || !date) {
      return res.status(400).json({ error: "Name and date are required" });
    }

    const holidays = [];
    const start = new Date(date);

    for (let i = 0; i < parseInt(duration); i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      const dateStr = current.toISOString().split("T")[0];

      // Use findOrCreate to avoid duplicates for the same name/date
      const [holiday] = await Holiday.findOrCreate({
        where: { date: dateStr, name },
        defaults: {
          name,
          date: dateStr,
          type,
          description,
          target,
        },
      });
      holidays.push(holiday);
    }

    res.status(201).json({
      success: true,
      message: `Created ${holidays.length} holiday records`,
      data: holidays,
    });
  } catch (error) {
    logger.error("Error creating holiday:", error);
    res.status(500).json({ error: "Failed to create holiday" });
  }
};

// @desc    Update a holiday
// @route   PUT /api/holidays/:id
// @access  Private/Admin
export const updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, date, type, description, duration = 1, target } = req.body;

    const holiday = await Holiday.findByPk(id);
    if (!holiday) {
      return res.status(404).json({ error: "Holiday not found" });
    }

    // Update the current record
    await holiday.update({
      name,
      date,
      type,
      description,
      target: target || holiday.target,
    });

    // If duration > 1, create additional days
    const extraHolidays = [];
    if (parseInt(duration) > 1) {
      const start = new Date(date);
      for (let i = 1; i < parseInt(duration); i++) {
        const current = new Date(start);
        current.setDate(start.getDate() + i);
        const dateStr = current.toISOString().split("T")[0];

        const [newHoliday] = await Holiday.findOrCreate({
          where: { date: dateStr, name },
          defaults: {
            name,
            date: dateStr,
            type,
            description,
            target: target || holiday.target,
          },
        });
        extraHolidays.push(newHoliday);
      }
    }

    res.status(200).json({
      success: true,
      data: holiday,
      message:
        extraHolidays.length > 0
          ? `Updated holiday and created ${extraHolidays.length} additional records`
          : "Holiday updated successfully",
    });
  } catch (error) {
    logger.error("Error updating holiday:", error);
    res.status(500).json({ error: "Failed to update holiday" });
  }
};

// @desc    Delete a holiday
// @route   DELETE /api/holidays/:id
// @access  Private/Admin
export const deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;

    const holiday = await Holiday.findByPk(id);
    if (!holiday) {
      return res.status(404).json({ error: "Holiday not found" });
    }

    await holiday.destroy();

    res
      .status(200)
      .json({ success: true, message: "Holiday deleted successfully" });
  } catch (error) {
    logger.error("Error deleting holiday:", error);
    res.status(500).json({ error: "Failed to delete holiday" });
  }
};

export default {
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
};

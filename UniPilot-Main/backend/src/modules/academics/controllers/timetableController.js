import logger from "../../../utils/logger.js";
import { Op } from "sequelize";
import { sequelize } from "../../../config/database.js";
import { Course, Program, Timetable, TimetableSlot } from "../models/index.js";
import CoreService from "../../core/services/index.js";
import InfrastructureService from "../../infrastructure/services/index.js";

// @desc    Initialize a new timetable
// @route   POST /api/timetable/init
// @access  Private/Admin
export const createTimetable = async (req, res) => {
  try {
    const { program_id, semester, academic_year, section } = req.body;

    // Check if exists
    const existing = await Timetable.findOne({
      where: { program_id, semester, academic_year, section },
    });

    if (existing) {
      return res
        .status(400)
        .json({ error: "Timetable already exists for this section" });
    }

    const timetable = await Timetable.create({
      program_id,
      semester,
      academic_year,
      section,
      created_by: req.user.userId,
    });

    res.status(201).json({ success: true, data: timetable });
  } catch (error) {
    logger.error("Error creating timetable:", error);
    res.status(500).json({ error: "Failed to create timetable" });
  }
};

// @desc    Add a slot with CONFLICT DETECTION
// @route   POST /api/timetable/slots
// @access  Private/Admin
export const addSlot = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      timetable_id,
      course_id,
      faculty_id,
      day_of_week,
      start_time,
      end_time,
      room_number,
    } = req.body;

    // 1. Check Faculty Conflict
    const facultyConflict = await TimetableSlot.findOne({
      where: {
        faculty_id,
        day_of_week,
        [Op.or]: [
          {
            start_time: { [Op.between]: [start_time, end_time] },
          },
          {
            end_time: { [Op.between]: [start_time, end_time] },
          },
          {
            [Op.and]: [
              { start_time: { [Op.lte]: start_time } },
              { end_time: { [Op.gte]: end_time } },
            ],
          },
        ],
      },
      transaction: t,
    });

    if (facultyConflict) {
      await t.rollback();
      return res
        .status(409)
        .json({ error: "Faculty is already booked in this time slot" });
    }

    // 2. Check Room Conflict (if room provided)
    if (room_number) {
      const roomConflict = await TimetableSlot.findOne({
        where: {
          room_number,
          day_of_week,
          [Op.or]: [
            {
              start_time: { [Op.between]: [start_time, end_time] },
            },
            {
              end_time: { [Op.between]: [start_time, end_time] },
            },
            {
              [Op.and]: [
                { start_time: { [Op.lte]: start_time } },
                { end_time: { [Op.gte]: end_time } },
              ],
            },
          ],
        },
        transaction: t,
      });

      if (roomConflict) {
        await t.rollback();
        return res
          .status(409)
          .json({ error: `Room ${room_number} is occupied` });
      }
    }

    // 3. Create Slot
    const slot = await TimetableSlot.create(req.body, { transaction: t });
    await t.commit();

    res.status(201).json({ success: true, data: slot });
  } catch (error) {
    await t.rollback();
    logger.error("Error adding slot:", error);
    res.status(500).json({ error: "Failed to add slot" });
  }
};

// @desc    Get Timetable by ID with full details
// @route   GET /api/timetable/:id
// @access  Private
export const getTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const timetable = await Timetable.findByPk(id, {
      include: [
        {
          model: TimetableSlot,
          as: "slots",
          include: [
            { model: Course, as: "course", attributes: ["name", "code"] },
          ],
        },
        { model: Program, as: "program", attributes: ["name"] },
      ],
      order: [
        [{ model: TimetableSlot, as: "slots" }, "day_of_week", "ASC"],
        [{ model: TimetableSlot, as: "slots" }, "start_time", "ASC"],
      ],
    });

    if (!timetable)
      return res.status(404).json({ error: "Timetable not found" });

    const roomIds = [
      ...new Set(timetable.slots.map((slot) => slot.room_id).filter(Boolean)),
    ];
    const rooms = await InfrastructureService.getRoomsByIds(roomIds, {
      attributes: ["id", "room_number", "type", "name"],
      raw: true,
    });
    const roomMap = new Map(rooms.map((room) => [room.id, room]));

    const facultyIds = [...new Set(timetable.slots.map(s => s.faculty_id).filter(Boolean))];
    const facultyMap = await CoreService.getUserMapByIds(facultyIds, {
      attributes: ["id", "first_name", "last_name"]
    });

    const formattedData = timetable.toJSON ? timetable.toJSON() : timetable;
    formattedData.slots = formattedData.slots.map(slot => ({
      ...slot,
      room: slot.room_id ? roomMap.get(slot.room_id) || null : null,
      faculty: facultyMap.get(slot.faculty_id) ? {
        name: `${facultyMap.get(slot.faculty_id).first_name} ${facultyMap.get(slot.faculty_id).last_name}`
      } : null
    }));

    res.status(200).json({ success: true, data: formattedData });
  } catch (error) {
    logger.error("Error fetching timetable:", error);
    res.status(500).json({ error: "Failed to fetch timetable" });
  }
};
// @desc    Get CURRENT USER's Timetable
// @route   GET /api/timetable/my/view
// @access  Private
export const getMyTimetable = async (req, res) => {
  try {
    const { userId, role } = req.user;

    if (role === "student") {
      const student = await CoreService.findByPk(userId, {
        includeProfiles: "student",
      });
      
      const programId = student?.student_profile?.program_id || student?.program_id;
      const currentSemester = student?.student_profile?.current_semester || student?.current_semester || 1;
      const section = student?.student_profile?.section || student?.section;
      
      if (!student || !programId) {
        return res
          .status(200)
          .json({ message: "Student program details not found" });
      }

      // Find timetable for this program/semester
      const timetable = await Timetable.findOne({
        where: {
          program_id: programId,
          semester: currentSemester,
          section: section,
          is_active: true,
        },
        include: [
          {
            model: TimetableSlot,
            as: "slots",
            include: [
              { model: Course, as: "course", attributes: ["name", "code"] },
            ],
          },
          { model: Program, as: "program", attributes: ["name"] },
        ],
        order: [
          [{ model: TimetableSlot, as: "slots" }, "day_of_week", "ASC"],
          [{ model: TimetableSlot, as: "slots" }, "start_time", "ASC"],
        ],
      });

      if (!timetable) {
        return res
          .status(200)
          .json({ message: "No timetable found for your program/semester" });
      }

      const roomIds = [
        ...new Set(
          timetable.slots.map((slot) => slot.room_id).filter(Boolean),
        ),
      ];
      const rooms = await InfrastructureService.getRoomsByIds(roomIds, {
        attributes: ["id", "room_number", "type", "name"],
        raw: true,
      });
      const roomMap = new Map(rooms.map((room) => [room.id, room]));

      // Mapping faculty name for frontend consistency
      const facultyIds = [...new Set(timetable.slots.map(s => s.faculty_id).filter(Boolean))];
      const facultyMap = await CoreService.getUserMapByIds(facultyIds, {
        attributes: ["id", "first_name", "last_name"]
      });

      const formattedData = timetable.toJSON();
      formattedData.slots = formattedData.slots.map((slot) => {
        const faculty = facultyMap.get(slot.faculty_id);
        return {
          ...slot,
          room: slot.room_id ? roomMap.get(slot.room_id) || null : null,
          faculty: faculty ? {
            ...faculty.toJSON(),
            name: `${faculty.first_name} ${faculty.last_name}`,
          } : null,
        }
      });

      return res.status(200).json({ success: true, data: formattedData });
    } else {
      // Faculty View: Collect all slots across all timetables where they teach
      const slots = await TimetableSlot.findAll({
        where: { faculty_id: userId },
        include: [
          { model: Course, as: "course", attributes: ["name", "code"] },
          {
            model: Timetable,
            as: "timetable",
            include: [{ model: Program, as: "program", attributes: ["name"] }],
          },
        ],
        order: [
          ["day_of_week", "ASC"],
          ["start_time", "ASC"],
        ],
      });

      // Wrap in a structure the frontend expects
      const roomIds = [
        ...new Set(slots.map((slot) => slot.room_id).filter(Boolean)),
      ];
      const rooms = await InfrastructureService.getRoomsByIds(roomIds, {
        attributes: ["id", "room_number", "type", "name"],
        raw: true,
      });
      const roomMap = new Map(rooms.map((room) => [room.id, room]));

      return res.status(200).json({
        success: true,
        data: {
          id: "faculty-view",
          slots: slots.map((s) => ({
            ...s.toJSON(),
            room: s.room_id ? roomMap.get(s.room_id) || null : null,
            room_number: s.room_number || "TBD",
            faculty: { name: "You" },
          })),
        },
      });
    }
  } catch (error) {
    logger.error("Error fetching my timetable:", error);
    res.status(500).json({ error: "Failed to fetch your schedule" });
  }
};
// @desc    Find Timetable by specific criteria (Program, Sem, Year, Section)
// @route   GET /api/timetable/find
// @access  Private/Admin
export const getTimetableByCriteria = async (req, res) => {
  try {
    const { program_id, semester, academic_year, section } = req.query;

    if (!program_id || !semester || !academic_year) {
      return res
        .status(400)
        .json({ error: "Missing required search parameters" });
    }

    const whereClause = {
      program_id,
      semester: parseInt(semester),
      academic_year,
      is_active: true,
    };

    if (section) {
      whereClause.section = section;
    }

    const timetable = await Timetable.findOne({
      where: whereClause,
      include: [
        {
          model: TimetableSlot,
          as: "slots",
          include: [
            { model: Course, as: "course", attributes: ["name", "code"] },
          ],
        },
        { model: Program, as: "program", attributes: ["name"] },
      ],
      order: [
        [{ model: TimetableSlot, as: "slots" }, "day_of_week", "ASC"],
        [{ model: TimetableSlot, as: "slots" }, "start_time", "ASC"],
      ],
    });

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "No timetable found for these criteria",
      });
    }

    const roomIds = [
      ...new Set(timetable.slots.map((slot) => slot.room_id).filter(Boolean)),
    ];
    const rooms = await InfrastructureService.getRoomsByIds(roomIds, {
      attributes: ["id", "room_number", "type", "name"],
      raw: true,
    });
    const roomMap = new Map(rooms.map((room) => [room.id, room]));

    // Standardize faculty name for consistency
    const facultyIds = [...new Set(timetable.slots.map(s => s.faculty_id).filter(Boolean))];
    const facultyMap = await CoreService.getUserMapByIds(facultyIds, {
      attributes: ["id", "first_name", "last_name"]
    });

    const formattedData = timetable.toJSON();
    formattedData.slots = formattedData.slots.map((slot) => {
      const faculty = facultyMap.get(slot.faculty_id);
      return {
        ...slot,
        room: slot.room_id ? roomMap.get(slot.room_id) || null : null,
        faculty: faculty ? {
          ...faculty.toJSON(),
          name: `${faculty.first_name} ${faculty.last_name}`,
        } : null,
      }
    });

    res.status(200).json({ success: true, data: formattedData });
  } catch (error) {
    logger.error("Error finding timetable:", error);
    res.status(500).json({ error: "Failed to search for timetable" });
  }
};
// @desc    Delete a timetable slot
// @route   DELETE /api/timetable/slots/:id
// @access  Private/Admin
export const deleteSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const slot = await TimetableSlot.findByPk(id);

    if (!slot) {
      return res.status(404).json({ error: "Timetable slot not found" });
    }

    await slot.destroy();

    res
      .status(200)
      .json({ success: true, message: "Slot deleted successfully" });
  } catch (error) {
    logger.error("Error deleting slot:", error);
    res.status(500).json({ error: "Failed to delete slot" });
  }
};

const {
  ExamCycle,
  ExamSchedule,
  ExamScript,
  User,
  Course,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");
const { createScriptUploadDir } = require("../middleware/scriptUpload");

// @desc    Upload exam scripts (single or bulk)
// @route   POST /api/exam/scripts/upload
// @access  Private/Exam Cell
const uploadScripts = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { exam_schedule_id } = req.body;

    if (!exam_schedule_id) {
      return res.status(400).json({ message: "Exam schedule ID is required" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const schedule = await ExamSchedule.findByPk(exam_schedule_id, {
      include: [
        {
          model: ExamCycle,
          as: "cycle",
        },
        {
          model: Course,
          as: "course",
        },
      ],
      transaction,
    });

    if (!schedule) {
      await transaction.rollback();
      return res.status(404).json({ message: "Exam schedule not found" });
    }

    const uploadedScripts = [];
    const errors = [];

    // Process each uploaded file
    for (const file of req.files) {
      try {
        // Parse filename to get student info
        // Expected format: rollnumber_coursecode.pdf or studentid.pdf
        const filename = path.parse(file.originalname).name;

        // Try to find student by roll number or student ID
        const student = await User.findOne({
          where: {
            [Op.or]: [{ student_id: filename.split("_")[0] }],
            role: "student",
          },
          transaction,
        });

        if (!student) {
          errors.push({
            filename: file.originalname,
            error: "Student not found",
          });
          // Delete temp file
          fs.unlinkSync(file.path);
          continue;
        }

        // Create permanent directory for this script
        const scriptDir = path.join(
          __dirname,
          "../../uploads/exam_scripts",
          schedule.cycle.id,
          student.id,
        );

        if (!fs.existsSync(scriptDir)) {
          fs.mkdirSync(scriptDir, { recursive: true });
        }

        // Move file to permanent location
        const newFilename = `${schedule.course.code}_${Date.now()}.pdf`;
        const permanentPath = path.join(scriptDir, newFilename);
        fs.renameSync(file.path, permanentPath);

        // Store relative path
        const relativePath = path.join(
          "exam_scripts",
          schedule.cycle.id,
          student.id,
          newFilename,
        );

        // Check if script already exists for this student and schedule
        const existingScript = await ExamScript.findOne({
          where: {
            exam_schedule_id,
            student_id: student.id,
          },
          transaction,
        });

        if (existingScript) {
          // Delete old file
          const oldPath = path.join(
            __dirname,
            "../../uploads",
            existingScript.file_path,
          );
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }

          // Update existing record
          await existingScript.update(
            {
              file_path: relativePath,
              file_size: file.size,
              uploaded_by: req.user.userId,
              uploaded_at: new Date(),
              is_visible: false, // Reset visibility on re-upload
            },
            { transaction },
          );

          uploadedScripts.push(existingScript);
        } else {
          // Create new record
          const script = await ExamScript.create(
            {
              exam_schedule_id,
              student_id: student.id,
              file_path: relativePath,
              file_size: file.size,
              uploaded_by: req.user.userId,
              uploaded_at: new Date(),
              is_visible: false,
            },
            { transaction },
          );

          uploadedScripts.push(script);
        }
      } catch (fileError) {
        errors.push({
          filename: file.originalname,
          error: fileError.message,
        });
        // Clean up file if it still exists
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    await transaction.commit();

    res.json({
      message: `Uploaded ${uploadedScripts.length} script(s) successfully`,
      uploadedScripts,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    await transaction.rollback();
    // Clean up any temp files
    if (req.files) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    console.error("Error uploading scripts:", error);
    res.status(500).json({
      message: "Server error while uploading scripts",
      error: error.message,
    });
  }
};

// @desc    Update script visibility
// @route   PUT /api/exam/scripts/visibility
// @access  Private/Exam Cell
const updateScriptVisibility = async (req, res) => {
  try {
    const { exam_cycle_id, is_visible, specific_students } = req.body;

    if (!exam_cycle_id || is_visible === undefined) {
      return res.status(400).json({
        message: "Exam cycle ID and visibility status are required",
      });
    }

    const where = {};

    if (specific_students && specific_students.length > 0) {
      // Update only specific students
      where.student_id = { [Op.in]: specific_students };
    }

    // Get all schedules for this cycle
    const schedules = await ExamSchedule.findAll({
      where: { exam_cycle_id },
      attributes: ["id"],
    });

    where.exam_schedule_id = {
      [Op.in]: schedules.map((s) => s.id),
    };

    const [updatedCount] = await ExamScript.update({ is_visible }, { where });

    res.json({
      message: `Updated visibility for ${updatedCount} script(s)`,
      updatedCount,
    });
  } catch (error) {
    console.error("Error updating script visibility:", error);
    res.status(500).json({
      message: "Server error while updating visibility",
      error: error.message,
    });
  }
};

// @desc    Get uploaded scripts status
// @route   GET /api/exam/scripts/uploaded
// @access  Private/Exam Cell
const getUploadedScripts = async (req, res) => {
  try {
    const { exam_cycle_id, exam_schedule_id } = req.query;

    if (!exam_cycle_id && !exam_schedule_id) {
      return res.status(400).json({
        message: "Exam cycle ID or schedule ID is required",
      });
    }

    const where = {};

    if (exam_schedule_id) {
      where.exam_schedule_id = exam_schedule_id;
    } else if (exam_cycle_id) {
      const schedules = await ExamSchedule.findAll({
        where: { exam_cycle_id },
        attributes: ["id"],
      });
      where.exam_schedule_id = {
        [Op.in]: schedules.map((s) => s.id),
      };
    }

    const scripts = await ExamScript.findAll({
      where,
      include: [
        {
          model: User,
          as: "student",
          attributes: ["id", "first_name", "last_name", "student_id"],
        },
        {
          model: ExamSchedule,
          as: "schedule",
          include: [
            {
              model: Course,
              as: "course",
              attributes: ["id", "name", "code"],
            },
          ],
        },
        {
          model: User,
          as: "uploader",
          attributes: ["id", "first_name", "last_name"],
        },
      ],
      order: [["uploaded_at", "DESC"]],
    });

    res.json({
      scripts,
      total: scripts.length,
    });
  } catch (error) {
    console.error("Error fetching uploaded scripts:", error);
    res.status(500).json({
      message: "Server error while fetching scripts",
      error: error.message,
    });
  }
};

module.exports = {
  uploadScripts,
  updateScriptVisibility,
  getUploadedScripts,
};

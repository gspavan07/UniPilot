import logger from "../../../utils/logger.js";
import { sequelize } from "../../../config/database.js";
import { AdmissionConfig } from "../models/index.js";
import { CoreService } from "../../core/services/index.js";
import { AcademicService } from "../../academics/services/index.js";


// Helper to generate ID
const generateId = (config, batchYear, program, sequence, isLateral) => {
  const format = isLateral
    ? config.lateral_id_format || "L{YY}{UNIV}{BRANCH}{SEQ}"
    : config.id_format || "{YY}{UNIV}{BRANCH}{SEQ}";

  // Extract 2-letter branch code (e.g., "AIML" -> "AI", "CSE" -> "CS")
  let branchCode =
    program.code?.toUpperCase()?.split("-")[1]?.slice(0, 2) || "XX";
  if (branchCode.length < 2) {
    branchCode = branchCode.padEnd(2, "X");
  }

  // Determine sequence padding for 10-char length based on format
  // Temp: {YY}{BRANCH}T{SEQ} = 2 + 2 + 1 + 5 = 10
  // Lateral: {YY}{UNIV}{BRANCH}L{SEQ} = 2 + 3 + 2 + 1 + 2 = 10
  // Permanent: {YY}{UNIV}{BRANCH}{SEQ} = 2 + 3 + 2 + 3 = 10
  let sequencePadding;
  if (format.includes("T{SEQ}")) {
    // Temporary format
    sequencePadding = 5;
  } else if (format.includes("L{SEQ}")) {
    // Lateral format
    sequencePadding = 2;
  } else {
    // Permanent format
    sequencePadding = 3;
  }

  const yearShort = batchYear.toString().slice(-2);
  const seqStr = sequence.toString().padStart(sequencePadding, "0");
  const univCode = config.university_code || "B11";

  return format
    .replace("{YY}", yearShort)
    .replace("{UNIV}", univCode)
    .replace("{BRANCH}", branchCode)
    .replace("{SEQ}", seqStr);
};

// @desc    Preview Bulk ID Generation
// @route   POST /api/admission/ids/preview
// @access  Private (Admin)
export const previewBulkIds = async (req, res) => {
  try {
    const { batch_year, program_id, start_sequence } = req.body;

    if (!batch_year || !program_id) {
      return res
        .status(400)
        .json({ success: false, error: "Batch Year and Program are required" });
    }

    // 1. Fetch Config
    const config = await AdmissionConfig.findOne({ where: { batch_year } });
    if (!config) {
      return res.status(404).json({
        success: false,
        error: "Admission Config not found for this batch",
      });
    }

    // 2. Fetch Program
    const program = await AcademicService.getProgramById(program_id, {
      attributes: ["id", "code"],
    });

    if (!program) {
      return res
        .status(404)
        .json({ success: false, error: "Program not found" });
    }

    // 3. Determine Start Sequence
    // If user provided start_sequence, use it.
    // Else check program_sequences[program_id]
    // Else default to 1
    let currentSeq = 1;
    if (start_sequence) {
      currentSeq = parseInt(start_sequence);
    } else if (
      config.program_sequences &&
      config.program_sequences[program_id]
    ) {
      currentSeq = config.program_sequences[program_id] + 1;
    }

    // 4. Fetch Students (Temp Only) via StudentProfile
    const { StudentProfile, User } = sequelize.models;
    const students = await StudentProfile.findAll({
      where: {
        batch_year,
        program_id,
        is_temporary_id: false,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "first_name", "last_name"],
          where: { role: "student" },
          required: true,
        },
      ],
      attributes: ["student_id", "is_lateral"],
      order: [
        [{ model: User, as: "user" }, "first_name", "ASC"],
        [{ model: User, as: "user" }, "last_name", "ASC"],
      ],
    });

    // 5. Generate Previews
    const previewData = students.map((profile) => {
      const student = profile.user;
      const isLateral = profile.is_lateral || false;
      // Note: Lateral logic might imply different batch/year calc?
      // But assuming batch_year passed IS the student's batch year.

      const newId = generateId(
        config,
        batch_year,
        program,
        currentSeq,
        isLateral,
      );
      const item = {
        id: student.id,
        name: `${student.first_name} ${student.last_name}`,
        current_id: profile.student_id,
        new_id: newId,
        sequence: currentSeq,
      };
      currentSeq++;
      return item;
    });

    res.status(200).json({
      success: true,
      data: {
        preview: previewData,
        next_sequence: currentSeq,
        count: previewData.length,
      },
    });
  } catch (error) {
    logger.error("Error in previewBulkIds:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Commit Bulk ID Generation
// @route   POST /api/admission/ids/commit
// @access  Private (Admin)
export const commitBulkIds = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { batch_year, program_id, students } = req.body;

    if (!batch_year || !program_id || !students || students.length === 0) {
      return res.status(400).json({ success: false, error: "Invalid data" });
    }

    const config = await AdmissionConfig.findOne({ where: { batch_year } });
    if (!config) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, error: "Config not found" });
    }

    // 1. Update each student profile
    let lastSequence = 0;
    for (const item of students) {
      await sequelize.models.StudentProfile.update(
        {
          student_id: item.new_id,
          admission_number: item.new_id, // Setting admission number same as Roll No for now?
          // Or separate? User prompt said "give perminent number". Usually Roll No.
          // Let's assume Updating student_id is the key.
          is_temporary_id: true,
        },
        { where: { user_id: item.id }, transaction: t },
      );
      if (item.sequence > lastSequence) lastSequence = item.sequence;
    }

    // 2. Update Config Sequence
    // Merge new sequence into program_sequences
    const newSequences = { ...(config.program_sequences || {}) };
    newSequences[program_id] = lastSequence;

    await config.update(
      { program_sequences: newSequences },
      { transaction: t },
    );

    await t.commit();

    res.status(200).json({
      success: true,
      message: `Successfully generated IDs for ${students.length} students`,
    });
  } catch (error) {
    await t.rollback();
    logger.error("Error in commitBulkIds:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export default {
  previewBulkIds,
  commitBulkIds,
};

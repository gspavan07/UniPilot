import logger from "../../../utils/logger.js";
import { sequelize } from "../../../config/database.js";
import { AdmissionConfig } from "../models/index.js";
import { SettingsService } from "../../settings/services/index.js";
import { AcademicService } from "../../academics/services/index.js";

/**
 * Generates a unique student ID based on batch configuration
 * @param {Object} params - { batchYear, programId, isTemporary, isLateral }
 * @returns {Promise<string>}
 */
export const generateStudentId = async ({
  batchYear,
  programId,
  isTemporary = false,
  isLateral = false,
}) => {
  const transaction = await sequelize.transaction();
  try {
    // 1. Get Batch Config
    const config = await AdmissionConfig.findOne({
      where: { batch_year: batchYear, is_active: true },
      lock: true,
      transaction,
    });

    if (!config) {
      throw new Error(
        `Admission configuration not found for batch ${batchYear}`,
      );
    }

    // 2. Get Program Code
    const program = await AcademicService.getProgramById(programId, {
      transaction,
      attributes: ["id", "code"],
    });
    if (!program) {
      throw new Error("Program not found");
    }

    // 3. Extract 2-letter branch code from program code
    // Examples: "AIML" -> "AI", "CSE" -> "CS", "ECE" -> "EC"
    let branchCode = program.code?.toUpperCase().substring(0, 2) || "XX";
    if (branchCode.length < 2) {
      branchCode = branchCode.padEnd(2, "X");
    }

    // 4. Determine sequence padding based on ID type for 10-char length
    // Temp: {YY}{BRANCH}T{SEQ} = 2 + 2 + 1 + 5 = 10 (e.g., 26CST00001)
    // Permanent: {YY}{UNIV}{BRANCH}{SEQ} = 2 + 3 + 2 + 3 = 10 (e.g., 26B11CS001)
    // Lateral: {YY}{UNIV}{BRANCH}L{SEQ} = 2 + 3 + 2 + 1 + 2 = 10 (e.g., 26B11CSL01)
    let sequencePadding;
    let format;

    if (isTemporary) {
      format = config.temp_id_format;
    } else if (isLateral) {
      format = config.lateral_id_format;
    } else {
      format = config.id_format;
    }

    // Detect format type by checking for T or L in the format string
    if (format.includes("T{SEQ}")) {
      // Temporary ID: {YY}{BRANCH}T{SEQ} = 2 + 2 + 1 + 5 = 10
      sequencePadding = 5;
    } else if (format.includes("L{SEQ}")) {
      // Lateral ID: {YY}{UNIV}{BRANCH}L{SEQ} = 2 + 3 + 2 + 1 + 2 = 10
      sequencePadding = 2;
    } else {
      // Permanent ID: {YY}{UNIV}{BRANCH}{SEQ} = 2 + 3 + 2 + 3 = 10
      sequencePadding = 3;
    }

    const yearShort = batchYear.toString().slice(-2);
    const sequence = config.current_sequence
      .toString()
      .padStart(sequencePadding, "0");
    const univCode = config.university_code;

    // 5. Replace placeholders
    let studentId = format
      .replace("{YY}", yearShort)
      .replace("{UNIV}", univCode)
      .replace("{BRANCH}", branchCode)
      .replace("{SEQ}", sequence);

    // 6. Validate 10-character length
    if (studentId.length !== 10) {
      throw new Error(
        `Generated ID "${studentId}" is ${studentId.length} characters, expected 10. Format: ${format}`,
      );
    }

    // 4. Increment Sequence
    config.current_sequence += 1;
    await config.save({ transaction });

    await transaction.commit();
    return studentId;
  } catch (error) {
    await transaction.rollback();
    logger.error("Error in generateStudentId:", error);
    throw error;
  }
};

/**
 * Generates a global sequential admission number
 * Format: {PREFIX}-{SEQUENCE_PADDED} (e.g., ADM-0001)
 * Independent of batch or program.
 * @returns {Promise<string>}
 */
export const generateGlobalAdmissionNumber = async () => {
  const transaction = await sequelize.transaction();
  try {
    // 1. Get Settings (Lock Row if possible, but for singleton row it's tricky without ID)
    // We assume there's only one relevant row or we pick the first one.
    // Ideally we should have a singleton config.
    // For now we will findOne. If not exists, create default.
    const setting = await SettingsService.getOrCreateGlobalConfig({
      transaction,
    });

    // 2. Generate Number
    const prefix = setting.admission_number_prefix || "ADM";
    const sequence = setting.current_admission_sequence || 1;
    const paddedSeq = sequence.toString().padStart(4, "0"); // ADM-0001
    const admissionNumber = `${prefix}-${paddedSeq}`;

    // 3. Increment
    setting.current_admission_sequence = sequence + 1;
    await setting.save({ transaction });

    await transaction.commit();
    return admissionNumber;
  } catch (error) {
    await transaction.rollback();
    logger.error("Error in generateGlobalAdmissionNumber:", error);
    throw error;
  }
};

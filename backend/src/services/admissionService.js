const { AdmissionConfig, Program, sequelize } = require("../models");
const logger = require("../utils/logger");

/**
 * Generates a unique student ID based on batch configuration
 * @param {Object} params - { batchYear, programId, isTemporary }
 * @returns {Promise<string>}
 */
const generateStudentId = async ({
  batchYear,
  programId,
  isTemporary = false,
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
        `Admission configuration not found for batch ${batchYear}`
      );
    }

    // 2. Get Program Code
    const program = await Program.findByPk(programId, { transaction });
    if (!program) {
      throw new Error("Program not found");
    }

    // 3. Format ID
    const format = isTemporary ? config.temp_id_format : config.id_format;
    const yearShort = batchYear.toString().slice(-2);
    const sequence = config.current_sequence.toString().padStart(3, "0");
    const univCode = config.university_code;
    const branchCode = program.code?.split("-")[1] || program.code || "XX";

    // Replace placeholders
    let studentId = format
      .replace("{YY}", yearShort)
      .replace("{UNIV}", univCode)
      .replace("{BRANCH}", branchCode)
      .replace("{SEQ}", sequence);

    // 4. Increment Sequence
    config.current_sequence += 1;
    await config.save({ transaction });

    await transaction.commit();
    return studentId;
  } catch (error) {
    await transaction.transactionRollback();
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
const generateGlobalAdmissionNumber = async () => {
  const { InstitutionSetting } = require("../models");
  const transaction = await sequelize.transaction();
  try {
    // 1. Get Settings (Lock Row if possible, but for singleton row it's tricky without ID)
    // We assume there's only one relevant row or we pick the first one.
    // Ideally we should have a singleton config.
    // For now we will findOne. If not exists, create default.
    let setting = await InstitutionSetting.findOne({
      transaction,
      lock: true,
    });

    if (!setting) {
      setting = await InstitutionSetting.create(
        {
          setting_key: "global_config",
          setting_value: "{}",
          current_admission_sequence: 1,
          admission_number_prefix: "ADM",
        },
        { transaction }
      );
    }

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

module.exports = {
  generateStudentId,
  generateGlobalAdmissionNumber,
};

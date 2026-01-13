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

module.exports = {
  generateStudentId,
};

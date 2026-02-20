import {
  ExamFeeConfiguration,
  LateFeeSlab,
  ExamCycle,
} from "../../models/exam/associations.js";
import { sequelize } from "../../config/database.js";
import logger from "../../utils/logger.js";

/**
 * Get fee configuration for a cycle
 * GET /api/exam/cycles/:cycleId/fee-config
 */
async function getFeeConfigByCycle(req, res) {
  try {
    const { cycleId } = req.params;

    const feeConfig = await ExamFeeConfiguration.findOne({
      where: { exam_cycle_id: cycleId },
      include: [
        {
          model: LateFeeSlab,
          as: "slabs",
          order: [["start_date", "ASC"]],
        },
      ],
    });

    if (!feeConfig) {
      return res
        .status(404)
        .json({ success: false, error: "Fee configuration not found" });
    }

    res.json({ success: true, data: feeConfig });
  } catch (error) {
    logger.error("Get fee config error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Create fee configuration for a cycle
 * POST /api/exam/cycles/:cycleId/fee-config
 */
async function createFeeConfig(req, res) {
  try {
    const { cycleId } = req.params;
    const {
      base_fee,
      regular_start_date,
      regular_end_date,
      final_registration_date,
      slabs,
    } = req.body;

    // Check if cycle exists
    const cycle = await ExamCycle.findByPk(cycleId);
    if (!cycle) {
      return res.status(404).json({ success: false, error: "Cycle not found" });
    }

    // Check if fee config already exists
    const existing = await ExamFeeConfiguration.findOne({
      where: { exam_cycle_id: cycleId },
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: "Fee configuration already exists for this cycle",
      });
    }

    // Create fee configuration
    const feeConfig = await ExamFeeConfiguration.create({
      exam_cycle_id: cycleId,
      base_fee,
      regular_start_date,
      regular_end_date,
      final_registration_date,
      created_by: req.user.userId,
    });

    // Create late fee slabs if provided
    if (slabs && slabs.length > 0) {
      const slabData = slabs.map((slab) => {
        if (new Date(slab.start_date) > new Date(slab.end_date)) {
          throw new Error(
            `Invalid date range for slab: ${slab.start_date} to ${slab.end_date}`,
          );
        }
        return {
          fee_config_id: feeConfig.id,
          start_date: slab.start_date,
          end_date: slab.end_date,
          fine_amount: slab.fine_amount,
        };
      });
      await LateFeeSlab.bulkCreate(slabData);
    }

    // Fetch complete config with slabs
    const completeConfig = await ExamFeeConfiguration.findByPk(feeConfig.id, {
      include: [{ model: LateFeeSlab, as: "slabs" }],
    });

    logger.info(`Fee configuration created for cycle ${cycleId}`);

    res.status(201).json({ success: true, data: completeConfig });
  } catch (error) {
    logger.error("Create fee config error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Update fee configuration
 * PUT /api/exam/fee-config/:id
 */
async function updateFeeConfig(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const feeConfig = await ExamFeeConfiguration.findByPk(id);
    if (!feeConfig) {
      return res
        .status(404)
        .json({ success: false, error: "Fee configuration not found" });
    }

    // Date range validation
    if (
      updates.regular_start_date ||
      updates.regular_end_date ||
      updates.final_registration_date
    ) {
      const regStart =
        updates.regular_start_date || feeConfig.regular_start_date;
      const regEnd = updates.regular_end_date || feeConfig.regular_end_date;
      const finalReg =
        updates.final_registration_date || feeConfig.final_registration_date;

      if (new Date(regStart) > new Date(regEnd)) {
        return res.status(400).json({
          success: false,
          error: "Regular start date cannot be after regular end date",
        });
      }
      if (new Date(regEnd) > new Date(finalReg)) {
        return res.status(400).json({
          success: false,
          error: "Regular end date cannot be after final registration date",
        });
      }
    }

    // Log changes to audit table
    const oldData = feeConfig.toJSON();
    for (const [field, newValue] of Object.entries(updates)) {
      if (oldData[field] !== newValue) {
        await logFeeConfigChange(
          id,
          field,
          oldData[field],
          newValue,
          req.user.userId,
        );
      }
    }

    await feeConfig.update(updates);

    logger.info(`Fee configuration ${id} updated`);

    res.json({ success: true, data: feeConfig });
  } catch (error) {
    logger.error("Update fee config error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Add late fee slab
 * POST /api/exam/fee-config/:id/slabs
 */
async function addLatFeeSlab(req, res) {
  try {
    const { id } = req.params;
    const { start_date, end_date, fine_amount } = req.body;

    const feeConfig = await ExamFeeConfiguration.findByPk(id);
    if (!feeConfig) {
      return res
        .status(404)
        .json({ success: false, error: "Fee configuration not found" });
    }

    if (new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({
        success: false,
        error: "Start date cannot be after end date",
      });
    }

    const slab = await LateFeeSlab.create({
      fee_config_id: id,
      start_date,
      end_date,
      fine_amount,
    });

    logger.info(`Late fee slab added to fee config ${id}`);

    res.status(201).json({ success: true, data: slab });
  } catch (error) {
    logger.error("Add late fee slab error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Update late fee slab
 * PUT /api/exam/late-fee-slabs/:id
 */
async function updateLatFeeSlab(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const slab = await LateFeeSlab.findByPk(id);
    if (!slab) {
      return res
        .status(404)
        .json({ success: false, error: "Late fee slab not found" });
    }

    // Date range validation
    if (updates.start_date || updates.end_date) {
      const finalStartDate = updates.start_date || slab.start_date;
      const finalEndDate = updates.end_date || slab.end_date;
      if (new Date(finalStartDate) > new Date(finalEndDate)) {
        return res.status(400).json({
          success: false,
          error: "Start date cannot be after end date",
        });
      }
    }

    // Log to audit
    const oldData = slab.toJSON();
    for (const [field, newValue] of Object.entries(updates)) {
      if (oldData[field] !== newValue) {
        await logFeeConfigChange(
          slab.fee_config_id,
          `slab.${field}`,
          oldData[field],
          newValue,
          req.user.userId,
        );
      }
    }

    await slab.update(updates);

    logger.info(`Late fee slab ${id} updated`);

    res.json({ success: true, data: slab });
  } catch (error) {
    logger.error("Update late fee slab error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Delete late fee slab
 * DELETE /api/exam/late-fee-slabs/:id
 */
async function deleteLatFeeSlab(req, res) {
  try {
    const { id } = req.params;

    const slab = await LateFeeSlab.findByPk(id);
    if (!slab) {
      return res
        .status(404)
        .json({ success: false, error: "Late fee slab not found" });
    }

    await slab.destroy();

    logger.info(`Late fee slab ${id} deleted`);

    res.json({ success: true, message: "Late fee slab deleted" });
  } catch (error) {
    logger.error("Delete late fee slab error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Get audit logs for fee configuration
 * GET /api/exam/fee-config/:id/audit-logs
 */
async function getFeeConfigAuditLogs(req, res) {
  try {
    const { id } = req.params;

    const logs = await sequelize.query(
      `SELECT * FROM fee_config_audit_logs 
       WHERE fee_config_id = :id 
       ORDER BY changed_at DESC`,
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      },
    );

    res.json({ success: true, data: logs });
  } catch (error) {
    logger.error("Get fee config audit logs error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Calculate fee for a student (for preview in student portal)
 * POST /api/exam/fee-config/calculate
 */
async function calculateFee(req, res) {
  try {
    const { cycle_id } = req.body;
    const currentDate = new Date().toISOString().split("T")[0];
    console.log(currentDate);
    const feeConfig = await ExamFeeConfiguration.findOne({
      where: { exam_cycle_id: cycle_id },
      include: [{ model: LateFeeSlab, as: "slabs" }],
    });
    // console.log(feeConfig);

    if (!feeConfig) {
      return res
        .status(404)
        .json({ success: false, error: "Fee configuration not found" });
    }

    let fine = 0;
    let blocked = false;
    let message = "";

    console.log("currentDate", currentDate);
    console.log(
      "feeConfig.final_registration_date",
      feeConfig.final_registration_date,
    );
    console.log("feeConfig.regular_end_date", feeConfig.regular_end_date);
    console.log("currentDate", currentDate > feeConfig.regular_end_date);
    // Check if after final registration date
    if (currentDate > feeConfig.final_registration_date) {
      blocked = true;
      message = "Registration closed";
    } else if (currentDate > feeConfig.regular_end_date) {
      // Find applicable late fee slab
      const applicableSlab = feeConfig.slabs.find((slab) => {
        const slabStart = slab.start_date;
        const slabEnd = slab.end_date;
        return currentDate >= slabStart && currentDate <= slabEnd;
      });
      // console.log("applicableSlab", applicableSlab);
      if (applicableSlab) {
        fine = parseFloat(applicableSlab.fine_amount);
        message = "Late fee applicable";
      }
    } else {
      message = "Regular fee period";
    }

    const result = {
      base_fee: parseFloat(feeConfig.base_fee),
      late_fine: fine,
      total: parseFloat(feeConfig.base_fee) + fine,
      blocked,
      message,
    };

    res.json({ success: true, data: result });
  } catch (error) {
    logger.error("Calculate fee error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Helper function to log fee config changes
async function logFeeConfigChange(
  feeConfigId,
  field,
  oldValue,
  newValue,
  userId,
) {
  try {
    await sequelize.query(
      `INSERT INTO fee_config_audit_logs (fee_config_id, changed_by, field_changed, old_value, new_value)
       VALUES (:feeConfigId, :userId, :field, :oldValue, :newValue)`,
      {
        replacements: {
          feeConfigId,
          userId,
          field,
          oldValue: String(oldValue),
          newValue: String(newValue),
        },
      },
    );
  } catch (error) {
    logger.error("Log fee config change error:", error);
  }
}

export default {
  getFeeConfigByCycle,
  createFeeConfig,
  updateFeeConfig,
  addLatFeeSlab,
  updateLatFeeSlab,
  deleteLatFeeSlab,
  getFeeConfigAuditLogs,
  calculateFee,
};

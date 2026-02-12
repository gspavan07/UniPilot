const { LeaveBalance, SalaryGrade, SalaryStructure } = require("../models");

/**
 * Syncs User's Leave Balances with their Grade Policy
 * @param {string} userId - The user ID
 * @param {string} gradeId - The Salary Grade ID
 */
exports.syncBalances = async (userId, gradeId) => {
  try {
    const grade = await SalaryGrade.findByPk(gradeId);
    if (!grade || !grade.leave_policy || !Array.isArray(grade.leave_policy)) {
      return;
    }

    const year = new Date().getFullYear();

    for (const policy of grade.leave_policy) {
      if (!policy.name) continue;

      const days = Number(policy.days) || 0;

      // Find existing record
      let balanceRecord = await LeaveBalance.findOne({
        where: {
          user_id: userId,
          leave_type: policy.name,
          year,
        },
      });

      if (balanceRecord) {
        // Update Total Credits & Balance
        // We do NOT reset 'used'. We just adjust the ceiling.
        const currentUsed = parseFloat(balanceRecord.used) || 0;
        const newBalance = days - currentUsed;

        await balanceRecord.update({
          total_credits: days,
          balance: newBalance,
        });
      } else {
        // Create new
        await LeaveBalance.create({
          user_id: userId,
          leave_type: policy.name,
          year,
          total_credits: days,
          used: 0,
          balance: days,
        });
      }
    }
    console.log(`Synced balances for user ${userId} with grade ${grade.name}`);
  } catch (error) {
    console.error("Error syncing balances:", error);
    // Don't throw, just log. Non-critical background task.
  }
};

/**
 * Syncs Balances for ALL users with a specific Grade
 * @param {string} gradeId
 */
exports.syncAllUsersForGrade = async (gradeId) => {
  try {
    const structures = await SalaryStructure.findAll({
      where: { grade_id: gradeId },
    });

    console.log(
      `Syncing balances for ${structures.length} users in Grade ${gradeId}`
    );

    for (const struct of structures) {
      if (struct.user_id) {
        await exports.syncBalances(struct.user_id, gradeId);
      }
    }
  } catch (error) {
    console.error("Error bulk syncing balances:", error);
  }
};

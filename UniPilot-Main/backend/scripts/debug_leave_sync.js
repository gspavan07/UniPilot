import {
  User,
  SalaryGrade,
  SalaryStructure,
  LeaveBalance,
  sequelize,
} from "../src/models/index.js";
import leaveService from "../src/services/leaveService.js";

async function debug() {
  try {
    console.log("--- Debugging Leave Sync ---");

    // 1. Check Grades
    const grades = await SalaryGrade.findAll();
    console.log(`Found ${grades.length} Grades:`);
    grades.forEach((g) =>
      console.log(
        ` - ${g.name} (ID: ${g.id}): Policy: ${JSON.stringify(g.leave_policy)}`
      )
    );

    if (grades.length === 0) {
      console.log("No grades found.");
      process.exit(0);
    }

    // Check ALL structures
    const allStructs = await SalaryStructure.findAll();
    console.log(`Total Salary Structures in DB: ${allStructs.length}`);
    if (allStructs.length > 0) {
      console.log(
        "Sample Structure:",
        JSON.stringify(allStructs[0].toJSON(), null, 2)
      );
    }

    // Pick the first grade to test
    const testGrade = grades[0];
    console.log(`\nTesting with Grade: ${testGrade.name}`);

    // 2. Check Structures with this Grade
    const structs = await SalaryStructure.findAll({
      where: { grade_id: testGrade.id },
    });
    console.log(
      `Found ${structs.length} structures linked to ${testGrade.name} (grade_id: ${testGrade.id})`
    );

    if (structs.length > 0) {
      const userId = structs[0].user_id;
      const user = await User.findByPk(userId);
      console.log(
        `Testing User: ${user?.first_name} ${user?.last_name} (${userId})`
      );

      // 3. Pre-Sync Balances
      const preBalances = await LeaveBalance.findAll({
        where: { user_id: userId },
      });
      console.log(
        "Pre-Sync Balances:",
        preBalances.map(
          (b) => `${b.leave_type} (${b.year}): ${b.balance}/${b.total_credits}`
        )
      );

      // 4. Force Sync
      console.log("\nRunning Force Sync...");
      await leaveService.syncBalances(userId, testGrade.id);

      // 5. Post-Sync Balances
      const postBalances = await LeaveBalance.findAll({
        where: { user_id: userId },
      });
      console.log(
        "Post-Sync Balances:",
        postBalances.map(
          (b) => `${b.leave_type} (${b.year}): ${b.balance}/${b.total_credits}`
        )
      );

      if (postBalances.length === 0 && testGrade.leave_policy.length > 0) {
        console.log("!! Sync Failed to create any records.");
      }
    } else {
      console.log(
        "!! No users have this Grade assigned. Sync logic would skip everyone."
      );
      console.log(
        "Reason: Please creating a Salary Structure for a user assigning this Grade."
      );
    }

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

debug();

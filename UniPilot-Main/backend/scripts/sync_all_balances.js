const { SalaryGrade, sequelize } = require("../src/models");
const leaveService = require("../src/services/leaveService");

async function run() {
  try {
    console.log("Starting Global Leave Balance Sync...");
    const grades = await SalaryGrade.findAll();

    for (const g of grades) {
      console.log(`Syncing Grade: ${g.name} (${g.id})`);
      await leaveService.syncAllUsersForGrade(g.id);
    }

    console.log("Global Sync Completed.");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

run();

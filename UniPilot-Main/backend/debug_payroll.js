const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });
const { SalaryStructure } = require("./src/models");

const debug = async () => {
  try {
    const structures = await SalaryStructure.findAll();
    console.log("Current Salary Structures in DB:");
    console.log(JSON.stringify(structures, null, 2));
    process.exit(0);
  } catch (error) {
    console.error("Debug Query Failed:", error);
    process.exit(1);
  }
};

debug();

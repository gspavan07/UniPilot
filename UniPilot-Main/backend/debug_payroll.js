import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "./.env") });
import { SalaryStructure } from "./src/models/index.js";

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

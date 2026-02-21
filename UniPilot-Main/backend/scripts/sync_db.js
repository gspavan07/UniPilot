import path from "path";
import dotenv from "dotenv"
const __dirname = import.meta.dirname;
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import { sequelize } from "../src/models/index.js";
import logger from "../src/utils/logger.js";

const syncDatabase = async () => {
  try {
    console.log("Starting database synchronization...");
    // Sync all models that are not already in the database
    // alter: true will check current state and perform necessary changes to make it match the model
    await sequelize.sync({ alter: true });
    console.log("✓ Database synchronized successfully");
    process.exit(0);
  } catch (error) {
    console.error("× Error synchronizing database:", error);
    process.exit(1);
  }
};

syncDatabase();

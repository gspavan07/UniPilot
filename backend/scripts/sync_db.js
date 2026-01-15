const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { sequelize } = require("../src/models");
const logger = require("../src/utils/logger");

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

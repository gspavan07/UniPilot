import 'dotenv/config';

console.log('Database Host:', process.env.DB_HOST); 
// console.log(process.env);

import app from "./src/app.js";
import { sequelize } from "./src/config/database.js";
import logger from "./src/utils/logger.js";
import redis from "./src/config/redis.js";

const PORT = process.env.PORT || 3000;

// Graceful shutdown handler
const gracefulShutdown = async () => {
  logger.info("Received shutdown signal, closing connections...");

  try {
    await sequelize.close();
    await redis.quit();
    logger.info("Database and Redis connections closed");
    process.exit(0);
  } catch (error) {
    logger.error("Error during shutdown:", error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info("✓ Master database connected successfully");

    // Test Redis connection
    await redis.ping();
    logger.info("✓ Redis connected successfully");

    // Start HTTP server
    app.listen(PORT, "0.0.0.0", () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🔗 API URL: http://0.0.0.0:${PORT}/api`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
  logger.error("Unhandled Promise Rejection:", error);
  gracefulShutdown();
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  gracefulShutdown();
});

startServer();

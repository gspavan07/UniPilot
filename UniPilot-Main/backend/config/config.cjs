require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "unipilot",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    dialect: "postgres",
    searchPath: "public,core,academics,hr,admissions,exams,fees,hostel,infrastructure,obe,notifications,placement,proctoring,transport,library,settings",
    seederStorage: "sequelize",
    migrationStorageTableName: "sequelize_meta",
    seederStorageTableName: "sequelize_data",
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    dialect: "postgres",
    logging: false,
    searchPath: "public,core,academics,hr,admissions,exams,fees,hostel,infrastructure,obe,notifications,placement,proctoring,transport,library,settings",
    seederStorage: "sequelize",
    migrationStorageTableName: "sequelize_meta",
    seederStorageTableName: "sequelize_data",
  },
};

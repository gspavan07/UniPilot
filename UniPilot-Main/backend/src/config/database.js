const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

// Database configuration
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'unipilot',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  dialect: 'postgres',
  timezone: '+05:30',
  logging: (msg) => logger.debug(msg),
  pool: {
    min: parseInt(process.env.DB_POOL_MIN) || 2,
    max: parseInt(process.env.DB_POOL_MAX) || 10,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
};

// Create Sequelize instance
// Create Sequelize instance
let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    ...config,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  sequelize = new Sequelize(config);
}

module.exports = {
  sequelize,
};

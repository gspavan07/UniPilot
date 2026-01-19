const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("regulations", {
      id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(50), // e.g., "R23", "R20"
        allowNull: false,
        unique: true,
      },
      academic_year: {
        type: DataTypes.STRING(20), // e.g., "2023-2024"
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("semester", "year"),
        defaultValue: "semester",
        allowNull: false,
      },
      grading_system: {
        type: DataTypes.STRING(100), // e.g., "CBCS", "Points"
        defaultValue: "CBCS",
      },
      description: {
        type: DataTypes.TEXT,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("regulations");
  },
};

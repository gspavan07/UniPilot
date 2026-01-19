const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Add regulation_id
    await queryInterface.addColumn("courses", "regulation_id", {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "regulations",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // 2. Add syllabus_data (JSONB for structured units/topics)
    await queryInterface.addColumn("courses", "syllabus_data", {
      type: DataTypes.JSONB,
      defaultValue: [],
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("courses", "syllabus_data");
    await queryInterface.removeColumn("courses", "regulation_id");
  },
};

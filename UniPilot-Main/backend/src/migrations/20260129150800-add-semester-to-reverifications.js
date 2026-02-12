const { QueryTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable(
      "exam_reverifications",
    );
    if (!tableInfo.semester) {
      await queryInterface.addColumn("exam_reverifications", "semester", {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1, // Fallback for existing records
        comment: "Semester for which reverification is requested",
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable(
      "exam_reverifications",
    );
    if (tableInfo.semester) {
      await queryInterface.removeColumn("exam_reverifications", "semester");
    }
  },
};

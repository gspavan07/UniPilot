const { QueryTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable("exam_cycles");
    if (!tableInfo.exam_month) {
      await queryInterface.addColumn("exam_cycles", "exam_month", {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: "Month of the examination (e.g., Jan, Feb)",
      });
    }
    if (!tableInfo.exam_year) {
      await queryInterface.addColumn("exam_cycles", "exam_year", {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: "Year of the examination (e.g., 2024)",
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable("exam_cycles");
    if (tableInfo.exam_month) {
      await queryInterface.removeColumn("exam_cycles", "exam_month");
    }
    if (tableInfo.exam_year) {
      await queryInterface.removeColumn("exam_cycles", "exam_year");
    }
  },
};

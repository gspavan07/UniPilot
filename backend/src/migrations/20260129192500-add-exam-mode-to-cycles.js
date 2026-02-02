const { QueryTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable("exam_cycles");
    if (!tableInfo.exam_mode) {
      await queryInterface.addColumn("exam_cycles", "exam_mode", {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: "regular",
        comment: "Selection for end_semester: regular, supplementary, combined",
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable("exam_cycles");
    if (tableInfo.exam_mode) {
      await queryInterface.removeColumn("exam_cycles", "exam_mode");
    }
  },
};

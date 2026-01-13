"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("exam_cycles", "batch_year", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn("exam_cycles", "semester", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn("exam_cycles", "exam_type", {
      type: Sequelize.ENUM("mid_term", "semester_end", "re_exam", "internal"),
      defaultValue: "semester_end",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("exam_cycles", "batch_year");
    await queryInterface.removeColumn("exam_cycles", "semester");
    await queryInterface.removeColumn("exam_cycles", "exam_type");
  },
};

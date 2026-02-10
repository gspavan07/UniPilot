"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("student_placement_profiles", "resume_url", {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: "URL/Path to the latest master resume",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      "student_placement_profiles",
      "resume_url",
    );
  },
};

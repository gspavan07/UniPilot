"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Add type column
    await queryInterface.addColumn("departments", "type", {
      type: Sequelize.ENUM("academic", "administrative"),
      defaultValue: "academic",
      allowNull: false,
    });

    // 2. Classify Academic Departments
    await queryInterface.bulkUpdate(
      "departments",
      { type: "academic" },
      { code: ["CSE", "AIML", "IT"] }
    );

    // 3. Classify Administrative Teams
    await queryInterface.bulkUpdate(
      "departments",
      { type: "administrative" },
      { code: ["HR", "FIN", "ADM", "EXM", "TRN", "HST", "ITS", "GEN"] }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("departments", "type");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_departments_type";'
    );
  },
};

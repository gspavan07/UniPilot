"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if config already exists
    const existing = await queryInterface.sequelize.query(
      `SELECT id FROM admission_configs WHERE batch_year = 2024 LIMIT 1;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (existing.length === 0) {
      return queryInterface.bulkInsert("admission_configs", [
        {
          id: uuidv4(),
          batch_year: 2024,
          university_code: "B11",
          id_format: "{YY}{UNIV}{BRANCH}{SEQ}",
          temp_id_format: "T{YY}{SEQ}",
          current_sequence: 1,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("admission_configs", null, {});
  },
};

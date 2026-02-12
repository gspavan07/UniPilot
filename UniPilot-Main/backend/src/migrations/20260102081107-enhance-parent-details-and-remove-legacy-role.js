"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // We are just updating the documentation and existing data logic for the JSONB column
    // The previous migration already added parent_details.

    // Add default structure to existing parent_details where empty
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET parent_details = jsonb_build_object(
        'guardian_type', 'Both Parents',
        'father_name', COALESCE(parent_details->>'father_name', ''),
        'father_job', COALESCE(parent_details->>'father_job', ''),
        'father_income', COALESCE(parent_details->>'father_income', ''),
        'father_email', '',
        'father_mobile', '',
        'mother_name', COALESCE(parent_details->>'mother_name', ''),
        'mother_job', COALESCE(parent_details->>'mother_job', ''),
        'mother_income', COALESCE(parent_details->>'mother_income', ''),
        'mother_email', '',
        'mother_mobile', '',
        'guardian_name', '',
        'guardian_job', '',
        'guardian_email', '',
        'guardian_mobile', ''
      )
      WHERE parent_details IS NULL OR parent_details = '{}'::jsonb;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // No specific down action needed as we're just updating data within a JSONB column
  },
};

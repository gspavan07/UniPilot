"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add designation column
    await queryInterface.addColumn("users", "designation", {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: "Job title or designation of the employee",
    });

    // Migrate existing designation data from custom_fields to the new column
    // This uses raw SQL to extract from JSONB and update
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET designation = custom_fields->>'designation'
      WHERE custom_fields->>'designation' IS NOT NULL;
    `);

    // Optional: Remove designation from custom_fields after migration
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET custom_fields = custom_fields - 'designation'
      WHERE custom_fields ? 'designation';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Migrate data back to custom_fields before dropping column
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET custom_fields = jsonb_set(
        COALESCE(custom_fields, '{}'::jsonb),
        '{designation}',
        to_jsonb(designation)
      )
      WHERE designation IS NOT NULL;
    `);

    // Drop the designation column
    await queryInterface.removeColumn("users", "designation");
  },
};

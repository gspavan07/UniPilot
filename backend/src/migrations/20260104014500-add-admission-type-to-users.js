"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("users", "admission_type", {
      type: Sequelize.ENUM("management", "convener"),
      allowNull: true,
      comment: "Type of admission for students",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("users", "admission_type");
    // Also drop the ENUM type if needed (Postgres specific)
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_users_admission_type";'
    );
  },
};

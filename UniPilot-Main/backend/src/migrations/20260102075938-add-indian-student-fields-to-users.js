"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("users", "religion", {
      type: Sequelize.STRING(50),
      allowNull: true,
    });
    await queryInterface.addColumn("users", "caste", {
      type: Sequelize.STRING(50),
      allowNull: true,
    });
    await queryInterface.addColumn("users", "nationality", {
      type: Sequelize.STRING(50),
      allowNull: true,
      defaultValue: "Indian",
    });
    await queryInterface.addColumn("users", "aadhaar_number", {
      type: Sequelize.STRING(20),
      allowNull: true,
      unique: true,
    });
    await queryInterface.addColumn("users", "passport_number", {
      type: Sequelize.STRING(20),
      allowNull: true,
      unique: true,
    });
    await queryInterface.addColumn("users", "joining_date", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
    await queryInterface.addColumn("users", "admission_number", {
      type: Sequelize.STRING(50),
      allowNull: true,
      unique: true,
    });
    await queryInterface.addColumn("users", "parent_details", {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: {},
    });
    await queryInterface.addColumn("users", "previous_academics", {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: [],
    });
    await queryInterface.addColumn("users", "custom_fields", {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: {},
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("users", "religion");
    await queryInterface.removeColumn("users", "caste");
    await queryInterface.removeColumn("users", "nationality");
    await queryInterface.removeColumn("users", "aadhaar_number");
    await queryInterface.removeColumn("users", "passport_number");
    await queryInterface.removeColumn("users", "joining_date");
    await queryInterface.removeColumn("users", "admission_number");
    await queryInterface.removeColumn("users", "parent_details");
    await queryInterface.removeColumn("users", "previous_academics");
    await queryInterface.removeColumn("users", "custom_fields");
  },
};

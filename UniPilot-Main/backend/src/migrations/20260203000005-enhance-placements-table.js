"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add columns to existing placements table
    try {
      await queryInterface.addColumn("placements", "drive_id", {
        type: Sequelize.UUID,
        references: {
          model: "placement_drives",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
      await queryInterface.addColumn("placements", "job_posting_id", {
        type: Sequelize.UUID,
        references: {
          model: "job_postings",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
      await queryInterface.addColumn("placements", "application_id", {
        type: Sequelize.UUID,
        references: {
          model: "student_applications",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
      await queryInterface.addColumn("placements", "offer_accepted_at", {
        type: Sequelize.DATE,
      });
      await queryInterface.addColumn("placements", "joining_date", {
        type: Sequelize.DATEONLY,
      });
      await queryInterface.addColumn("placements", "status", {
        type: Sequelize.ENUM("offered", "accepted", "rejected", "joined"),
        defaultValue: "offered",
      });
    } catch (error) {
      console.log("Error adding columns to placements:", error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("placements", "status");
    await queryInterface.removeColumn("placements", "joining_date");
    await queryInterface.removeColumn("placements", "offer_accepted_at");
    await queryInterface.removeColumn("placements", "application_id");
    await queryInterface.removeColumn("placements", "job_posting_id");
    await queryInterface.removeColumn("placements", "drive_id");
  },
};

"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        "section_incharges",
        {
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
          },
          faculty_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: "users", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },
          department_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: "departments", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },
          program_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: "programs", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },
          batch_year: {
            type: Sequelize.STRING(10),
            allowNull: false,
          },
          section: {
            type: Sequelize.STRING(10),
            allowNull: false,
          },
          academic_year: {
            type: Sequelize.STRING(20),
            allowNull: false,
          },
          is_active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
          },
          assigned_by: {
            type: Sequelize.UUID,
            references: { model: "users", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
          },
          created_at: {
            allowNull: false,
            type: Sequelize.DATE,
          },
          updated_at: {
            allowNull: false,
            type: Sequelize.DATE,
          },
        },
        { transaction: t },
      );

      // Add unique constraint for section per batch/program
      await queryInterface.addConstraint("section_incharges", {
        fields: ["program_id", "batch_year", "section", "academic_year"],
        type: "unique",
        name: "unique_section_incharge_per_academic_year",
        transaction: t,
      });
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("section_incharges");
  },
};

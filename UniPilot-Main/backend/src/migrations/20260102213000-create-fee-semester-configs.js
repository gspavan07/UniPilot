"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("fee_semester_configs", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      program_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "programs", key: "id" },
        onDelete: "CASCADE",
      },
      batch_year: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      semester: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      due_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      fine_type: {
        type: Sequelize.ENUM("none", "fixed", "percentage"),
        defaultValue: "none",
      },
      fine_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Add composite unique index
    await queryInterface.addIndex(
      "fee_semester_configs",
      ["program_id", "batch_year", "semester"],
      {
        unique: true,
        name: "idx_fee_semester_config_unique",
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("fee_semester_configs");
  },
};

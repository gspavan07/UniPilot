"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Check and add columns to fee_structures if they don't exist
      const feeStructuresTable =
        await queryInterface.describeTable("fee_structures");

      if (!feeStructuresTable.is_optional) {
        await queryInterface.addColumn(
          "fee_structures",
          "is_optional",
          {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            comment: "Whether this fee is optional (e.g., Hostel, Transport)",
          },
          { transaction }
        );
      }

      if (!feeStructuresTable.applies_to) {
        await queryInterface.addColumn(
          "fee_structures",
          "applies_to",
          {
            type: Sequelize.ENUM("all", "hostellers", "day_scholars"),
            defaultValue: "all",
            comment: "Which type of students this fee applies to",
          },
          { transaction }
        );
      }

      if (!feeStructuresTable.is_active) {
        await queryInterface.addColumn(
          "fee_structures",
          "is_active",
          {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            comment: "Whether this fee structure is currently active",
          },
          { transaction }
        );
      }

      // Check and add columns to users if they don't exist
      const usersTable = await queryInterface.describeTable("users");

      if (!usersTable.admission_date) {
        await queryInterface.addColumn(
          "users",
          "admission_date",
          {
            type: Sequelize.DATEONLY,
            allowNull: true,
            comment: "Date of admission for students",
          },
          { transaction }
        );
      }

      if (!usersTable.is_hosteller) {
        await queryInterface.addColumn(
          "users",
          "is_hosteller",
          {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            comment: "Whether student is a hosteller",
          },
          { transaction }
        );
      }

      if (!usersTable.requires_transport) {
        await queryInterface.addColumn(
          "users",
          "requires_transport",
          {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            comment: "Whether student requires transport facility",
          },
          { transaction }
        );
      }

      // Add indexes if they don't exist
      try {
        await queryInterface.addIndex(
          "fee_structures",
          ["batch_year", "program_id", "semester"],
          {
            name: "idx_fee_structures_batch_program_semester",
            transaction,
          }
        );
      } catch (e) {
        // Index might already exist, ignore
      }

      try {
        await queryInterface.addIndex("users", ["batch_year"], {
          name: "idx_users_batch_year",
          transaction,
        });
      } catch (e) {
        // Index might already exist, ignore
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes
    try {
      await queryInterface.removeIndex(
        "fee_structures",
        "idx_fee_structures_batch_program_semester"
      );
    } catch (e) {}

    try {
      await queryInterface.removeIndex("users", "idx_users_batch_year");
    } catch (e) {}

    // Remove columns from fee_structures
    await queryInterface.removeColumn("fee_structures", "is_optional");
    await queryInterface.removeColumn("fee_structures", "applies_to");
    await queryInterface.removeColumn("fee_structures", "is_active");

    // Remove columns from users
    await queryInterface.removeColumn("users", "admission_date");
    await queryInterface.removeColumn("users", "is_hosteller");
    await queryInterface.removeColumn("users", "requires_transport");
  },
};

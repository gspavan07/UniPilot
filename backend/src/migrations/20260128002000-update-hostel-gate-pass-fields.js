"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add new columns
    await queryInterface.addColumn("hostel_gate_passes", "going_date", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
    await queryInterface.addColumn("hostel_gate_passes", "coming_date", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
    await queryInterface.addColumn("hostel_gate_passes", "parent_otp", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("hostel_gate_passes", "is_otp_verified", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    await queryInterface.addColumn("hostel_gate_passes", "attendance_synced", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    // 2. Update Status ENUM
    // Note: In Postgres, updating ENUM values requires raw SQL or specific handling
    // We'll use raw SQL to ensure all new statuses are available
    try {
      await queryInterface.sequelize.query(
        "ALTER TYPE \"enum_hostel_gate_passes_status\" ADD VALUE IF NOT EXISTS 'pending';",
      );
      await queryInterface.sequelize.query(
        "ALTER TYPE \"enum_hostel_gate_passes_status\" ADD VALUE IF NOT EXISTS 'approved';",
      );
      await queryInterface.sequelize.query(
        "ALTER TYPE \"enum_hostel_gate_passes_status\" ADD VALUE IF NOT EXISTS 'rejected';",
      );
      await queryInterface.sequelize.query(
        "ALTER TYPE \"enum_hostel_gate_passes_status\" ADD VALUE IF NOT EXISTS 'cancelled';",
      );
    } catch (e) {
      console.log(
        "Enum values might already exist or table doesn't use them yet.",
      );
    }

    // Set default out_time to nullable since we use going_date now
    await queryInterface.changeColumn("hostel_gate_passes", "out_time", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("hostel_gate_passes", "going_date");
    await queryInterface.removeColumn("hostel_gate_passes", "coming_date");
    await queryInterface.removeColumn("hostel_gate_passes", "parent_otp");
    await queryInterface.removeColumn("hostel_gate_passes", "is_otp_verified");
    await queryInterface.removeColumn(
      "hostel_gate_passes",
      "attendance_synced",
    );

    // Changing out_time back to non-nullable might fail if nulls exist
    // So we'll leave it as is in down or handle carefully.
  },
};

"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add pass_type ENUM
    // Note: In Postgres, we use raw SQL for ENUM types if they are new
    try {
      await queryInterface.sequelize.query(
        "CREATE TYPE \"enum_hostel_gate_passes_pass_type\" AS ENUM('day', 'long');",
      );
    } catch (e) {
      console.log("ENUM type might already exist.");
    }

    await queryInterface.addColumn("hostel_gate_passes", "pass_type", {
      type: "enum_hostel_gate_passes_pass_type",
      defaultValue: "long",
      allowNull: false,
    });

    // 2. Add expected_out_time (as STRING to store HH:mm format for the request)
    await queryInterface.addColumn("hostel_gate_passes", "expected_out_time", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // 3. Ensure expected_return_time can store the request time (HH:mm)
    // Actually, the model has expected_return_time as DATE.
    // For consistency with out_time (actual), we might keep DATE for timestamps,
    // but for the "request" part, the user just wants to enter a time.
    // I'll add another field if needed or just use strings for the "request" expectations.

    // Let's add expected_in_time as string for the request
    await queryInterface.addColumn("hostel_gate_passes", "expected_in_time", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("hostel_gate_passes", "pass_type");
    await queryInterface.removeColumn(
      "hostel_gate_passes",
      "expected_out_time",
    );
    await queryInterface.removeColumn("hostel_gate_passes", "expected_in_time");

    try {
      await queryInterface.sequelize.query(
        'DROP TYPE \"enum_hostel_gate_passes_pass_type\";',
      );
    } catch (e) {
      console.log("Error dropping ENUM type.");
    }
  },
};

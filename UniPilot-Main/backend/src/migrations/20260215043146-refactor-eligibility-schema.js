"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Step 1: Add new columns with defaults
    await queryInterface.addColumn(
      "exam_student_eligibilities",
      "fee_clear_permission",
      {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment:
          "false if fee_balance > 0 or needs manual clearance, true if cleared",
      },
    );

    await queryInterface.addColumn(
      "exam_student_eligibilities",
      "has_condonation",
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment:
          "true if attendance < threshold_eligible (condonation fee applicable)",
      },
    );

    // Step 2: Migrate data from old schema to new schema
    // fee_clear_permission = is_fee_cleared
    await queryInterface.sequelize.query(`
      UPDATE exam_student_eligibilities 
      SET fee_clear_permission = is_fee_cleared
    `);

    // Step 3: Drop old columns
    await queryInterface.removeColumn(
      "exam_student_eligibilities",
      "is_fee_cleared",
    );
    await queryInterface.removeColumn(
      "exam_student_eligibilities",
      "condonation_fee_paid",
    );
    await queryInterface.removeColumn(
      "exam_student_eligibilities",
      "is_bypassed",
    );
    await queryInterface.removeColumn(
      "exam_student_eligibilities",
      "bypass_reason",
    );
    await queryInterface.removeColumn(
      "exam_student_eligibilities",
      "condonation_fee_amount",
    );

    // Drop ENUM type for status
    await queryInterface.removeColumn("exam_student_eligibilities", "status");
    await queryInterface.removeColumn("exam_student_eligibilities", "remarks");

    // Step 4: Update hod_permission default value to true
    await queryInterface.changeColumn(
      "exam_student_eligibilities",
      "hod_permission",
      {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment:
          "false if attendance < threshold_condonation (needs HOD approval)",
      },
    );

    // Step 5: Remove old index on status, add new indexes
    await queryInterface.removeIndex("exam_student_eligibilities", ["status"]);
    await queryInterface.addIndex("exam_student_eligibilities", [
      "hod_permission",
    ]);
    await queryInterface.addIndex("exam_student_eligibilities", [
      "fee_clear_permission",
    ]);
  },

  async down(queryInterface, Sequelize) {
    // Rollback: restore old schema
    await queryInterface.addColumn(
      "exam_student_eligibilities",
      "is_fee_cleared",
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    );

    await queryInterface.addColumn(
      "exam_student_eligibilities",
      "condonation_fee_paid",
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    );

    await queryInterface.addColumn(
      "exam_student_eligibilities",
      "is_bypassed",
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    );

    await queryInterface.addColumn(
      "exam_student_eligibilities",
      "bypass_reason",
      {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    );

    await queryInterface.addColumn(
      "exam_student_eligibilities",
      "condonation_fee_amount",
      {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
    );

    await queryInterface.addColumn("exam_student_eligibilities", "status", {
      type: Sequelize.ENUM("eligible", "condonation", "detained", "bypassed"),
      defaultValue: "detained",
    });

    await queryInterface.addColumn("exam_student_eligibilities", "remarks", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    // Migrate data back
    await queryInterface.sequelize.query(`
      UPDATE exam_student_eligibilities 
      SET is_fee_cleared = fee_clear_permission
    `);

    await queryInterface.removeColumn(
      "exam_student_eligibilities",
      "fee_clear_permission",
    );
    await queryInterface.removeColumn(
      "exam_student_eligibilities",
      "has_condonation",
    );

    await queryInterface.changeColumn(
      "exam_student_eligibilities",
      "hod_permission",
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    );

    await queryInterface.removeIndex("exam_student_eligibilities", [
      "hod_permission",
    ]);
    await queryInterface.removeIndex("exam_student_eligibilities", [
      "fee_clear_permission",
    ]);
    await queryInterface.addIndex("exam_student_eligibilities", ["status"]);
  },
};

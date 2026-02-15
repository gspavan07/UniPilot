const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Update exam_cycles table
    await queryInterface.addColumn("exam_cycles", "check_attendance", {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    });
    await queryInterface.addColumn("exam_cycles", "check_fee_clearance", {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    });
    await queryInterface.addColumn(
      "exam_cycles",
      "attendance_threshold_eligible",
      {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 75.0,
      },
    );
    await queryInterface.addColumn(
      "exam_cycles",
      "attendance_threshold_condonation",
      {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 65.0,
      },
    );
    await queryInterface.addColumn("exam_cycles", "condonation_fee_amount", {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    });

    // 2. Create exam_student_eligibilities table
    await queryInterface.createTable("exam_student_eligibilities", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      student_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      exam_cycle_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "exam_cycles", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      attendance_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      fee_balance: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
      },
      is_fee_cleared: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      hod_permission: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      condonation_fee_paid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_bypassed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      bypass_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      bypassed_by: {
        type: DataTypes.UUID,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      status: {
        type: DataTypes.ENUM("eligible", "condonation", "detained", "bypassed"),
        defaultValue: "detained",
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    // 3. Add Indexes
    await queryInterface.addIndex(
      "exam_student_eligibilities",
      ["student_id", "exam_cycle_id"],
      {
        unique: true,
        name: "unique_student_cycle_eligibility",
      },
    );
    await queryInterface.addIndex("exam_student_eligibilities", ["status"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("exam_student_eligibilities");
    await queryInterface.removeColumn("exam_cycles", "check_attendance");
    await queryInterface.removeColumn("exam_cycles", "check_fee_clearance");
    await queryInterface.removeColumn(
      "exam_cycles",
      "attendance_threshold_eligible",
    );
    await queryInterface.removeColumn(
      "exam_cycles",
      "attendance_threshold_condonation",
    );
    await queryInterface.removeColumn("exam_cycles", "condonation_fee_amount");
  },
};

"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Fee Categories
    await queryInterface.createTable("fee_categories", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false, // e.g., "Tuition Fee", "Hostel Fee"
      },
      description: {
        type: Sequelize.TEXT,
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

    // 2. Fee Structures
    await queryInterface.createTable("fee_structures", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "fee_categories", key: "id" },
        onDelete: "CASCADE",
      },
      program_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "programs", key: "id" },
        onDelete: "CASCADE",
      },
      semester: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      due_date: {
        type: Sequelize.DATEONLY,
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

    // 3. Fee Payments
    await queryInterface.createTable("fee_payments", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      student_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      fee_structure_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "fee_structures", key: "id" },
        onDelete: "CASCADE",
      },
      amount_paid: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      payment_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      payment_method: {
        type: Sequelize.ENUM("cash", "online", "bank_transfer", "cheque"),
        defaultValue: "online",
      },
      transaction_id: {
        type: Sequelize.STRING,
        unique: true,
      },
      status: {
        type: Sequelize.ENUM(
          "pending",
          "completed",
          "failed",
          "partially_paid"
        ),
        defaultValue: "completed",
      },
      receipt_url: {
        type: Sequelize.STRING,
      },
      remarks: {
        type: Sequelize.TEXT,
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

    // 4. Fee Waivers (Scholarships)
    await queryInterface.createTable("fee_waivers", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      student_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      fee_content_id: {
        type: Sequelize.UUID, // Link to category or structure
      },
      waiver_type: {
        type: Sequelize.STRING, // e.g., "Merit Scholarship"
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      is_approved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      approved_at: {
        type: Sequelize.DATE,
      },
      approved_by: {
        type: Sequelize.UUID,
        references: { model: "users", key: "id" },
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("fee_waivers");
    await queryInterface.dropTable("fee_payments");
    await queryInterface.dropTable("fee_structures");
    await queryInterface.dropTable("fee_categories");
  },
};

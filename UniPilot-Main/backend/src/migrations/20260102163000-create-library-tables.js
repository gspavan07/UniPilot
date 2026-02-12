"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Books Table
    await queryInterface.createTable("books", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      isbn: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      author: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      category: {
        type: Sequelize.STRING, // e.g., "Computer Science", "Fiction"
      },
      publisher: {
        type: Sequelize.STRING,
      },
      total_copies: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      available_copies: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      status: {
        type: Sequelize.ENUM("available", "out_of_stock", "archived"),
        defaultValue: "available",
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

    // 2. Book Issues (Transactions)
    await queryInterface.createTable("book_issues", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      book_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "books", key: "id" },
        onDelete: "CASCADE",
      },
      student_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      issue_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
      due_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      return_date: {
        type: Sequelize.DATE,
      },
      status: {
        type: Sequelize.ENUM("issued", "returned", "overdue", "lost"),
        defaultValue: "issued",
      },
      fine_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      remarks: {
        type: Sequelize.TEXT,
      },
      issued_by: {
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
    await queryInterface.dropTable("book_issues");
    await queryInterface.dropTable("books");
  },
};

"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("student_documents", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      file_url: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      remarks: {
        type: Sequelize.TEXT,
      },
      verified_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      verified_at: {
        type: Sequelize.DATE,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex("student_documents", ["user_id"]);
    await queryInterface.addIndex("student_documents", ["status"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("student_documents");
  },
};

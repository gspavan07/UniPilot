"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("placement_policies", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      policy_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      policy_type: {
        type: Sequelize.STRING(50),
      },
      policy_rules: {
        type: Sequelize.JSONB,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      academic_year: {
        type: Sequelize.STRING(10),
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

    await queryInterface.createTable("placement_notifications", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      notification_type: {
        type: Sequelize.STRING(50),
      },
      title: {
        type: Sequelize.STRING(255),
      },
      message: {
        type: Sequelize.TEXT,
      },
      related_drive_id: {
        type: Sequelize.UUID,
        references: {
          model: "placement_drives",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      action_url: {
        type: Sequelize.STRING(500),
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      priority: {
        type: Sequelize.ENUM("low", "normal", "high", "urgent"),
        defaultValue: "normal",
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

    await queryInterface.addIndex("placement_notifications", [
      "user_id",
      "is_read",
    ]);

    await queryInterface.createTable("placement_documents", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      document_type: {
        type: Sequelize.STRING(50),
      },
      related_entity_type: {
        type: Sequelize.STRING(50),
      },
      related_entity_id: {
        type: Sequelize.UUID,
      },
      file_name: {
        type: Sequelize.STRING(255),
      },
      file_url: {
        type: Sequelize.STRING(500),
      },
      file_size_kb: {
        type: Sequelize.INTEGER,
      },
      uploaded_by: {
        type: Sequelize.UUID,
        references: {
          model: "users",
          key: "id",
        },
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
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("placement_documents");
    await queryInterface.dropTable("placement_notifications");
    await queryInterface.dropTable("placement_policies");
  },
};

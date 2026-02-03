"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("companies", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      industry: {
        type: Sequelize.STRING(100),
      },
      location: {
        type: Sequelize.STRING(255),
      },
      website: {
        type: Sequelize.STRING(255),
      },
      company_tier: {
        type: Sequelize.ENUM("dream", "super_dream", "regular"),
        defaultValue: "regular",
      },
      tier_package_min: {
        type: Sequelize.DECIMAL(5, 2),
      },
      logo_url: {
        type: Sequelize.STRING(500),
      },
      description: {
        type: Sequelize.TEXT,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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

    await queryInterface.createTable("company_contacts", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      company_id: {
        type: Sequelize.UUID,
        references: {
          model: "companies",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      designation: {
        type: Sequelize.STRING(100),
      },
      email: {
        type: Sequelize.STRING(255),
      },
      phone: {
        type: Sequelize.STRING(20),
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
    await queryInterface.dropTable("company_contacts");
    await queryInterface.dropTable("companies");
    // Note: We might want to keep the ENUM type if it's used elsewhere,
    // but usually in PG/Sequelize migrations, it's safer to drop it if it's specific to this table.
    // However, Sequelize manages ENUMs slightly differently in PG.
  },
};

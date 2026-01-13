"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("admission_configs", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      batch_year: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
      },
      university_code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: "B11",
      },
      id_format: {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: "{YY}{UNIV}{BRANCH}{SEQ}",
        comment:
          "{YY}=Year, {UNIV}=University Code, {BRANCH}=Program Code, {SEQ}=Sequence",
      },
      temp_id_format: {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: "T{YY}{SEQ}",
      },
      current_sequence: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("admission_configs");
  },
};

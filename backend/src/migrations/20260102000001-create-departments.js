'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('departments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
        unique: true,
      },
      code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
      },
      hod_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      parent_department_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(255),
      },
      phone: {
        type: Sequelize.STRING(20),
      },
      office_location: {
        type: Sequelize.STRING(200),
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      established_date: {
        type: Sequelize.DATEONLY,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes
    await queryInterface.addIndex('departments', ['code'], { unique: true });
    await queryInterface.addIndex('departments', ['name'], { unique: true });
    await queryInterface.addIndex('departments', ['hod_id']);
    await queryInterface.addIndex('departments', ['is_active']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('departments');
  }
};

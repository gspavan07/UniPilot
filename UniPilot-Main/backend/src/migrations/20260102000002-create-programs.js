'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('programs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
      },
      degree_type: {
        type: Sequelize.ENUM('diploma', 'undergraduate', 'postgraduate', 'doctoral'),
        allowNull: false,
      },
      duration_years: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      total_semesters: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      department_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'departments',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      min_percentage: {
        type: Sequelize.DECIMAL(5, 2),
      },
      max_intake: {
        type: Sequelize.INTEGER,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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
    await queryInterface.addIndex('programs', ['code'], { unique: true });
    await queryInterface.addIndex('programs', ['department_id']);
    await queryInterface.addIndex('programs', ['degree_type']);
    await queryInterface.addIndex('programs', ['is_active']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('programs');
  }
};

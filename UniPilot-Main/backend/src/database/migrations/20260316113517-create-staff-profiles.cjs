'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('staff_profiles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      employee_id: {
        type: Sequelize.STRING(50),
        unique: true,
      },
      department_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'departments',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      salary_grade_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'salary_grades',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      designation: {
        type: Sequelize.STRING(100),
      },
      joining_date: {
        type: Sequelize.DATEONLY,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
    });

    // Add indexes for quick lookups
    await queryInterface.addIndex('staff_profiles', ['user_id']);
    await queryInterface.addIndex('staff_profiles', ['employee_id']);
    await queryInterface.addIndex('staff_profiles', ['department_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('staff_profiles');
  }
};

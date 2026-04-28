'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('student_profiles', {
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
      student_id: {
        type: Sequelize.STRING(50),
        unique: true,
      },
      program_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'programs',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      regulation_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'regulations',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      batch_year: {
        type: Sequelize.INTEGER,
      },
      current_semester: {
        type: Sequelize.INTEGER,
      },
      section: {
        type: Sequelize.STRING(10),
      },
      admission_date: {
        type: Sequelize.DATEONLY,
      },
      is_hosteller: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      requires_transport: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      academic_status: {
        type: Sequelize.ENUM('active', 'promoted', 'detained', 'semester_back', 'graduated', 'dropout'),
        defaultValue: 'active',
      },
      admission_number: {
        type: Sequelize.STRING(50),
        unique: true,
      },
      admission_type: {
        type: Sequelize.ENUM('management', 'convener'),
        allowNull: true,
      },
      is_lateral: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_temporary_id: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      parent_details: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      previous_academics: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      is_placement_coordinator: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
    await queryInterface.addIndex('student_profiles', ['user_id']);
    await queryInterface.addIndex('student_profiles', ['student_id']);
    await queryInterface.addIndex('student_profiles', ['admission_number']);
    await queryInterface.addIndex('student_profiles', ['program_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('student_profiles');
  }
};

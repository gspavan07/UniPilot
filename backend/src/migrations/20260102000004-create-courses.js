'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('courses', {
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
      credits: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 3,
      },
      course_type: {
        type: Sequelize.ENUM('theory', 'practical', 'theory_practical'),
        defaultValue: 'theory',
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
      semester: {
        type: Sequelize.INTEGER,
      },
      syllabus_url: {
        type: Sequelize.STRING(500),
      },
      prerequisites: {
        type: Sequelize.JSONB,
        defaultValue: [],
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
    await queryInterface.addIndex('courses', ['code'], { unique: true });
    await queryInterface.addIndex('courses', ['department_id']);
    await queryInterface.addIndex('courses', ['program_id']);
    await queryInterface.addIndex('courses', ['is_active']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('courses');
  }
};

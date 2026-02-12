'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      phone: {
        type: Sequelize.STRING(20),
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM('admin', 'hod', 'faculty', 'student', 'alumni', 'staff'),
        allowNull: false,
        defaultValue: 'student',
      },
      employee_id: {
        type: Sequelize.STRING(50),
        unique: true,
      },
      student_id: {
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
      batch_year: {
        type: Sequelize.INTEGER,
      },
      current_semester: {
        type: Sequelize.INTEGER,
      },
      academic_status: {
        type: Sequelize.ENUM('active', 'promoted', 'detained', 'semester_back', 'graduated', 'dropout'),
        defaultValue: 'active',
      },
      date_of_birth: {
        type: Sequelize.DATEONLY,
      },
      gender: {
        type: Sequelize.ENUM('male', 'female', 'other'),
      },
      address: {
        type: Sequelize.TEXT,
      },
      city: {
        type: Sequelize.STRING(100),
      },
      state: {
        type: Sequelize.STRING(100),
      },
      zip_code: {
        type: Sequelize.STRING(20),
      },
      profile_picture: {
        type: Sequelize.STRING(500),
      },
      bio: {
        type: Sequelize.TEXT,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      email_verified_at: {
        type: Sequelize.DATE,
      },
      last_login: {
        type: Sequelize.DATE,
      },
      password_reset_token: {
        type: Sequelize.STRING(255),
      },
      password_reset_expires: {
        type: Sequelize.DATE,
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
    await queryInterface.addIndex('users', ['email'], { unique: true });
    await queryInterface.addIndex('users', ['employee_id'], { 
      unique: true,
      where: { employee_id: { [Sequelize.Op.ne]: null } }
    });
    await queryInterface.addIndex('users', ['student_id'], { 
      unique: true,
      where: { student_id: { [Sequelize.Op.ne]: null } }
    });
    await queryInterface.addIndex('users', ['role']);
    await queryInterface.addIndex('users', ['department_id']);
    await queryInterface.addIndex('users', ['is_active']);

    // Add foreign key constraint for departments.hod_id -> users.id
    await queryInterface.addConstraint('departments', {
      fields: ['hod_id'],
      type: 'foreign key',
      name: 'departments_hod_id_fkey',
      references: {
        table: 'users',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('departments', 'departments_hod_id_fkey');
    await queryInterface.dropTable('users');
  }
};

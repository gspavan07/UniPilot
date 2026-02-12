"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Create Roles table
    await queryInterface.createTable("roles", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      slug: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
      },
      field_config: {
        type: Sequelize.JSONB,
        defaultValue: {},
        comment:
          "Stores visibility and requirement rules for user fields for this role",
      },
      is_system: {
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

    // 2. Create Permissions table
    await queryInterface.createTable("permissions", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      slug: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      module: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: "Group like 'users', 'departments', 'analytics'",
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

    // 3. Create RolePermissions join table
    await queryInterface.createTable("role_permissions", {
      role_id: {
        type: Sequelize.UUID,
        references: { model: "roles", key: "id" },
        onDelete: "CASCADE",
        primaryKey: true,
      },
      permission_id: {
        type: Sequelize.UUID,
        references: { model: "permissions", key: "id" },
        onDelete: "CASCADE",
        primaryKey: true,
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

    // 4. Seed basic System Roles
    const now = new Date();
    const systemRoles = [
      {
        id: "7b4f5351-408b-4b13-a447-fd9421f1e29c", // Hardcoded for consistency if needed
        name: "Administrator",
        slug: "admin",
        description: "Full system access",
        is_system: true,
        field_config: JSON.stringify({
          employee_id: { visible: true, required: true },
        }),
        created_at: now,
        updated_at: now,
      },
      {
        id: "2e1d7a8e-28db-4e11-9a99-444a56a68212",
        name: "Student",
        slug: "student",
        description: "Standard student role",
        is_system: true,
        field_config: JSON.stringify({
          student_id: { visible: true, required: true },
          program_id: { visible: true, required: true },
          current_semester: { visible: true, required: true },
        }),
        created_at: now,
        updated_at: now,
      },
      {
        id: "f3a2b1c0-d4e5-4a2b-9c8d-7e6f5a4b3c2d",
        name: "Faculty",
        slug: "faculty",
        description: "Standard teaching staff",
        is_system: true,
        field_config: JSON.stringify({
          employee_id: { visible: true, required: true },
          designation: { visible: true, required: true },
        }),
        created_at: now,
        updated_at: now,
      },
      {
        id: "a1b2c3d4-e5f6-4a5b-9c8d-7e6f5a4b3c2d",
        name: "Staff",
        slug: "staff",
        description: "Non-teaching administrative staff",
        is_system: true,
        field_config: JSON.stringify({
          employee_id: { visible: true, required: true },
        }),
        created_at: now,
        updated_at: now,
      },
    ];

    await queryInterface.bulkInsert("roles", systemRoles);

    // 5. Add role_id to users table (temporarily allow null)
    await queryInterface.addColumn("users", "role_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: "roles", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // 6. Data Migration: Map existing role strings to role_ids
    // This is a simple update query based on the slugs seeded above
    await queryInterface.sequelize.query(`
      UPDATE users SET role_id = '7b4f5351-408b-4b13-a447-fd9421f1e29c' WHERE role = 'admin';
      UPDATE users SET role_id = '2e1d7a8e-28db-4e11-9a99-444a56a68212' WHERE role = 'student';
      UPDATE users SET role_id = 'f3a2b1c0-d4e5-4a2b-9c8d-7e6f5a4b3c2d' WHERE role IN ('faculty', 'hod');
      UPDATE users SET role_id = 'a1b2c3d4-e5f6-4a5b-9c8d-7e6f5a4b3c2d' WHERE role = 'staff';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("users", "role_id");
    await queryInterface.dropTable("role_permissions");
    await queryInterface.dropTable("permissions");
    await queryInterface.dropTable("roles");
  },
};

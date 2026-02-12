"use strict";

const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add hostel permissions using raw SQL
    const permissionIds = {
      read: uuidv4(),
      write: uuidv4(),
      delete: uuidv4(),
      manage: uuidv4(),
    };

    await queryInterface.sequelize.query(`
      INSERT INTO permissions (id, name, slug, module, description, created_at, updated_at)
      VALUES
        ('${permissionIds.read}', 'View Hostel', 'hostel:read', 'Hostel', 'View hostel information', NOW(), NOW()),
        ('${permissionIds.write}', 'Manage Hostel', 'hostel:write', 'Hostel', 'Create and update hostel records', NOW(), NOW()),
        ('${permissionIds.delete}', 'Delete Hostel', 'hostel:delete', 'Hostel', 'Delete hostel records', NOW(), NOW()),
        ('${permissionIds.manage}', 'Hostel Admin', 'hostel:manage', 'Hostel', 'Full hostel management access', NOW(), NOW())
    `);

    // Add hostel roles using raw SQL
    const roleIds = {
      admin: uuidv4(),
      warden: uuidv4(),
      staff: uuidv4(),
    };

    await queryInterface.sequelize.query(`
      INSERT INTO roles (id, name, slug, description, created_at, updated_at)
      VALUES
        ('${roleIds.admin}', 'Hostel Admin', 'hostel_admin', 'Full hostel management access', NOW(), NOW()),
        ('${roleIds.warden}', 'Hostel Warden', 'hostel_warden', 'Hostel operations and discipline management', NOW(), NOW()),
        ('${roleIds.staff}', 'Hostel Staff', 'hostel_staff', 'Day-to-day hostel operations', NOW(), NOW())
    `);

    // Assign permissions to roles
    await queryInterface.sequelize.query(`
      INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
      VALUES
        -- Hostel Admin gets all permissions
        ('${roleIds.admin}', '${permissionIds.read}', NOW(), NOW()),
        ('${roleIds.admin}', '${permissionIds.write}', NOW(), NOW()),
        ('${roleIds.admin}', '${permissionIds.delete}', NOW(), NOW()),
        ('${roleIds.admin}', '${permissionIds.manage}', NOW(), NOW()),
        -- Hostel Warden gets read and write
        ('${roleIds.warden}', '${permissionIds.read}', NOW(), NOW()),
        ('${roleIds.warden}', '${permissionIds.write}', NOW(), NOW()),
        -- Hostel Staff gets read only
        ('${roleIds.staff}', '${permissionIds.read}', NOW(), NOW())
    `);
  },

  async down(queryInterface, Sequelize) {
    // Remove role permissions
    await queryInterface.sequelize.query(`
      DELETE FROM role_permissions WHERE role_id IN (
        SELECT id FROM roles WHERE slug IN ('hostel_admin', 'hostel_warden', 'hostel_staff')
      )
    `);

    // Remove roles
    await queryInterface.bulkDelete("roles", {
      slug: ["hostel_admin", "hostel_warden", "hostel_staff"],
    });

    // Remove permissions
    await queryInterface.bulkDelete("permissions", {
      module: "Hostel",
    });
  },
};

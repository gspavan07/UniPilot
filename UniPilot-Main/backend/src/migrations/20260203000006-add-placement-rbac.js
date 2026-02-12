"use strict";

const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Add Placement Permissions
    const permissions = [
      {
        id: uuidv4(),
        name: "Manage Companies",
        slug: "placement.company.manage",
        module: "Placement",
        description: "Create, update and delete company profiles",
      },
      {
        id: uuidv4(),
        name: "Manage Drives",
        slug: "placement.drive.manage",
        module: "Placement",
        description: "Schedule and manage placement drives",
      },
      {
        id: uuidv4(),
        name: "View All Students",
        slug: "placement.student.view_all",
        module: "Placement",
        description: "View all students placement profiles and status",
      },
      {
        id: uuidv4(),
        name: "View All Reports",
        slug: "placement.reports.view_all",
        module: "Placement",
        description: "View university-wide placement reports",
      },
      {
        id: uuidv4(),
        name: "Manage Policies",
        slug: "placement.policy.manage",
        module: "Placement",
        description: "Configure placement rules and policies",
      },
      {
        id: uuidv4(),
        name: "View Dept Placement",
        slug: "placement.department.view",
        module: "Placement",
        description: "View department-specific placement data",
      },
      {
        id: uuidv4(),
        name: "View Dept Reports",
        slug: "placement.department.reports",
        module: "Placement",
        description: "View department-specific reports",
      },
      {
        id: uuidv4(),
        name: "Manage Own Profile",
        slug: "placement.profile.manage_own",
        module: "Placement",
        description: "Manage own placement profile and resume",
      },
      {
        id: uuidv4(),
        name: "Browse Drives",
        slug: "placement.drive.view",
        module: "Placement",
        description: "View and browse eligible placement drives",
      },
      {
        id: uuidv4(),
        name: "Apply to Drive",
        slug: "placement.drive.apply",
        module: "Placement",
        description: "Apply to eligible placement drives",
      },
      {
        id: uuidv4(),
        name: "Manage Own Offers",
        slug: "placement.offer.manage_own",
        module: "Placement",
        description: "Accept or reject placement offers",
      },
    ];

    const permissionRows = permissions
      .map(
        (p) =>
          `('${p.id}', '${p.name}', '${p.slug}', '${p.module}', '${p.description}', NOW(), NOW())`,
      )
      .join(",");

    await queryInterface.sequelize.query(`
      INSERT INTO permissions (id, name, slug, module, description, created_at, updated_at)
      VALUES ${permissionRows}
    `);

    // 2. Add Placement Roles
    const roleIds = {
      tpo: uuidv4(),
      pc: uuidv4(),
    };

    await queryInterface.sequelize.query(`
      INSERT INTO roles (id, name, slug, description, created_at, updated_at)
      VALUES 
        ('${roleIds.tpo}', 'Training & Placement Officer', 'tpo', 'Full placement management across university', NOW(), NOW()),
        ('${roleIds.pc}', 'Placement Coordinator', 'placement_coordinator', 'Department specific placement coordination', NOW(), NOW())
    `);

    // 3. Assign Permissions to Roles

    // TPO gets everything except student specific 'own' permissions (though they could have them)
    // Actually TPO gets all management permissions
    const tpoPermissionsSlugs = [
      "placement.company.manage",
      "placement.drive.manage",
      "placement.student.view_all",
      "placement.reports.view_all",
      "placement.policy.manage",
    ];

    // Coordinator gets department specific
    const pcPermissionsSlugs = [
      "placement.department.view",
      "placement.department.reports",
    ];

    // Existing Student role gets student specific
    const studentPermissionsSlugs = [
      "placement.profile.manage_own",
      "placement.drive.view",
      "placement.drive.apply",
      "placement.offer.manage_own",
    ];

    // Helper to get permission IDs by slugs
    const [allPermissions] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM permissions WHERE module = 'Placement'`,
    );
    const getIds = (slugs) =>
      allPermissions.filter((p) => slugs.includes(p.slug)).map((p) => p.id);

    const tpoIds = getIds(tpoPermissionsSlugs);
    const pcIds = getIds(pcPermissionsSlugs);
    const studentIds = getIds(studentPermissionsSlugs);

    // Assign to TPO
    if (tpoIds.length > 0) {
      const tpoRows = tpoIds
        .map((id) => `('${roleIds.tpo}', '${id}', NOW(), NOW())`)
        .join(",");
      await queryInterface.sequelize.query(
        `INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at) VALUES ${tpoRows}`,
      );
    }

    // Assign to PC
    if (pcIds.length > 0) {
      const pcRows = pcIds
        .map((id) => `('${roleIds.pc}', '${id}', NOW(), NOW())`)
        .join(",");
      await queryInterface.sequelize.query(
        `INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at) VALUES ${pcRows}`,
      );
    }

    // Assign to Student role (assuming slug is 'student')
    const [studentRole] = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE slug = 'student' LIMIT 1`,
    );
    if (studentRole && studentRole.length > 0 && studentIds.length > 0) {
      const studentRoleId = studentRole[0].id;
      const studentRows = studentIds
        .map((id) => `('${studentRoleId}', '${id}', NOW(), NOW())`)
        .join(",");
      await queryInterface.sequelize.query(
        `INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at) VALUES ${studentRows}`,
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove roles
    await queryInterface.sequelize.query(
      `DELETE FROM role_permissions WHERE role_id IN (SELECT id FROM roles WHERE slug IN ('tpo', 'placement_coordinator'))`,
    );

    // Remove permissions from student role
    const [studentRole] = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE slug = 'student' LIMIT 1`,
    );
    if (studentRole && studentRole.length > 0) {
      await queryInterface.sequelize.query(
        `DELETE FROM role_permissions WHERE role_id = '${studentRole[0].id}' AND permission_id IN (SELECT id FROM permissions WHERE module = 'Placement')`,
      );
    }

    await queryInterface.sequelize.query(
      `DELETE FROM roles WHERE slug IN ('tpo', 'placement_coordinator')`,
    );

    // Remove permissions
    await queryInterface.sequelize.query(
      `DELETE FROM permissions WHERE module = 'Placement'`,
    );
  },
};

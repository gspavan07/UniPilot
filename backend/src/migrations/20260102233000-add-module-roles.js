"use strict";
const { v4: uuidv4 } = require("uuid");

const modules = [
  "exam",
  "finance",
  "admission",
  "academics",
  "hr",
  "id_card",
  "transport",
  "hostel",
];

const rolesConfig = [
  // Exam
  {
    name: "Exam Admin",
    slug: "exam_admin",
    description: "Full access to Exam Management",
    permissions: ["exam:admin", "exam:read", "exam:write"],
  },
  {
    name: "Exam Coordinator",
    slug: "exam_coordinator",
    description: "Department level exam coordination",
    permissions: ["exam:read", "exam:write"],
  },
  {
    name: "Exam Staff",
    slug: "exam_staff",
    description: "Clerical exam tasks",
    permissions: ["exam:read"],
  },
  // Finance
  {
    name: "Finance Admin",
    slug: "finance_admin",
    description: "Full access to Finance Management",
    permissions: ["finance:admin", "finance:read", "finance:write"],
  },
  {
    name: "Finance Staff",
    slug: "finance_staff",
    description: "Clerical finance tasks",
    permissions: ["finance:read", "finance:write"],
  },
  // Admission
  {
    name: "Admission Admin",
    slug: "admission_admin",
    description: "Full access to Admission Management",
    permissions: ["admission:admin", "admission:read", "admission:write"],
  },
  {
    name: "Admission Staff",
    slug: "admission_staff",
    description: "Clerical admission tasks",
    permissions: ["admission:read", "admission:write"],
  },
  // Academics
  {
    name: "Academic Admin",
    slug: "academic_admin",
    description: "Full access to Academic Management",
    permissions: ["academics:admin", "academics:read", "academics:write"],
  },
  {
    name: "Academic Staff",
    slug: "academic_staff",
    description: "Clerical academic tasks",
    permissions: ["academics:read"],
  },
  // HR
  {
    name: "HR Admin",
    slug: "hr_admin",
    description: "Full access to HR Management",
    permissions: ["hr:admin", "hr:read", "hr:write"],
  },
  {
    name: "HR Staff",
    slug: "hr_staff",
    description: "Clerical HR tasks",
    permissions: ["hr:read", "hr:write"],
  },
  // ID Card
  {
    name: "ID Card Admin",
    slug: "id_admin",
    description: "Full access to ID Card Management",
    permissions: ["id_card:admin", "id_card:read", "id_card:write"],
  },
  {
    name: "ID Card Staff",
    slug: "id_staff",
    description: "Clerical ID Card tasks",
    permissions: ["id_card:read", "id_card:write"],
  },
  // Transport
  {
    name: "Transport Admin",
    slug: "transport_admin",
    description: "Full access to Transport Management",
    permissions: ["transport:admin", "transport:read", "transport:write"],
  },
  {
    name: "Transport Staff",
    slug: "transport_staff",
    description: "Clerical transport tasks",
    permissions: ["transport:read", "transport:write"],
  },
  // Hostel
  {
    name: "Hostel Admin",
    slug: "hostel_admin",
    description: "Full access to Hostel Management",
    permissions: ["hostel:admin", "hostel:read", "hostel:write"],
  },
  {
    name: "Hostel Warden",
    slug: "hostel_warden",
    description: "Warden access to Hostel Management",
    permissions: ["hostel:read", "hostel:write"],
  },
  {
    name: "Hostel Staff",
    slug: "hostel_staff",
    description: "Clerical hostel tasks",
    permissions: ["hostel:read"],
  },
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // 1. Create Permissions
    const permissions = [];
    modules.forEach((module) => {
      // Admin permission
      permissions.push({
        id: uuidv4(),
        name: `Manage ${module} (Admin)`,
        slug: `${module}:admin`,
        module: module,
        created_at: now,
        updated_at: now,
      });
      // Write permission
      permissions.push({
        id: uuidv4(),
        name: `Edit ${module}`,
        slug: `${module}:write`,
        module: module,
        created_at: now,
        updated_at: now,
      });
      // Read permission
      permissions.push({
        id: uuidv4(),
        name: `View ${module}`,
        slug: `${module}:read`,
        module: module,
        created_at: now,
        updated_at: now,
      });
    });

    await queryInterface.bulkInsert("permissions", permissions);

    // 2. Create Roles and Map Permissions
    const rolePermissions = [];
    const roles = [];

    for (const config of rolesConfig) {
      const roleId = uuidv4();
      roles.push({
        id: roleId,
        name: config.name,
        slug: config.slug,
        description: config.description,
        is_system: false, // These are specialized roles, not core system roles
        field_config: JSON.stringify({}),
        created_at: now,
        updated_at: now,
      });

      // Find permission IDs for this role
      const rolePerms = permissions.filter((p) =>
        config.permissions.includes(p.slug)
      );

      rolePerms.forEach((p) => {
        rolePermissions.push({
          role_id: roleId,
          permission_id: p.id,
          created_at: now,
          updated_at: now,
        });
      });
    }

    await queryInterface.bulkInsert("roles", roles);
    await queryInterface.bulkInsert("role_permissions", rolePermissions);
  },

  down: async (queryInterface, Sequelize) => {
    // Basic cleanup - removing roles and permissions created in this migration
    // Note: In a real prod env, might want to be more selective, but for dev this is fine.
    const Op = Sequelize.Op;

    // We can't easily delete via ID since they are random UUIDs,
    // so we delete by slug pattern or module list.

    // Deleting permissions
    const permissionSlugs = [];
    modules.forEach((m) => {
      permissionSlugs.push(`${m}:admin`, `${m}:write`, `${m}:read`);
    });

    await queryInterface.bulkDelete("permissions", {
      slug: { [Op.in]: permissionSlugs },
    });

    // Deleting roles
    const roleSlugs = rolesConfig.map((r) => r.slug);
    await queryInterface.bulkDelete("roles", {
      slug: { [Op.in]: roleSlugs },
    });

    // role_permissions will cascade delete due to foreign keys usually,
    // or we can explicitly delete if FK constraints aren't set up that way.
  },
};

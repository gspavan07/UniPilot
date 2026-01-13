"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const permissions = [
      // Academics Module
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "View Courses",
        slug: "academics:courses:view",
        module: "Academics",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "Manage Courses",
        slug: "academics:courses:manage",
        module: "Academics",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "View Attendance",
        slug: "academics:attendance:view",
        module: "Academics",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "Mark Attendance",
        slug: "academics:attendance:mark",
        module: "Academics",
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Exams Module
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "View Exam Schedule",
        slug: "exams:schedule:view",
        module: "Exams",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "Manage Exam Schedule",
        slug: "exams:schedule:manage",
        module: "Exams",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "Enter Marks",
        slug: "exams:marks:entry",
        module: "Exams",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "Publish Results",
        slug: "exams:results:publish",
        module: "Exams",
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Finance Module
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "View Fees",
        slug: "finance:fees:view",
        module: "Finance",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "Collect Fees",
        slug: "finance:fees:collect",
        module: "Finance",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "Process Payroll",
        slug: "finance:payroll:process",
        module: "Finance",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "View Financial Reports",
        slug: "finance:reports:view",
        module: "Finance",
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Admission Module
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "View Applications",
        slug: "admissions:applications:view",
        module: "Admissions",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "Process Admissions",
        slug: "admissions:process",
        module: "Admissions",
        created_at: new Date(),
        updated_at: new Date(),
      },

      // User Management
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "View Users",
        slug: "users:view",
        module: "Users",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "Create Users",
        slug: "users:create",
        module: "Users",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "Edit Users",
        slug: "users:edit",
        module: "Users",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "Delete Users",
        slug: "users:delete",
        module: "Users",
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Settings
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "View Roles",
        slug: "settings:roles:view",
        module: "Settings",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "Manage Roles",
        slug: "settings:roles:manage",
        module: "Settings",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    return queryInterface.bulkInsert("permissions", permissions);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("permissions", null, {});
  },
};

"use strict";

const { hashPassword } = require("../utils/bcrypt");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create initial admin user
    const adminPassword = await hashPassword("Admin@123"); // Change this!

    await queryInterface.bulkInsert(
      "users",
      [
        {
          id: Sequelize.literal("gen_random_uuid()"),
          first_name: "System",
          last_name: "Administrator",
          email: "admin@university.edu",
          password_hash: adminPassword,
          role: "admin",
          is_active: true,
          is_verified: true,
          email_verified_at: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    console.log("✓ Initial admin user created");
    console.log("  Email: admin@university.edu");
    console.log("  Password: Admin@123");
    console.log("  PLEASE CHANGE PASSWORD AFTER FIRST LOGIN!");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete(
      "users",
      {
        email: "admin@university.edu",
      },
      {}
    );
  },
};

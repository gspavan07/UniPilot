"use strict";

const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Fetch all roles (including the custom ones we just created)
    const roles = await queryInterface.sequelize.query(
      `SELECT id, name, slug FROM roles`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const users = [];
    const passwordHash = await bcrypt.hash("password123", 10);
    const now = new Date();

    // 2. Create a user for each role
    for (const role of roles) {
      // Skip if it's the generic 'student' role as we might already have seeds or want specific student seeds elsewhere
      // But for completeness let's add one representative if not exist.
      // Actually, let's just do it for all to be safe and thorough.

      const firstName = role.name.split(" ")[0]; // e.g. "Exam" from "Exam Admin"
      const lastName = role.name.split(" ").slice(1).join(" ") || "User"; // e.g. "Admin"

      const email = `${role.slug.replace(/_/g, ".")}@unipilot.com`; // e.g. exam.admin@unipilot.com

      users.push({
        id: uuidv4(),
        first_name: firstName,
        last_name: lastName,
        email: email,
        password_hash: passwordHash,
        role: role.slug.includes("admin") ? "admin" : "staff", // Fallback to ENUM values to satisfy constraint
        role_id: role.id, // The new RBAC link
        is_active: true,
        created_at: now,
        updated_at: now,
      });
    }

    // 3. Insert users, ignoring duplicates if email exists (using upsert logic or just ignore)
    // Sequelize bulkInsert doesn't support ignoreDuplicates on all dialects perfectly,
    // but for Postgres we can try.
    // Safer to check existence first or just try/catch?
    // Let's just do a clean insert of checking existence first or deleting old test users?
    // User asked to "create users", implying new ones.

    // Let's filter out users that might conflict (by email) to be safe
    const existingEmails = await queryInterface.sequelize.query(
      `SELECT email FROM users WHERE email IN (:emails)`,
      {
        replacements: { emails: users.map((u) => u.email) },
        type: queryInterface.sequelize.QueryTypes.SELECT,
      }
    );
    const existingEmailSet = new Set(existingEmails.map((e) => e.email));

    const newUsers = users.filter((u) => !existingEmailSet.has(u.email));

    if (newUsers.length > 0) {
      await queryInterface.bulkInsert("users", newUsers);
      console.log(`Seeded ${newUsers.length} RBAC users.`);
    } else {
      console.log("All RBAC users already exist. Skipping.");
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Delete users ending in @unipilot.com that we likely created
    // Be careful not to delete real users if they use this domain in prod (unlikely for this dev task)
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete("users", {
      email: { [Op.like]: "%@unipilot.com" },
    });
  },
};

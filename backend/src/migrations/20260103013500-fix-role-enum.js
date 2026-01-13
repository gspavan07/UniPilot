"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 0. Drop the default value first to unlink from ENUM
    await queryInterface.sequelize.query(
      `ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;`
    );

    // 1. Alter column to VARCHAR (String)
    // PostgreSQL might need an explicit cast
    await queryInterface.sequelize.query(
      `ALTER TABLE "users" ALTER COLUMN "role" TYPE VARCHAR(255) USING "role"::VARCHAR(255);`
    );

    // 2. Drop the old enum type if it exists
    // Note: We do this safely
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_users_role";`
    );

    // 3. Ensure default value is compatible
    await queryInterface.changeColumn("users", "role", {
      type: Sequelize.STRING(255),
      defaultValue: "student",
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Reverting is complex because we'd need to know strictly which values are allowed in the enum.
    // For now, we will just revert to a basic string logic or re-create a generic enum if absolutely needed.
    // But typically moving from Enum -> String is a one-way compatible upgrade.
    // We'll leave it as String to avoid data loss.
  },
};

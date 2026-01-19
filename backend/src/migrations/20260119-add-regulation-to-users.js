"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("users", "regulation_id", {
      type: Sequelize.UUID,
      allowNull: true, // Existing users might not have one immediately
      references: {
        model: "regulations",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addIndex("users", ["regulation_id"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex("users", ["regulation_id"]);
    await queryInterface.removeColumn("users", "regulation_id");
  },
};

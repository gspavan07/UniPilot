const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("departments", "block_id", {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "blocks",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("departments", "room_id", {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "rooms",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("departments", "room_id");
    await queryInterface.removeColumn("departments", "block_id");
  },
};

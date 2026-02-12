const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface) => {
    // Add block_id and room_id to timetable_slots
    await queryInterface.addColumn("timetable_slots", "block_id", {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "blocks",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("timetable_slots", "room_id", {
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

  down: async (queryInterface) => {
    await queryInterface.removeColumn("timetable_slots", "room_id");
    await queryInterface.removeColumn("timetable_slots", "block_id");
  },
};

const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface) => {
    // Add activity_name column
    await queryInterface.addColumn("timetable_slots", "activity_name", {
      type: DataTypes.STRING,
      allowNull: true,
      comment:
        "For non-course activities like 'Coding Training', 'Sports', etc.",
    });

    // Make course_id and faculty_id nullable
    await queryInterface.changeColumn("timetable_slots", "course_id", {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "courses", key: "id" },
    });

    await queryInterface.changeColumn("timetable_slots", "faculty_id", {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "users", key: "id" },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("timetable_slots", "activity_name");

    // Revert to non-nullable (this might fail if there are null values)
    await queryInterface.changeColumn("timetable_slots", "course_id", {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "courses", key: "id" },
    });

    await queryInterface.changeColumn("timetable_slots", "faculty_id", {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
    });
  },
};

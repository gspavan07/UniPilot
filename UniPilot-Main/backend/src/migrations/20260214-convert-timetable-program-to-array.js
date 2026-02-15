const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Step 1: Add temporary column for array of program IDs
    await queryInterface.addColumn("exam_timetables", "program_ids_temp", {
      type: DataTypes.ARRAY(DataTypes.UUID),
      allowNull: true,
    });

    // Step 2: Migrate existing data to array format
    await queryInterface.sequelize.query(`
      UPDATE exam_timetables 
      SET program_ids_temp = ARRAY[program_id]::uuid[]
      WHERE program_id IS NOT NULL
    `);

    // Step 3: Drop the old program_id column
    await queryInterface.removeColumn("exam_timetables", "program_id");

    // Step 4: Rename temp column to program_id
    await queryInterface.renameColumn(
      "exam_timetables",
      "program_ids_temp",
      "program_id",
    );

    // Step 5: Make the new column non-nullable
    await queryInterface.changeColumn("exam_timetables", "program_id", {
      type: DataTypes.ARRAY(DataTypes.UUID),
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert back to single UUID
    // Note: This will only keep the first program if there are multiple
    await queryInterface.addColumn("exam_timetables", "program_id_temp", {
      type: DataTypes.UUID,
      allowNull: true,
    });

    await queryInterface.sequelize.query(`
      UPDATE exam_timetables 
      SET program_id_temp = program_id[1]
      WHERE program_id IS NOT NULL AND array_length(program_id, 1) > 0
    `);

    await queryInterface.removeColumn("exam_timetables", "program_id");

    await queryInterface.renameColumn(
      "exam_timetables",
      "program_id_temp",
      "program_id",
    );

    await queryInterface.changeColumn("exam_timetables", "program_id", {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "programs",
        key: "id",
      },
    });
  },
};

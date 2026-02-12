"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // 1. Make start_date and end_date nullable
        await queryInterface.changeColumn("exam_cycles", "start_date", {
            type: Sequelize.DATEONLY,
            allowNull: true,
        });

        await queryInterface.changeColumn("exam_cycles", "end_date", {
            type: Sequelize.DATEONLY,
            allowNull: true,
        });

        // 2. Add 'scheduling' to status enum
        // Note: Postgres specific command to add value to enum
        try {
            await queryInterface.sequelize.query(
                "ALTER TYPE enum_exam_cycles_status ADD VALUE 'scheduling' BEFORE 'scheduled';"
            );
        } catch (e) {
            // If error implies it already exists, ignore. 
            // Postgres throws if we try to add a value that exists without 'IF NOT EXISTS' (which is only in PG 12+)
            console.log("Enum update might have failed or already exists:", e.message);
        }

        // Also update the column definition to match the new model (optional but good for consistency)
        await queryInterface.changeColumn("exam_cycles", "status", {
            type: Sequelize.ENUM(
                "scheduling",
                "scheduled",
                "ongoing",
                "completed",
                "results_published"
            ),
            defaultValue: "scheduling",
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Revert logic is complex for Enums (deleting values), so skipping strict revert for Enum.
        // Just revert allow null.

        // We cannot easily revert data to NOT NULL without ensuring data integrity, 
        // but for 'down' migration definition:
        /*
        await queryInterface.changeColumn("exam_cycles", "start_date", {
          type: Sequelize.DATEONLY,
          allowNull: false,
        });
        
        await queryInterface.changeColumn("exam_cycles", "end_date", {
          type: Sequelize.DATEONLY,
          allowNull: false,
        });
        */
    },
};

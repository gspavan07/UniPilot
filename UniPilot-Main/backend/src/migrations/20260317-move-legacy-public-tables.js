/**
 * Migration: Move legacy tables that remained in public into module schemas.
 *
 * Phase 4 follow-up for strict schema isolation.
 */
export default {
  up: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      const schemaMap = {
        academics: ["attendance_settings", "student_awards"],
        exams: [
          "exam_marks",
          "exam_registrations",
          "exam_reverifications",
          "exam_schedules",
          "exam_scripts",
          "exam_timetable_history",
          "hall_tickets",
          "fee_config_audit_logs",
        ],
        fees: [
          "expenses",
          "fee_transactions",
          "institution_budgets",
          "scholarship_beneficiaries",
          "scholarship_schemes",
          "vendors",
        ],
        placement: ["placement_companies"],
      };

      // Ensure schemas exist
      for (const schema of Object.keys(schemaMap)) {
        await queryInterface.sequelize.query(
          `CREATE SCHEMA IF NOT EXISTS "${schema}";`,
          { transaction }
        );
      }

      // Move tables from public if present
      for (const [schema, tables] of Object.entries(schemaMap)) {
        for (const table of tables) {
          const [results] = await queryInterface.sequelize.query(
            `SELECT to_regclass('public."${table}"') AS tbl;`,
            { transaction }
          );
          if (results[0]?.tbl) {
            await queryInterface.sequelize.query(
              `ALTER TABLE public."${table}" SET SCHEMA "${schema}";`,
              { transaction }
            );
          }
        }
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      const schemaMap = {
        academics: ["attendance_settings", "student_awards"],
        exams: [
          "exam_marks",
          "exam_registrations",
          "exam_reverifications",
          "exam_schedules",
          "exam_scripts",
          "exam_timetable_history",
          "hall_tickets",
          "fee_config_audit_logs",
        ],
        fees: [
          "expenses",
          "fee_transactions",
          "institution_budgets",
          "scholarship_beneficiaries",
          "scholarship_schemes",
          "vendors",
        ],
        placement: ["placement_companies"],
      };

      for (const [schema, tables] of Object.entries(schemaMap)) {
        for (const table of tables) {
          const [results] = await queryInterface.sequelize.query(
            `SELECT to_regclass('"${schema}"."${table}"') AS tbl;`,
            { transaction }
          );
          if (results[0]?.tbl) {
            await queryInterface.sequelize.query(
              `ALTER TABLE "${schema}"."${table}" SET SCHEMA public;`,
              { transaction }
            );
          }
        }
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};

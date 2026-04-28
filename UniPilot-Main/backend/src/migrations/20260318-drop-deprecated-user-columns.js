/**
 * Migration: Drop deprecated columns from core.users (Phase 5 cleanup).
 */
export default {
  up: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      const columns = [
        "employee_id",
        "student_id",
        "department_id",
        "salary_grade_id",
        "program_id",
        "regulation_id",
        "batch_year",
        "current_semester",
        "section",
        "admission_date",
        "is_hosteller",
        "requires_transport",
        "academic_status",
        "designation",
        "joining_date",
        "admission_number",
        "admission_type",
        "is_lateral",
        "is_temporary_id",
        "parent_details",
        "previous_academics",
      ];

      for (const column of columns) {
        await queryInterface.sequelize.query(
          `ALTER TABLE "core"."users" DROP COLUMN IF EXISTS "${column}";`,
          { transaction },
        );
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Re-add columns for rollback (minimal definitions, nullable)
      await queryInterface.addColumn(
        { schema: "core", tableName: "users" },
        "employee_id",
        { type: Sequelize.STRING(50), allowNull: true },
        { transaction },
      );
      await queryInterface.addColumn(
        { schema: "core", tableName: "users" },
        "student_id",
        { type: Sequelize.STRING(50), allowNull: true },
        { transaction },
      );
      await queryInterface.addColumn(
        { schema: "core", tableName: "users" },
        "department_id",
        { type: Sequelize.UUID, allowNull: true },
        { transaction },
      );
      await queryInterface.addColumn(
        { schema: "core", tableName: "users" },
        "salary_grade_id",
        { type: Sequelize.UUID, allowNull: true },
        { transaction },
      );
      await queryInterface.addColumn(
        { schema: "core", tableName: "users" },
        "program_id",
        { type: Sequelize.UUID, allowNull: true },
        { transaction },
      );
      await queryInterface.addColumn(
        { schema: "core", tableName: "users" },
        "regulation_id",
        { type: Sequelize.UUID, allowNull: true },
        { transaction },
      );
      await queryInterface.addColumn(
        { schema: "core", tableName: "users" },
        "batch_year",
        { type: Sequelize.INTEGER, allowNull: true },
        { transaction },
      );
      await queryInterface.addColumn(
        { schema: "core", tableName: "users" },
        "current_semester",
        { type: Sequelize.INTEGER, allowNull: true },
        { transaction },
      );
      await queryInterface.addColumn(
        { schema: "core", tableName: "users" },
        "section",
        { type: Sequelize.STRING(10), allowNull: true },
        { transaction },
      );
      await queryInterface.addColumn(
        { schema: "core", tableName: "users" },
        "admission_date",
        { type: Sequelize.DATEONLY, allowNull: true },
        { transaction },
      );
      await queryInterface.addColumn(
        { schema: "core", tableName: "users" },
        "is_hosteller",
        { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false },
        { transaction },
      );
      await queryInterface.addColumn(
        { schema: "core", tableName: "users" },
        "requires_transport",
        { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false },
        { transaction },
      );
      await queryInterface.addColumn(
        { schema: "core", tableName: "users" },
        "academic_status",
        {
          type: Sequelize.ENUM(
            "active",
            "promoted",
            "detained",
            "semester_back",
            "graduated",
            "dropout",
          ),
          allowNull: true,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        { schema: "core", tableName: "users" },
        "designation",
        { type: Sequelize.STRING(100), allowNull: true },
        { transaction },
      );
      await queryInterface.addColumn(
        { schema: "core", tableName: "users" },
        "joining_date",
        { type: Sequelize.DATEONLY, allowNull: true },
        { transaction },
      );
      await queryInterface.addColumn(
        { schema: "core", tableName: "users" },
        "admission_number",
        { type: Sequelize.STRING(50), allowNull: true },
        { transaction },
      );
      await queryInterface.addColumn(
        { schema: "core", tableName: "users" },
        "admission_type",
        {
          type: Sequelize.ENUM("management", "convener"),
          allowNull: true,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        { schema: "core", tableName: "users" },
        "is_lateral",
        { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false },
        { transaction },
      );
      await queryInterface.addColumn(
        { schema: "core", tableName: "users" },
        "is_temporary_id",
        { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false },
        { transaction },
      );
      await queryInterface.addColumn(
        { schema: "core", tableName: "users" },
        "parent_details",
        { type: Sequelize.JSONB, allowNull: true },
        { transaction },
      );
      await queryInterface.addColumn(
        { schema: "core", tableName: "users" },
        "previous_academics",
        { type: Sequelize.JSONB, allowNull: true },
        { transaction },
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check and remove instance_number column if it exists
    const tableDescription = await queryInterface.describeTable('exam_cycles');
    if (tableDescription.instance_number) {
      await queryInterface.removeColumn('exam_cycles', 'instance_number');
    }

    // Check current state and fix if needed
    const [oldEnumExists] = await queryInterface.sequelize.query(`
      SELECT typname FROM pg_type WHERE typname = 'enum_exam_cycles_exam_type_old';
    `);

    if (oldEnumExists.length > 0) {
      // Old enum exists, column is using it - convert back first
      await queryInterface.sequelize.query(`
        ALTER TABLE exam_cycles ALTER COLUMN exam_type DROP DEFAULT;
      `);

      await queryInterface.sequelize.query(`
        DROP TYPE IF EXISTS "enum_exam_cycles_exam_type_temp";
      `);

      await queryInterface.sequelize.query(`
        CREATE TYPE "enum_exam_cycles_exam_type_temp" AS ENUM (
          'mid_term',
          'semester_end',
          're_exam',
          'internal'
        );
      `);

      await queryInterface.sequelize.query(`
        ALTER TABLE exam_cycles 
        ALTER COLUMN exam_type TYPE "enum_exam_cycles_exam_type_temp" 
        USING exam_type::text::"enum_exam_cycles_exam_type_temp";
      `);

      await queryInterface.sequelize.query(`
        DROP TYPE "enum_exam_cycles_exam_type_old";
      `);

      await queryInterface.sequelize.query(`
        DROP TYPE IF EXISTS "enum_exam_cycles_exam_type";
      `);

      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_exam_cycles_exam_type_temp" RENAME TO "enum_exam_cycles_exam_type";
      `);
    }

    // Now proceed with the actual migration
    await queryInterface.sequelize.query(`
      ALTER TABLE exam_cycles ALTER COLUMN exam_type DROP DEFAULT;
    `);

    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_exam_cycles_exam_type" RENAME TO "enum_exam_cycles_exam_type_old";
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_exam_cycles_exam_type" AS ENUM (
        'mid_term_1',
        'mid_term_2',
        'semester_end_external',
        're_exam',
        'internal_lab',
        'external_lab'
      );
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE exam_cycles 
      ALTER COLUMN exam_type TYPE "enum_exam_cycles_exam_type" 
      USING (
        CASE exam_type::text
          WHEN 'mid_term' THEN 'mid_term_1'::text
          WHEN 'semester_end' THEN 'semester_end_external'::text
          WHEN 'internal' THEN 'internal_lab'::text
          ELSE exam_type::text
        END
      )::"enum_exam_cycles_exam_type";
    `);

    await queryInterface.sequelize.query(`
      DROP TYPE "enum_exam_cycles_exam_type_old";
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE exam_cycles 
      ALTER COLUMN exam_type SET DEFAULT 'semester_end_external';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE exam_cycles ALTER COLUMN exam_type DROP DEFAULT;
    `);

    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_exam_cycles_exam_type" RENAME TO "enum_exam_cycles_exam_type_new";
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_exam_cycles_exam_type" AS ENUM (
        'mid_term',
        'semester_end',
        're_exam',
        'internal'
      );
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE exam_cycles 
      ALTER COLUMN exam_type TYPE "enum_exam_cycles_exam_type" 
      USING (
        CASE exam_type::text
          WHEN 'mid_term_1' THEN 'mid_term'::text
          WHEN 'mid_term_2' THEN 'mid_term'::text
          WHEN 'semester_end_external' THEN 'semester_end'::text
          WHEN 'internal_lab' THEN 'internal'::text
          WHEN 'external_lab' THEN 'internal'::text
          ELSE exam_type::text
        END
      )::"enum_exam_cycles_exam_type";
    `);

    await queryInterface.sequelize.query(`
      DROP TYPE "enum_exam_cycles_exam_type_new";
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE exam_cycles 
      ALTER COLUMN exam_type SET DEFAULT 'semester_end';
    `);

    const tableDescription = await queryInterface.describeTable('exam_cycles');
    if (!tableDescription.instance_number) {
      await queryInterface.addColumn('exam_cycles', 'instance_number', {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      });
    }
  }
};

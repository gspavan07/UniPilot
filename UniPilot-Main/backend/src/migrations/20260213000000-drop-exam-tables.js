'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            console.log('Starting exam tables cleanup migration...');

            // 1. Drop Foreign Key Constraints First (to avoid dependency errors)

            // Drop FK from exam_reverifications
            await queryInterface.removeConstraint(
                'exam_reverifications',
                'exam_reverifications_exam_schedule_id_fkey',
                { transaction }
            ).catch(() => console.log('FK constraint exam_reverifications_exam_schedule_id_fkey not found'));

            await queryInterface.removeConstraint(
                'exam_reverifications',
                'exam_reverifications_exam_mark_id_fkey',
                { transaction }
            ).catch(() => console.log('FK constraint exam_reverifications_exam_mark_id_fkey not found'));

            await queryInterface.removeConstraint(
                'exam_reverifications',
                'exam_reverifications_exam_fee_payment_id_fkey',
                { transaction }
            ).catch(() => console.log('FK constraint exam_reverifications_exam_fee_payment_id_fkey not found'));

            // Drop FK from exam_scripts
            await queryInterface.removeConstraint(
                'exam_scripts',
                'exam_scripts_exam_schedule_id_fkey',
                { transaction }
            ).catch(() => console.log('FK constraint exam_scripts_exam_schedule_id_fkey not found'));

            // Drop FK from exam_marks
            await queryInterface.removeConstraint(
                'exam_marks',
                'exam_marks_exam_schedule_id_fkey',
                { transaction }
            ).catch(() => console.log('FK constraint exam_marks_exam_schedule_id_fkey not found'));

            // Drop FK from exam_schedules
            await queryInterface.removeConstraint(
                'exam_schedules',
                'exam_schedules_exam_cycle_id_fkey',
                { transaction }
            ).catch(() => console.log('FK constraint exam_schedules_exam_cycle_id_fkey not found'));

            // Drop FK from hall_tickets
            await queryInterface.removeConstraint(
                'hall_tickets',
                'hall_tickets_exam_cycle_id_fkey',
                { transaction }
            ).catch(() => console.log('FK constraint hall_tickets_exam_cycle_id_fkey not found'));

            // Drop FK from exam_registrations
            await queryInterface.removeConstraint(
                'exam_registrations',
                'exam_registrations_exam_cycle_id_fkey',
                { transaction }
            ).catch(() => console.log('FK constraint exam_registrations_exam_cycle_id_fkey not found'));

            // Drop FK from exam_fee_payments
            await queryInterface.removeConstraint(
                'exam_fee_payments',
                'exam_fee_payments_exam_cycle_id_fkey',
                { transaction }
            ).catch(() => console.log('FK constraint exam_fee_payments_exam_cycle_id_fkey not found'));

            // Drop FK from semester_results (has exam_cycle_id)
            await queryInterface.removeConstraint(
                'semester_results',
                'semester_results_exam_cycle_id_fkey',
                { transaction }
            ).catch(() => console.log('FK constraint semester_results_exam_cycle_id_fkey not found'));

            console.log('Foreign key constraints dropped');

            // 2. Drop exam_cycle_id column from semester_results (keep the table for academic purposes)
            await queryInterface.removeColumn('semester_results', 'exam_cycle_id', { transaction })
                .catch(() => console.log('Column exam_cycle_id not found in semester_results'));

            console.log('Dropped exam_cycle_id from semester_results');

            // 3. Drop All Exam Tables (in reverse dependency order)

            const examTables = [
                'exam_reverifications',
                'exam_scripts',
                'exam_marks',
                'hall_tickets',
                'exam_registrations',
                'exam_fee_payments',
                'question_paper_templates',
                'exam_schedules',
                'exam_cycles'
            ];

            for (const table of examTables) {
                await queryInterface.dropTable(table, { transaction, cascade: true })
                    .catch((err) => console.log(`Table ${table} not found or already dropped:`, err.message));
                console.log(`Dropped table: ${table}`);
            }

            await transaction.commit();
            console.log('✅ Exam tables cleanup migration completed successfully');

        } catch (error) {
            await transaction.rollback();
            console.error('❌ Error in exam tables cleanup migration:', error);
            throw error;
        }
    },

    down: async (queryInterface, Sequelize) => {
        // No rollback - this is a one-way cleanup migration
        console.log('⚠️  This migration cannot be rolled back. Exam tables and data have been permanently removed.');
    }
};

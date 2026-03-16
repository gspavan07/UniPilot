/**
 * Migration: Create per-module PostgreSQL schemas and move tables from public.
 *
 * Phase 4 of the Modular Monolith roadmap.
 *
 * IMPORTANT: This migration must run BEFORE the application code that references
 * the new schema option in model definitions.
 */
export default {
  up: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // ---------- Schema → Table mapping ----------
      const schemaMap = {
        core: [
          'users', 'sessions', 'roles', 'permissions', 'role_permissions',
        ],
        academics: [
          'departments', 'programs', 'courses', 'course_faculties',
          'regulations', 'timetables', 'timetable_slots',
          'section_incharges', 'semester_results', 'attendance',
          'promotion_criteria', 'promotion_evaluations', 'graduations',
          'leave_requests', 'student_profiles',
        ],
        hr: [
          'staff_attendance', 'leave_balances', 'salary_structures',
          'payslips', 'salary_grades', 'staff_profiles',
        ],
        admissions: [
          'admission_configs', 'student_documents',
        ],
        exams: [
          'exam_audit_logs', 'exam_cycles', 'exam_fee_configurations',
          'exam_fee_payments', 'exam_student_eligibilities',
          'exam_timetables', 'late_fee_slabs',
        ],
        fees: [
          'academic_fee_payments', 'fee_categories', 'fee_payments',
          'fee_semester_configs', 'fee_structures', 'fee_waivers',
          'student_fee_charges', 'student_charge_payments',
        ],
        hostel: [
          'hostel_allocations', 'hostel_attendance', 'hostel_beds',
          'hostel_buildings', 'hostel_complaints', 'hostel_fee_structures',
          'hostel_fines', 'hostel_floors', 'hostel_gate_passes',
          'hostel_mess_fee_structures', 'hostel_rooms', 'hostel_room_bills',
          'hostel_room_bill_distributions', 'hostel_stay_logs',
          'hostel_visitors',
        ],
        infrastructure: [
          'blocks', 'rooms',
        ],
        obe: [
          'co_po_maps', 'course_outcomes', 'program_outcomes',
        ],
        notifications: [
          'notifications',
        ],
        placement: [
          'companies', 'company_contacts', 'drive_eligibility',
          'drive_rounds', 'job_postings', 'placements',
          'placement_documents', 'placement_drives',
          'placement_notifications', 'placement_policies',
          'round_results', 'student_applications',
          'student_placement_profiles',
        ],
        proctoring: [
          'proctor_sessions', 'proctor_alerts',
          'proctor_assignments', 'proctor_feedback',
        ],
        transport: [
          'transport_routes', 'transport_drivers', 'transport_vehicles',
          'transport_stops', 'vehicle_route_assignments',
          'student_route_allocations', 'special_trips', 'trip_logs',
        ],
        library: [
          'books', 'book_issues',
        ],
        settings: [
          'audit_logs', 'institution_settings', 'holidays',
        ],
      };

      // 1. Create schemas
      for (const schema of Object.keys(schemaMap)) {
        await queryInterface.sequelize.query(
          `CREATE SCHEMA IF NOT EXISTS "${schema}";`,
          { transaction },
        );
      }

      // 2. Move tables (skip if they don't exist in public — e.g. fresh DB)
      for (const [schema, tables] of Object.entries(schemaMap)) {
        for (const table of tables) {
          // Check if table exists in public before moving
          const [results] = await queryInterface.sequelize.query(
            `SELECT to_regclass('public."${table}"') AS tbl;`,
            { transaction },
          );
          if (results[0]?.tbl) {
            await queryInterface.sequelize.query(
              `ALTER TABLE public."${table}" SET SCHEMA "${schema}";`,
              { transaction },
            );
          }
        }
      }

      // 3. Update search_path for future sessions
      await queryInterface.sequelize.query(
        `SET search_path TO ${Object.keys(schemaMap).join(',')},public;`,
        { transaction },
      );

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
        core: ['users', 'sessions', 'roles', 'permissions', 'role_permissions'],
        academics: ['departments', 'programs', 'courses', 'course_faculties', 'regulations', 'timetables', 'timetable_slots', 'section_incharges', 'semester_results', 'attendance', 'promotion_criteria', 'promotion_evaluations', 'graduations', 'leave_requests', 'student_profiles'],
        hr: ['staff_attendance', 'leave_balances', 'salary_structures', 'payslips', 'salary_grades', 'staff_profiles'],
        admissions: ['admission_configs', 'student_documents'],
        exams: ['exam_audit_logs', 'exam_cycles', 'exam_fee_configurations', 'exam_fee_payments', 'exam_student_eligibilities', 'exam_timetables', 'late_fee_slabs'],
        fees: ['academic_fee_payments', 'fee_categories', 'fee_payments', 'fee_semester_configs', 'fee_structures', 'fee_waivers', 'student_fee_charges', 'student_charge_payments'],
        hostel: ['hostel_allocations', 'hostel_attendance', 'hostel_beds', 'hostel_buildings', 'hostel_complaints', 'hostel_fee_structures', 'hostel_fines', 'hostel_floors', 'hostel_gate_passes', 'hostel_mess_fee_structures', 'hostel_rooms', 'hostel_room_bills', 'hostel_room_bill_distributions', 'hostel_stay_logs', 'hostel_visitors'],
        infrastructure: ['blocks', 'rooms'],
        obe: ['co_po_maps', 'course_outcomes', 'program_outcomes'],
        notifications: ['notifications'],
        placement: ['companies', 'company_contacts', 'drive_eligibility', 'drive_rounds', 'job_postings', 'placements', 'placement_documents', 'placement_drives', 'placement_notifications', 'placement_policies', 'round_results', 'student_applications', 'student_placement_profiles'],
        proctoring: ['proctor_sessions', 'proctor_alerts', 'proctor_assignments', 'proctor_feedback'],
        transport: ['transport_routes', 'transport_drivers', 'transport_vehicles', 'transport_stops', 'vehicle_route_assignments', 'student_route_allocations', 'special_trips', 'trip_logs'],
        library: ['books', 'book_issues'],
        settings: ['audit_logs', 'institution_settings', 'holidays'],
      };

      // Move tables back to public
      for (const [schema, tables] of Object.entries(schemaMap)) {
        for (const table of tables) {
          const [results] = await queryInterface.sequelize.query(
            `SELECT to_regclass('"${schema}"."${table}"') AS tbl;`,
            { transaction },
          );
          if (results[0]?.tbl) {
            await queryInterface.sequelize.query(
              `ALTER TABLE "${schema}"."${table}" SET SCHEMA public;`,
              { transaction },
            );
          }
        }
      }

      // Drop schemas
      for (const schema of Object.keys(schemaMap)) {
        await queryInterface.sequelize.query(
          `DROP SCHEMA IF EXISTS "${schema}";`,
          { transaction },
        );
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};

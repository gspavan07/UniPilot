'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Migrate Students
    // We assume users with a role slug of 'student' (or role string 'student') should go to student_profiles
    const [students] = await queryInterface.sequelize.query(`
      SELECT 
        u.id as user_id, 
        u.student_id, 
        u.program_id, 
        u.regulation_id, 
        u.batch_year, 
        u.current_semester, 
        u.section, 
        u.admission_date, 
        u.is_hosteller, 
        u.requires_transport, 
        u.academic_status, 
        u.admission_number, 
        u.admission_type, 
        u.is_lateral, 
        u.is_temporary_id, 
        u.parent_details, 
        u.previous_academics, 
        u.is_placement_coordinator
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE r.slug = 'student' OR u.role = 'student'
    `);

    if (students && students.length > 0) {
      // Add necessary UUIDs for insert
      const { v4: uuidv4 } = require('uuid');
      const studentProfiles = students.map(student => ({
        ...student,
        parent_details: typeof student.parent_details === 'object' ? JSON.stringify(student.parent_details) : student.parent_details,
        previous_academics: typeof student.previous_academics === 'object' ? JSON.stringify(student.previous_academics) : student.previous_academics,
        id: uuidv4(),
        created_at: new Date(),
        updated_at: new Date()
      }));

      await queryInterface.bulkInsert('student_profiles', studentProfiles);
    }

    // 2. Migrate Staff (Faculty, Admin, etc.)
    const [staff] = await queryInterface.sequelize.query(`
      SELECT 
        u.id as user_id, 
        u.employee_id, 
        u.department_id, 
        u.salary_grade_id, 
        u.designation, 
        u.joining_date
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE r.slug IN ('faculty', 'admin', 'superadmin', 'hod', 'staff') OR u.role IN ('faculty', 'admin', 'superadmin', 'hod', 'staff')
    `);

    if (staff && staff.length > 0) {
      const { v4: uuidv4 } = require('uuid');
      const staffProfiles = staff.map(st => ({
        ...st,
        id: uuidv4(),
        created_at: new Date(),
        updated_at: new Date()
      }));

      await queryInterface.bulkInsert('staff_profiles', staffProfiles);
    }
  },

  async down(queryInterface, Sequelize) {
    // Reversing the data migration isn't strictly necessary since we aren't dropping the original columns yet,
    // but we can truncate the tables for clean rollback.
    await queryInterface.bulkDelete('student_profiles', null, {});
    await queryInterface.bulkDelete('staff_profiles', null, {});
  }
};

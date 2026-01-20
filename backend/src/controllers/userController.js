const {
  User,
  Department,
  Program,
  Role,
  SalaryStructure,
  SalaryGrade,
  Regulation,
} = require("../models");
const { Op } = require("sequelize");
const logger = require("../utils/logger");
const { hashPassword } = require("../utils/bcrypt");
const Importer = require("../utils/importer");
const fs = require("fs");
const { sequelize } = require("../config/database");

/**
 * User Controller
 * Handles CRUD operations for users (Students, Faculty, Staff)
 */

// @desc    Get all users with filtering
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { role, role_id, department_id, search } = req.query;

    // 1. Determine Scope based on Requester
    let roleScopeFilter = {};
    if (req.user && req.user.userId) {
      const requester = await User.findByPk(req.user.userId, {
        include: [{ model: Role, as: "role_data" }],
      });
      const requesterSlug = requester?.role_data?.slug;

      // If NOT Super Admin, apply scoping
      if (requesterSlug !== "admin" && requesterSlug !== "super_admin") {
        // Special Case: HR (Can see all employees, NO students)
        if (requesterSlug === "hr_admin" || requesterSlug === "hr") {
          roleScopeFilter = { slug: { [Op.ne]: "student" } };
        }
        // Check if Module Admin (e.g., finance_admin, exam_admin)
        else if (requesterSlug && requesterSlug.includes("_admin")) {
          const modulePrefix = requesterSlug.split("_")[0]; // e.g., 'finance'

          const allowedSlugs = [{ [Op.like]: `${modulePrefix}_%` }]; // Always allow own module team

          // Only allow 'student' access if explicitly requested (e.g. from Students tab)
          if (role === "student") {
            allowedSlugs.push("student");
          }

          // Special Case: Academics Admin needs to see Faculty and HODs
          if (modulePrefix === "academics") {
            allowedSlugs.push("faculty");
            allowedSlugs.push("hod");
          }

          roleScopeFilter = {
            slug: {
              [Op.or]: allowedSlugs,
            },
          };
        } else {
          // If it's a regular staff (shouldn't have access usually, but if they do),
          // restricts them to nothing or just their own profile?
          // For now, let's assume if they have permission to call this API,
          // they might be restricted to their module too.
          if (requesterSlug && requesterSlug.includes("_")) {
            const modulePrefix = requesterSlug.split("_")[0];
            roleScopeFilter = {
              slug: {
                [Op.or]: [{ [Op.like]: `${modulePrefix}_%` }, "student"],
              },
            };
          }
        }

        // HOD & Faculty Logic: Restrict to OWN Department
        if (requesterSlug === "faculty" || requesterSlug === "hod") {
          if (requester.department_id) {
            req.forcedDepartmentId = requester.department_id;
          } else {
            roleScopeFilter = { id: null }; // block access if no department assigned
          }
        }
      } else {
        // Super Admin Logic
        if (!role) {
          // By default, exclude students from main list (User Management)
          // Only show them if explicitly filtered (Students Tab)
          roleScopeFilter = { slug: { [Op.ne]: "student" } };
        }
      }
    }

    const where = {};
    if (role_id && role_id !== "undefined") where.role_id = role_id;
    if (role && role !== "undefined") {
      const roles = role.split(",");
      if (roles.length > 1) {
        where.role = { [Op.in]: roles.map((r) => r.toLowerCase().trim()) };
      } else {
        where.role = role.toLowerCase();
      }
    }
    if (department_id && department_id !== "undefined")
      where.department_id = department_id;
    if (req.query.batch_year && req.query.batch_year !== "undefined") {
      where.batch_year = req.query.batch_year;
    }
    if (req.query.section && req.query.section !== "undefined") {
      where.section = { [Op.iLike]: req.query.section };
    }
    if (req.query.semester && req.query.semester !== "undefined") {
      where.current_semester = parseInt(req.query.semester, 10);
    }
    if (req.query.program_id && req.query.program_id !== "undefined") {
      where.program_id = req.query.program_id;
    }

    // Faculty Restriction Override
    if (req.forcedDepartmentId) {
      where.department_id = req.forcedDepartmentId;
    }
    if (search) {
      where[Op.or] = [
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { student_id: { [Op.iLike]: `%${search}%` } },
        { employee_id: { [Op.iLike]: `%${search}%` } },
        { admission_number: { [Op.iLike]: `%${search}%` } },
        { aadhaar_number: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const users = await User.findAll({
      where,
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name", "code"],
        },
        {
          model: Program,
          as: "program",
          attributes: ["id", "name", "code"],
        },
        {
          model: Regulation,
          as: "regulation",
          attributes: ["id", "name", "academic_year"],
        },
        {
          model: Role,
          as: "role_data",
          attributes: ["id", "name", "slug"],
          where: roleScopeFilter, // Apply Scoping Here
        },
      ],
      attributes: { exclude: ["password_hash", "refresh_token"] },
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    logger.error("Error in getAllUsers:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Get counts of users by role
// @route   GET /api/users/stats
// @access  Private/Admin
exports.getUserStats = async (req, res) => {
  try {
    // 1. Determine Scope based on Requester
    let roleScopeFilter = {};
    if (req.user && req.user.userId) {
      const requester = await User.findByPk(req.user.userId, {
        include: [{ model: Role, as: "role_data" }],
      });
      const requesterSlug = requester?.role_data?.slug;

      // If NOT Super Admin, apply scoping
      if (requesterSlug !== "admin" && requesterSlug !== "super_admin") {
        // Check if Module Admin (e.g., finance_admin, exam_admin)
        if (requesterSlug && requesterSlug.includes("_admin")) {
          const modulePrefix = requesterSlug.split("_")[0]; // e.g., 'finance'

          const allowedSlugs = [{ [Op.like]: `${modulePrefix}_%` }]; // Always allow own module team
          allowedSlugs.push("student"); // Always allow stats for student

          roleScopeFilter = {
            slug: {
              [Op.or]: allowedSlugs,
            },
          };
        } else {
          // Regular staff restriction logic if needed
          if (requesterSlug && requesterSlug.includes("_")) {
            const modulePrefix = requesterSlug.split("_")[0];
            roleScopeFilter = {
              slug: {
                [Op.or]: [{ [Op.like]: `${modulePrefix}_%` }, "student"],
              },
            };
          }
        }
      }
    }

    // 2. Fetch stats with filtering
    // We need to join with Roles table to apply the filter
    const stats = await User.findAll({
      attributes: [
        "role",
        [User.sequelize.fn("COUNT", User.sequelize.col("User.id")), "count"],
      ],
      include: [
        {
          model: Role,
          as: "role_data",
          attributes: [], // We don't need role columns in group by, just for filtering
          where: roleScopeFilter,
        },
      ],
      group: ["role"],
      where: req.forcedDepartmentId
        ? { department_id: req.forcedDepartmentId }
        : {},
    });

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error("Error in getUserStats:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Get distinct sections for students based on filters
// @route   GET /api/users/sections
// @access  Private
exports.getStudentSections = async (req, res) => {
  try {
    const { department_id, batch_year, semester } = req.query;
    const where = {
      role: "student",
      section: { [Op.ne]: null }, // Only sections that are not null
    };

    if (department_id) where.department_id = department_id;
    if (batch_year) where.batch_year = batch_year;
    if (semester) where.current_semester = semester;

    // We use findAll with group and attributes to simulate DISTINCT
    const sections = await User.findAll({
      attributes: [
        [
          User.sequelize.fn("DISTINCT", User.sequelize.col("section")),
          "section",
        ],
      ],
      where,
      order: [["section", "ASC"]],
      raw: true,
    });

    // Extract just the section names
    const sectionList = sections.map((s) => s.section).filter(Boolean);

    res.status(200).json({
      success: true,
      data: sectionList,
    });
  } catch (error) {
    logger.error("Error in getStudentSections:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Get distinct batch years for students
// @route   GET /api/users/batch-years
// @access  Private
exports.getBatchYears = async (req, res) => {
  try {
    const { department_id } = req.query;
    const where = {
      role: "student",
      batch_year: { [Op.ne]: null },
    };

    if (department_id) where.department_id = department_id;

    const batches = await User.findAll({
      attributes: [
        [
          User.sequelize.fn("DISTINCT", User.sequelize.col("batch_year")),
          "batch_year",
        ],
      ],
      where,
      order: [["batch_year", "DESC"]],
      raw: true,
    });

    const batchList = batches.map((b) => b.batch_year).filter(Boolean);

    res.status(200).json({
      success: true,
      data: batchList,
    });
  } catch (error) {
    logger.error("Error in getBatchYears:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name", "code"],
        },
        {
          model: Program,
          as: "program",
          attributes: ["id", "name", "code"],
        },
        {
          model: Regulation,
          as: "regulation",
          attributes: ["id", "name", "academic_year"],
        },
        {
          model: Role,
          as: "role_data",
          attributes: ["id", "name", "slug", "field_config"],
        },
      ],
      attributes: { exclude: ["password_hash", "refresh_token"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error("Error in getUser:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  try {
    const {
      email,
      password,
      role,
      gender,
      academic_status,
      student_id,
      admission_number,
      program_id,
    } = req.body;

    // 0. Permission Check
    if (req.user && req.user.userId) {
      const requester = await User.findByPk(req.user.userId, {
        include: [{ model: Role, as: "role_data" }],
      });
      const requesterSlug = requester?.role_data?.slug;
      const targetRole = (role || "").toLowerCase(); // Normalized

      // Super Admin / System Admin: Allow All
      if (requesterSlug !== "admin" && requesterSlug !== "super_admin") {
        // HR: Can only create Staff/Faculty
        if (requesterSlug.includes("hr_")) {
          if (
            targetRole === "student" ||
            targetRole.includes("admin") ||
            targetRole === "super_admin"
          ) {
            return res.status(403).json({
              success: false,
              error: "HR can only create Employees (Staff/Faculty)",
            });
          }
        }
        // Admission: Can only create Students
        else if (requesterSlug.includes("admission_")) {
          if (targetRole !== "student") {
            return res.status(403).json({
              success: false,
              error: "Admission Team can only create Students",
            });
          }
        }
        // HOD: Can create Student, Faculty, Staff for OWN Dept
        else if (requesterSlug === "hod") {
          const allowedRoles = ["student", "faculty", "staff"];
          if (!allowedRoles.includes(targetRole)) {
            return res.status(403).json({
              success: false,
              error: "HOD can only create Students, Faculty, or Staff",
            });
          }
          // Enforce Department Match
          if (req.body.department_id != requester.department_id) {
            return res.status(403).json({
              success: false,
              error: "You can only add users to your own department",
            });
          }
        }
        // Default: Deny others (e.g. Finance Staff cannot create users)
        else {
          return res.status(403).json({
            success: false,
            error: "You do not have permission to create users",
          });
        }
      }
    }

    // Check if user exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: "User with this email already exists",
      });
    }

    // Prepare user data
    const userData = { ...req.body };

    // Parse JSON fields if they come from FormData (as strings)
    [
      "parent_details",
      "previous_academics",
      "bank_details",
      "custom_fields",
    ].forEach((field) => {
      if (typeof userData[field] === "string") {
        try {
          userData[field] = JSON.parse(userData[field]);
        } catch (e) {
          userData[field] = field === "previous_academics" ? [] : {};
        }
      }
    });

    // Convert empty strings to null for UUID fields (prevents "invalid input syntax for type uuid" error)
    const uuidFields = [
      "department_id",
      "program_id",
      "regulation_id",
      "role_id",
      "salary_grade_id",
    ];
    uuidFields.forEach((field) => {
      if (userData[field] === "" || userData[field] === undefined) {
        userData[field] = null;
      }
    });

    // Convert empty strings to null for unique fields (prevents unique constraint violations)
    const uniqueFields = [
      "passport_number",
      "pan_number",
      "aadhaar_number",
      "biometric_device_id",
      "employee_id",
      "student_id",
    ];
    uniqueFields.forEach((field) => {
      if (userData[field] === "" || userData[field] === undefined) {
        userData[field] = null;
      }
    });

    // Hash password if provided, otherwise use a default one
    const rawPassword = password || "University@123";
    userData.password_hash = await hashPassword(rawPassword);

    // Normalize ENUM fields to lowercase for database compatibility
    if (role) userData.role = role.toLowerCase();
    if (gender) userData.gender = gender.toLowerCase();
    if (academic_status)
      userData.academic_status = academic_status.toLowerCase();
    if (userData.admission_type)
      userData.admission_type = userData.admission_type.toLowerCase();

    // Auto-generate Student ID/Admission Number if not provided for students
    if (role === "student" && (!student_id || !admission_number)) {
      const {
        generateStudentId,
        generateGlobalAdmissionNumber,
      } = require("../services/admissionService");
      try {
        const batchYear = userData.batch_year || new Date().getFullYear();
        if (!userData.admission_date) {
          userData.admission_date = new Date();
        }
        if (!student_id) {
          userData.student_id = await generateStudentId({
            batchYear,
            programId: program_id,
            isTemporary:
              req.body.is_temporary_id === "true" ||
              req.body.is_temporary_id === true,
            isLateral:
              req.body.is_lateral === "true" || req.body.is_lateral === true,
          });
        }
        if (!admission_number) {
          userData.admission_number = await generateGlobalAdmissionNumber();
        }
      } catch (err) {
        logger.error("Failed to auto-generate student ID:", err);
      }
    }

    const user = await User.create(userData);

    // Process Uploaded Documents (Now using StudentDocument model)
    if (req.files && req.files.length > 0) {
      logger.info(
        `Processing ${req.files.length} documents for user ${user.id}`,
      );
      logger.info(
        `Document Types received: ${JSON.stringify(req.body.document_types)}`,
      );

      const { StudentDocument } = require("../models");
      const documentTypes = Array.isArray(req.body.document_types)
        ? req.body.document_types
        : [req.body.document_types];

      await Promise.all(
        req.files.map((file, index) =>
          StudentDocument.create({
            user_id: user.id,
            name: file.originalname,
            file_url: `/uploads/student_docs/${file.filename}`, // Using filename from multer
            type: documentTypes[index] || "Other",
            status: "pending",
          }),
        ),
      );
    }

    // 4. Create Salary Structure if grade provided (Onboarding)
    if (req.body.salary_grade_id) {
      try {
        const grade = await SalaryGrade.findByPk(req.body.salary_grade_id);
        if (grade) {
          await SalaryStructure.create({
            user_id: user.id,
            grade_id: grade.id,
            basic_salary: grade.basic_salary,
            allowances: grade.allowances || {},
            deductions: grade.deductions || {},
            effective_from: new Date(),
          });
          logger.info(
            `Created default Salary Structure for user ${user.id} using grade ${grade.name}`,
          );
        }
      } catch (err) {
        logger.error("Failed to create initial Salary Structure:", err);
        // Non-blocking error, user is created, payroll can be fixed later
      }
    }

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password_hash;

    res.status(201).json({
      success: true,
      data: userResponse,
    });
  } catch (error) {
    logger.error("Error in createUser:", error);
    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      return res.status(400).json({
        success: false,
        error: error.errors.map((e) => e.message).join(", "),
      });
    }
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    let user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Don't allow password update via this endpoint for security
    // Use a separate change-password endpoint
    const updateData = { ...req.body };
    delete updateData.password;
    // Note: Email updates are now allowed. Ensure uniqueness is validated.
    // delete updateData.email;

    // Parse JSON fields if they come from FormData (as strings)
    [
      "parent_details",
      "previous_academics",
      "bank_details",
      "custom_fields",
    ].forEach((field) => {
      if (typeof updateData[field] === "string") {
        try {
          updateData[field] = JSON.parse(updateData[field]);
        } catch (e) {
          // Keep current value if parsing fails, or reset based on type
          console.error(`Failed to parse ${field}:`, e);
        }
      }
    });

    user = await user.update(updateData);

    // Process Uploaded Documents (Now using StudentDocument model)
    if (req.files && req.files.length > 0) {
      logger.info(
        `Processing ${req.files.length} documents for user update ${user.id}`,
      );
      const { StudentDocument } = require("../models");
      const documentTypes = Array.isArray(req.body.document_types)
        ? req.body.document_types
        : [req.body.document_types];

      await Promise.all(
        req.files.map((file, index) =>
          StudentDocument.create({
            user_id: user.id,
            name: file.originalname,
            file_url: `/uploads/student_docs/${file.filename}`,
            type: documentTypes[index] || "Other",
            status: "pending",
          }),
        ),
      );
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error("Error in updateUser:", error);
    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      return res.status(400).json({
        success: false,
        error: error.errors.map((e) => e.message).join(", "),
      });
    }
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    await user.destroy();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    // Handle Foreign Key Constraint (e.g. user has created records)
    if (error.name === "SequelizeForeignKeyConstraintError") {
      try {
        await User.update(
          { is_active: false },
          { where: { id: req.params.id } },
        );
        return res.status(200).json({
          success: true,
          message:
            "User deactivated instead of deleted due to existing records.",
          data: { is_active: false },
        });
      } catch (updateError) {
        logger.error("Error deactivating user fallback:", updateError);
      }
    }

    logger.error("Error in deleteUser:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
// @desc    Bulk import users from file
// @route   POST /api/users/bulk-import
// @access  Private/Admin
exports.bulkImportUsers = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: "No file uploaded",
    });
  }

  const filePath = req.file.path;
  const { role_id, role: forcedRole, department_id, program_id } = req.body;

  try {
    const rawData = await Importer.parse(filePath);
    const results = {
      total: rawData.length,
      success: 0,
      failed: 0,
      errors: [],
    };

    // Default password for all imported users
    const defaultPasswordHash = await hashPassword("University@123");

    // Process one by one for detailed error reporting
    for (const [index, row] of rawData.entries()) {
      try {
        // Base user structure
        const userData = {
          // Identity
          first_name: row.first_name || row.FirstName,
          last_name: row.last_name || row.LastName,
          email: row.email || row.Email,
          phone: row.phone || row.Phone,
          date_of_birth: row.date_of_birth || row.DOB,
          gender: (row.gender || row.Gender || "other").toLowerCase(),

          // Classification
          role: forcedRole || row.role?.toLowerCase() || "student",
          role_id,
          department_id: department_id || row.department_id,
          program_id: program_id || row.program_id,
          employee_id: row.employee_id || row.EmployeeID,
          student_id: row.student_id || row.StudentID,
          admission_number: row.admission_number || row.AdmissionNumber,

          // Location
          address: row.address || row.Address,
          city: row.city || row.City,
          state: row.state || row.State,
          zip_code: row.zip_code || row.ZipCode || row.PINCode,

          // Detailed Identity
          religion: row.religion || row.Religion,
          caste: row.caste || row.Caste,
          nationality: row.nationality || row.Nationality || "Indian",
          aadhaar_number: row.aadhaar_number || row.AadhaarNumber,
          passport_number: row.passport_number || row.PassportNumber,

          // Academic/Org Stats
          batch_year: row.batch_year || row.BatchYear,
          current_semester: row.current_semester || row.Semester,
          joining_date: row.joining_date || row.JoiningDate,
          academic_status: (
            row.academic_status ||
            row.AcademicStatus ||
            "active"
          ).toLowerCase(),

          // Security
          password_hash: defaultPasswordHash,
          is_active: row.is_active !== undefined ? row.is_active : true,

          // Bank Details
          bank_details: {
            bank_name: row.bank_name || row.BankName,
            account_number: row.account_number || row.AccountNumber,
            ifsc_code: row.ifsc_code || row.IFSCCode,
            branch_name: row.branch_name || row.BranchName,
            holder_name: row.holder_name || row.HolderName,
          },

          // Parent/Guardian Details (for students)
          parent_details: {
            guardian_type: row.guardian_type || "Both Parents",
            father_name: row.father_name || row.FatherName,
            father_job: row.father_job || row.FatherJob,
            father_income: row.father_income || row.FatherIncome,
            father_email: row.father_email || row.FatherEmail,
            father_mobile: row.father_mobile || row.FatherMobile,
            mother_name: row.mother_name || row.MotherName,
            mother_job: row.mother_job || row.MotherJob,
            mother_income: row.mother_income || row.MotherIncome,
            mother_email: row.mother_email || row.MotherEmail,
            mother_mobile: row.mother_mobile || row.MotherMobile,
            guardian_name: row.guardian_name || row.GuardianName,
            guardian_job: row.guardian_job || row.GuardianJob,
            guardian_mobile: row.guardian_mobile || row.GuardianMobile,
            guardian_email: row.guardian_email || row.GuardianEmail,
          },

          // Custom/Specialized Fields (for staff/faculty/dynamic)
          custom_fields: {
            designation: row.designation || row.Designation,
            specialization: row.specialization || row.Specialization,
            staff_category: row.staff_category || row.StaffCategory,
            experience_years: row.experience_years || row.Experience,
            qualification: row.qualification || row.Qualification,
          },
        };

        // Basic check for email
        if (!userData.email) {
          throw new Error(`Row ${index + 1}: Email is missing`);
        }

        await User.create(userData);
        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push({
          row: index + 1,
          email: row.email || "N/A",
          error: err.message,
        });
        logger.warn(`Bulk Import Error at row ${index + 1}:`, err.message);
      }
    }

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    logger.error("Bulk Import System Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process import file",
    });
  } finally {
    // Delete temp file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

// @desc    Update user bank details
// @route   PUT /api/users/:id/bank-details
// @access  Private (Self or HR)
exports.updateBankDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { bank_name, account_number, ifsc_code, branch_name, holder_name } =
      req.body;

    // Find the user
    const user = await User.findByPk(id, {
      include: [{ model: Role, as: "role_data" }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Permission check: User can update their own, or HR/Admin can update anyone's
    const requesterId = req.user.userId;
    const requester = await User.findByPk(requesterId, {
      include: [{ model: Role, as: "role_data" }],
    });
    const requesterSlug = requester?.role_data?.slug;

    const isHR = ["admin", "super_admin", "hr", "hr_admin"].includes(
      requesterSlug,
    );
    const isSelf = requesterId === id;

    if (!isHR && !isSelf) {
      return res.status(403).json({
        success: false,
        error: "You don't have permission to update this user's bank details",
      });
    }

    // Validate IFSC code format (basic validation)
    if (ifsc_code && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc_code)) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid IFSC code format. Should be 11 characters (e.g., SBIN0001234)",
      });
    }

    // Validate account number (basic validation - numeric, 9-18 digits)
    if (account_number && !/^\d{9,18}$/.test(account_number)) {
      return res.status(400).json({
        success: false,
        error: "Invalid account number. Should be 9-18 digits",
      });
    }

    // Encrypt Account Number
    const { encrypt } = require("../utils/encryption");
    let finalAccountNumber = user.bank_details?.account_number || "";
    if (account_number) {
      finalAccountNumber = encrypt(account_number);
    }

    // Update bank details
    const updatedBankDetails = {
      bank_name: bank_name || user.bank_details?.bank_name || "",
      account_number: finalAccountNumber,
      ifsc_code: ifsc_code || user.bank_details?.ifsc_code || "",
      branch_name: branch_name || user.bank_details?.branch_name || "",
      holder_name: holder_name || user.bank_details?.holder_name || "",
    };

    await user.update({ bank_details: updatedBankDetails });

    res.status(200).json({
      success: true,
      message: "Bank details updated successfully",
      data: {
        bank_details: updatedBankDetails,
      },
    });
  } catch (error) {
    logger.error("Error in updateBankDetails:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Bulk update student sections
// @route   POST /api/users/bulk-update-sections
// @access  Private/Admin/HOD
exports.bulkUpdateSections = async (req, res) => {
  try {
    const { userIds, section } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "User IDs are required",
      });
    }

    // Permission Check
    if (req.user && req.user.userId) {
      const requester = await User.findByPk(req.user.userId, {
        include: [{ model: Role, as: "role_data" }],
      });
      const requesterSlug = requester?.role_data?.slug;

      if (requesterSlug !== "admin" && requesterSlug !== "super_admin") {
        if (requesterSlug === "hod") {
          // Check if all users belong to the same department
          const users = await User.findAll({
            where: {
              id: { [Op.in]: userIds },
              role: "student",
            },
            attributes: ["department_id"],
          });

          const unauthorized = users.some(
            (u) => u.department_id !== requester.department_id,
          );
          if (unauthorized) {
            return res.status(403).json({
              success: false,
              error: "You can only manage students in your own department",
            });
          }
        } else {
          return res.status(403).json({
            success: false,
            error: "Permission denied",
          });
        }
      }
    }

    await User.update(
      { section: section || null },
      {
        where: {
          id: { [Op.in]: userIds },
          role: "student",
        },
      },
    );

    res.status(200).json({
      success: true,
      message: `Successfully updated ${userIds.length} students`,
    });
  } catch (error) {
    logger.error("Error in bulkUpdateSections:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

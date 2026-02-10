const { DataTypes, Op } = require("sequelize");
const { sequelize } = require("../config/database");

/**
 * User Model
 * Represents all users in the system: students, faculty, staff, admin
 */
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    // Basic Information
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING(20),
    },

    // Authentication
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    // Role-Based Access Control (Dynamic)
    role_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "roles",
        key: "id",
      },
    },
    role: {
      // Keep for legacy/convenience during transition, but transition logic to role_id
      type: DataTypes.STRING(255),
      defaultValue: "student",
    },

    // User Type Specific Fields
    employee_id: {
      type: DataTypes.STRING(50),
      comment: "For faculty/staff",
    },
    student_id: {
      type: DataTypes.STRING(50),
      comment: "For students",
    },
    biometric_device_id: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: true,
      comment: "ID used in the physical biometrics device",
    },

    // Department Relation
    department_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "departments",
        key: "id",
      },
    },
    salary_grade_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "salary_grades",
        key: "id",
      },
      comment: "Linked Salary Grade for payroll",
    },

    // For Students
    program_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "programs",
        key: "id",
      },
      comment: "For students - their enrolled program",
    },
    regulation_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "regulations",
        key: "id",
      },
      comment: "For students - their academic regulation (e.g., R23)",
    },
    batch_year: {
      type: DataTypes.INTEGER,
      comment: "Year of admission for students",
    },
    current_semester: {
      type: DataTypes.INTEGER,
      comment: "Current semester for students",
    },
    section: {
      type: DataTypes.STRING(10),
      comment: "Section for students (e.g. A, B, C)",
    },
    admission_date: {
      type: DataTypes.DATEONLY,
      comment: "Date of admission for students",
    },
    is_hosteller: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Whether student is a hosteller",
    },
    requires_transport: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Whether student requires transport facility",
    },
    academic_status: {
      type: DataTypes.ENUM(
        "active",
        "promoted",
        "detained",
        "semester_back",
        "graduated",
        "dropout",
      ),
      defaultValue: "active",
    },
    designation: {
      type: DataTypes.STRING(100),
      comment: "Job title or designation of the employee",
    },

    // Contact Information
    date_of_birth: {
      type: DataTypes.DATEONLY,
    },
    gender: {
      type: DataTypes.ENUM("male", "female", "other"),
    },
    address: {
      type: DataTypes.TEXT,
    },
    city: {
      type: DataTypes.STRING(100),
    },
    state: {
      type: DataTypes.STRING(100),
    },
    zip_code: {
      type: DataTypes.STRING(20),
    },

    // Detailed Profile (Indian Context)
    religion: {
      type: DataTypes.STRING(50),
    },
    caste: {
      type: DataTypes.STRING(50),
    },
    nationality: {
      type: DataTypes.STRING(50),
      defaultValue: "Indian",
    },
    aadhaar_number: {
      type: DataTypes.STRING(20),
    },
    pan_number: {
      type: DataTypes.STRING(20),
    },
    passport_number: {
      type: DataTypes.STRING(20),
    },
    joining_date: {
      type: DataTypes.DATEONLY,
    },
    admission_number: {
      type: DataTypes.STRING(50),
    },
    admission_type: {
      type: DataTypes.ENUM("management", "convener"),
      allowNull: true,
    },
    is_lateral: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Flag for Lateral Entry students",
    },
    is_temporary_id: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Flag indicating if the current ID is temporary",
    },

    // Complex Data Fields
    bank_details: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment:
        "Stores bank name, account number, IFSC, branch, and holder name",
    },
    parent_details: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment:
        "Stores guardian_type, names, jobs, income, emails, and mobile for family",
    },
    previous_academics: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: "Stores academic history as array of objects",
    },
    custom_fields: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: "Store dynamic fields added by admin",
    },

    // Profile
    profile_picture: {
      type: DataTypes.STRING(500),
      comment: "S3 URL or file path",
    },
    bio: {
      type: DataTypes.TEXT,
    },

    // Account Status
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    email_verified_at: {
      type: DataTypes.DATE,
    },

    // Security
    last_login: {
      type: DataTypes.DATE,
    },
    password_reset_token: {
      type: DataTypes.STRING(255),
    },
    password_reset_expires: {
      type: DataTypes.DATE,
    },

    is_placement_coordinator: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment:
        "Whether the user is a placement coordinator for their department",
    },
    // Timestamps
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["email"], unique: true },
      {
        fields: ["employee_id"],
        unique: true,
        where: { employee_id: { [Op.ne]: null } },
      },
      {
        fields: ["student_id"],
        unique: true,
        where: { student_id: { [Op.ne]: null } },
      },
      {
        fields: ["admission_number"],
        unique: true,
        where: { admission_number: { [Op.ne]: null } },
      },
      {
        fields: ["aadhaar_number"],
        unique: true,
        where: { aadhaar_number: { [Op.ne]: null } },
      },
      { fields: ["role"] },
      { fields: ["department_id"] },
      { fields: ["is_active"] },
    ],
    hooks: {
      beforeValidate: (user) => {
        if (user.role) user.role = user.role.toLowerCase();
        if (user.gender) user.gender = user.gender.toLowerCase();
        if (user.academic_status)
          user.academic_status = user.academic_status.toLowerCase();
      },
    },
  },
);

// Instance methods
User.associate = (models) => {
  User.belongsTo(models.Role, {
    foreignKey: "role_id",
    as: "role_data",
  });
  User.belongsTo(models.Department, {
    foreignKey: "department_id",
    as: "department",
  });
  User.belongsTo(models.SalaryGrade, {
    foreignKey: "salary_grade_id",
    as: "salary_grade",
  });
  User.belongsTo(models.Program, {
    foreignKey: "program_id",
    as: "program",
  });
  User.belongsTo(models.Regulation, {
    foreignKey: "regulation_id",
    as: "regulation",
  });
};

User.prototype.getFullName = function () {
  return `${this.first_name} ${this.last_name}`;
};

User.prototype.isStudent = function () {
  return this.role_data?.slug === "student" || this.role === "student";
};

User.prototype.isFaculty = function () {
  return (
    this.role_data?.slug === "faculty" ||
    this.role === "faculty" ||
    this.role === "hod"
  );
};

User.prototype.isAdmin = function () {
  return this.role_data?.slug === "admin" || this.role === "admin";
};

module.exports = User;

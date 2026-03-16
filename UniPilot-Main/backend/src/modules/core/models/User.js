import { DataTypes, Op } from "sequelize";
import { sequelize } from "../../../config/database.js";
import { decrypt } from "../../../utils/encryption.js";

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
    biometric_device_id: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: true,
      comment: "ID used in the physical biometrics device",
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

    // Complex Data Fields
    bank_details: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment:
        "Stores bank name, account number, IFSC, branch, and holder name",
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
    schema: 'core',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["email"], unique: true },
      {
        fields: ["aadhaar_number"],
        unique: true,
        where: { aadhaar_number: { [Op.ne]: null } },
      },
      { fields: ["role"] },
      { fields: ["is_active"] },
    ],
    hooks: {
      beforeValidate: (user) => {
        if (user.role) user.role = user.role.toLowerCase();
        if (user.gender) user.gender = user.gender.toLowerCase();
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

User.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());

  // Safely decrypt account number if it exists
  if (values.bank_details && typeof values.bank_details.account_number === "string" && values.bank_details.account_number.length > 0) {
    // Re-assign the entire bank_details object carefully to not mutate the original reference if it's somehow reused
    const decryptedAccount = decrypt(values.bank_details.account_number);
    // Don't overwrite if decryption failed (returned original text or undefined), unless it actually changed
    // In our case, `decrypt` returns the original string if it fails to parse
    values.bank_details = {
      ...values.bank_details,
      account_number: decryptedAccount
    };
  }

  return values;
};

export default User;

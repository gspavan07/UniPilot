import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

/**
 * Program Model
 * Represents academic programs (e.g., B.Tech CSE, M.Sc Physics)
 */
const Program = sequelize.define(
  "Program",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    // Basic Information
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },

    // Program Type
    degree_type: {
      type: DataTypes.ENUM(
        "diploma",
        "undergraduate",
        "postgraduate",
        "doctoral"
      ),
      allowNull: false,
    },
    duration_years: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Program duration in years",
    },
    total_semesters: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // Department Relation
    department_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "departments",
        key: "id",
      },
    },

    // Admission Criteria
    min_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      comment: "Minimum percentage for admission",
    },
    max_intake: {
      type: DataTypes.INTEGER,
      comment: "Maximum students per batch",
    },

    // Status
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    tableName: "programs",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["code"], unique: true },
      { fields: ["department_id"] },
      { fields: ["degree_type"] },
      { fields: ["is_active"] },
    ],
  }
);

export default Program;

import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

/**
 * StudentDocument Model
 * Tracks document uploads and verification status for students
 */
const StudentDocument = sequelize.define(
  "StudentDocument",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: "Document name e.g. 10th Marksheet, Aadhaar Card",
    },
    type: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Document category",
    },
    file_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    remarks: {
      type: DataTypes.TEXT,
    },
    verified_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      comment: "Staff/Admin who verified the document",
    },
    verified_at: {
      type: DataTypes.DATE,
    },
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
    tableName: "student_documents",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["user_id"] },
      { fields: ["status"] },
      { fields: ["type"] },
    ],
  }
);

StudentDocument.associate = (models) => {
  StudentDocument.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "student",
  });
  StudentDocument.belongsTo(models.User, {
    foreignKey: "verified_by",
    as: "verifier",
  });
};

export default StudentDocument;

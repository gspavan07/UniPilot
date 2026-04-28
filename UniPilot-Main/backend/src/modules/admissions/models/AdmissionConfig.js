import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

/**
 * AdmissionConfig Model
 * Stores configuration for automated student ID generation and batch settings
 */
const AdmissionConfig = sequelize.define(
  "AdmissionConfig",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    batch_year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Academic year this config applies to",
    },
    university_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "B11",
      comment: "University code to be included in IDs",
    },
    id_format: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "{YY}{UNIV}{BRANCH}{SEQ}",
      comment:
        "{YY}=Year, {UNIV}=University Code, {BRANCH}=Program Code, {SEQ}=Sequence",
    },
    temp_id_format: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "T{YY}{SEQ}",
      comment: "Format for temporary IDs",
    },
    lateral_id_format: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "L{YY}{UNIV}{BRANCH}{SEQ}",
      comment: "Format for Lateral Entry IDs",
    },
    current_sequence: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "Next available sequence number for this batch",
    },
    program_sequences: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
      comment: "Tracks current sequence number per program ID",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    required_documents: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    field_config: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    seat_matrix: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
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
    tableName: "admission_configs",
    schema: 'admissions',
    timestamps: true,
    underscored: true,
  }
);

export default AdmissionConfig;

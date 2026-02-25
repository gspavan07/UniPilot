import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

const PlacementDocument = sequelize.define(
  "PlacementDocument",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    document_type: {
      type: DataTypes.STRING(50),
    },
    related_entity_type: {
      type: DataTypes.STRING(50),
    },
    related_entity_id: {
      type: DataTypes.UUID,
    },
    file_name: {
      type: DataTypes.STRING(255),
    },
    file_url: {
      type: DataTypes.STRING(500),
    },
    file_size_kb: {
      type: DataTypes.INTEGER,
    },
    uploaded_by: {
      type: DataTypes.UUID,
    },
  },
  {
    tableName: "placement_documents",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default PlacementDocument;

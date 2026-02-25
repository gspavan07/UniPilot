import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

/**
 * StudentRouteAllocation Model
 * Allocates students to routes and specific stops
 */
const StudentRouteAllocation = sequelize.define(
  "StudentRouteAllocation",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      comment: "Student allocated to transport",
    },
    route_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "transport_routes",
        key: "id",
      },
    },
    stop_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "transport_stops",
        key: "id",
      },
      comment: "Pickup/drop stop",
    },
    academic_year: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "Academic year (e.g., 2024-2025) - optional",
    },
    semester: {
      type: DataTypes.INTEGER,
      comment: "Semester number",
    },
    status: {
      type: DataTypes.ENUM("active", "suspended", "cancelled"),
      defaultValue: "active",
    },
    allocated_date: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },
    fee_structure_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "fee_structures",
        key: "id",
      },
      comment: "Legacy: Linked fee structure entry",
    },
    fee_charge_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "student_fee_charges",
        key: "id",
      },
      comment: "Linked student fee charge entry",
    },
    remarks: {
      type: DataTypes.TEXT,
      comment: "Additional notes",
    },
  },
  {
    tableName: "student_route_allocations",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["student_id"] },
      { fields: ["route_id"] },
      { fields: ["stop_id"] },
      { fields: ["status"] },
      { fields: ["academic_year"] },
    ],
  },
);

StudentRouteAllocation.associate = (models) => {
  StudentRouteAllocation.belongsTo(models.User, {
    foreignKey: "student_id",
    as: "student",
  });
  StudentRouteAllocation.belongsTo(models.Route, {
    foreignKey: "route_id",
    as: "route",
  });
  StudentRouteAllocation.belongsTo(models.TransportStop, {
    foreignKey: "stop_id",
    as: "stop",
  });
  StudentRouteAllocation.belongsTo(models.FeeStructure, {
    foreignKey: "fee_structure_id",
    as: "fee_structure",
  });
};

export default StudentRouteAllocation;

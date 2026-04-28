import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

const HostelAllocation = sequelize.define(
  "HostelAllocation",
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
    },
    room_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "hostel_rooms",
        key: "id",
      },
    },
    bed_id: {
      type: DataTypes.UUID,
      references: {
        model: "hostel_beds",
        key: "id",
      },
    },
    fee_structure_id: {
      type: DataTypes.UUID,
      references: {
        model: "hostel_fee_structures",
        key: "id",
      },
    },
    mess_fee_structure_id: {
      type: DataTypes.UUID,
      references: {
        model: "hostel_mess_fee_structures",
        key: "id",
      },
    },
    check_in_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    check_out_date: {
      type: DataTypes.DATE,
    },
    rent_fee_id: {
      type: DataTypes.UUID,
      references: {
        model: "fee_structures",
        key: "id",
      },
    },
    mess_fee_id: {
      type: DataTypes.UUID,
      references: {
        model: "fee_structures",
        key: "id",
      },
    },
    rent_fee_charge_id: {
      type: DataTypes.UUID,
      references: {
        model: "student_fee_charges",
        key: "id",
      },
    },
    mess_fee_charge_id: {
      type: DataTypes.UUID,
      references: {
        model: "student_fee_charges",
        key: "id",
      },
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    academic_year: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "checked_out", "cancelled"),
      defaultValue: "active",
    },
    scheduled_checkout_semester: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "hostel_allocations",
    schema: 'hostel',
    underscored: true,
    timestamps: true,
  },
);

export default HostelAllocation;

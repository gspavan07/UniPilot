const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const StaffAttendance = sequelize.define(
  "StaffAttendance",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("present", "absent", "leave", "half-day", "holiday"),
      defaultValue: "present",
      allowNull: false,
    },
    check_in_time: {
      type: DataTypes.TIME,
    },
    check_out_time: {
      type: DataTypes.TIME,
    },
    remarks: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "staff_attendance",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "date"],
      },
      {
        fields: ["date"],
      },
    ],
  }
);

StaffAttendance.associate = (models) => {
  StaffAttendance.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "staff",
  });
};

module.exports = StaffAttendance;

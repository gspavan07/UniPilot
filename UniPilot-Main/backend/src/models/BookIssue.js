import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const BookIssue = sequelize.define(
  "BookIssue",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    book_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "books", key: "id" },
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    issue_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    return_date: {
      type: DataTypes.DATE,
    },
    status: {
      type: DataTypes.ENUM("issued", "returned", "overdue", "lost"),
      defaultValue: "issued",
    },
    fine_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    remarks: {
      type: DataTypes.TEXT,
    },
    issued_by: {
      type: DataTypes.UUID,
      references: { model: "users", key: "id" },
    },
  },
  {
    tableName: "book_issues",
    timestamps: true,
    underscored: true,
  }
);

export default BookIssue;

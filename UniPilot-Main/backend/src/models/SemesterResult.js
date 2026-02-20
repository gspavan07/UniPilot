import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const SemesterResult = sequelize.define(
    "SemesterResult",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        student_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
        },
        semester: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        sgpa: {
            type: DataTypes.DECIMAL(4, 2),
            allowNull: true,
            comment: "Semester Grade Point Average",
        },
        cgpa: {
            type: DataTypes.DECIMAL(4, 2),
            allowNull: true,
            comment: "Cumulative Grade Point Average",
        },
        total_credits: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        earned_credits: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        backlogs: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        status: {
            type: DataTypes.ENUM("pass", "fail", "detained"),
            defaultValue: "pass",
        },
        is_published: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        published_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "semester_results",
        timestamps: true,
        underscored: true,
    }
);

export default SemesterResult;

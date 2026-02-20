import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import { sequelize } from '../src/models/index.js';
import { DataTypes } from 'sequelize';

async function addColumns() {
    const queryInterface = sequelize.getQueryInterface();
    try {
        console.log("Checking columns...");

        const tableInfo = await queryInterface.describeTable('exam_timetables');

        if (!tableInfo.paper_format) {
            console.log("Adding paper_format column...");
            await queryInterface.addColumn('exam_timetables', 'paper_format', {
                type: DataTypes.JSONB,
                allowNull: true,
                comment: "Structure of question paper with questions, marks, and CO mapping",
            });
            console.log("✅ Column 'paper_format' added.");
        } else {
            console.log("ℹ️ Column 'paper_format' already exists.");
        }

        if (!tableInfo.exam_status) {
            console.log("Adding exam_status column...");
            await queryInterface.addColumn('exam_timetables', 'exam_status', {
                type: DataTypes.STRING(20),
                defaultValue: 'assigned',
                allowNull: false,
                comment: "Status: assigned, format_submitted, approved",
            });
            console.log("✅ Column 'exam_status' added.");
        } else {
            console.log("ℹ️ Column 'exam_status' already exists.");
        }

    } catch (error) {
        console.error("❌ Error modifying table:", error.message);
    } finally {
        await sequelize.close();
    }
}

addColumns();

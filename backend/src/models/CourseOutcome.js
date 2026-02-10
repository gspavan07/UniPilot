const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CourseOutcome = sequelize.define(
    'CourseOutcome',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        course_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'courses',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        co_code: {
            type: DataTypes.STRING(20),
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        target_attainment: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 60.0,
            validate: {
                min: 0,
                max: 100,
            },
            comment: 'Target attainment percentage for this course outcome',
        },
    },
    {
        tableName: 'course_outcomes',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['course_id', 'co_code'],
                name: 'course_outcomes_course_co_unique',
            },
        ],
    }
);

module.exports = CourseOutcome;

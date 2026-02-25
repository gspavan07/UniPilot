import { DataTypes } from 'sequelize';
import { sequelize } from '../../../config/database.js';

const CoPoMap = sequelize.define(
    'CoPoMap',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        course_outcome_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'course_outcomes',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        program_outcome_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'program_outcomes',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        weightage: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0,
                max: 3,
            },
            comment: '0=No mapping, 1=Low, 2=Medium, 3=High correlation',
        },
    },
    {
        tableName: 'co_po_maps',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['course_outcome_id', 'program_outcome_id'],
                name: 'co_po_maps_unique_mapping',
            },
        ],
    }
);

export default CoPoMap;

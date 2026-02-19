import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const ProgramOutcome = sequelize.define(
    'ProgramOutcome',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        program_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'programs',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        po_code: {
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
    },
    {
        tableName: 'program_outcomes',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['program_id', 'po_code'],
                name: 'program_outcomes_program_po_unique',
            },
        ],
    }
);

export default ProgramOutcome;

import { DataTypes } from 'sequelize';
import { sequelize } from '../../../config/database.js';

const StudentProfile = sequelize.define('StudentProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },
  student_id: {
    type: DataTypes.STRING(50),
    unique: true,
  },
  program_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  regulation_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  batch_year: {
    type: DataTypes.INTEGER,
  },
  current_semester: {
    type: DataTypes.INTEGER,
  },
  section: {
    type: DataTypes.STRING(10),
  },
  admission_date: {
    type: DataTypes.DATEONLY,
  },
  is_hosteller: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  requires_transport: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  academic_status: {
    type: DataTypes.ENUM('active', 'promoted', 'detained', 'semester_back', 'graduated', 'dropout'),
    defaultValue: 'active',
  },
  admission_number: {
    type: DataTypes.STRING(50),
    unique: true,
  },
  admission_type: {
    type: DataTypes.ENUM('management', 'convener'),
    allowNull: true,
  },
  is_lateral: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_temporary_id: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  parent_details: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  previous_academics: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  is_placement_coordinator: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'student_profiles',
  schema: 'academics',
  timestamps: true,
  underscored: true,
});

StudentProfile.associate = (models) => {
  // We associate with Core module's User
  StudentProfile.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  
  if (models.Program) {
    StudentProfile.belongsTo(models.Program, { foreignKey: 'program_id', as: 'program' });
  }
  if (models.Regulation) {
    StudentProfile.belongsTo(models.Regulation, { foreignKey: 'regulation_id', as: 'regulation' });
  }
};

export default StudentProfile;

import { DataTypes } from 'sequelize';
import { sequelize } from '../../../config/database.js';

const StaffProfile = sequelize.define('StaffProfile', {
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
  employee_id: {
    type: DataTypes.STRING(50),
    unique: true,
  },
  department_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  salary_grade_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  designation: {
    type: DataTypes.STRING(100),
  },
  joining_date: {
    type: DataTypes.DATEONLY,
  },
}, {
  tableName: 'staff_profiles',
  schema: 'hr',
  timestamps: true,
  underscored: true,
});

StaffProfile.associate = (models) => {
  // We associate with Core module's User
  StaffProfile.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  
  if (models.Department) {
    StaffProfile.belongsTo(models.Department, { foreignKey: 'department_id', as: 'department' });
  }
  if (models.SalaryGrade) {
    StaffProfile.belongsTo(models.SalaryGrade, { foreignKey: 'salary_grade_id', as: 'salary_grade' });
  }
};

export default StaffProfile;

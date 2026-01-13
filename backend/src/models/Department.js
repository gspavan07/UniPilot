const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Department Model
 * Represents academic departments in the university
 */
const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  // Basic Information
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    unique: true,
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: 'e.g., CSE, EEE, MECH',
  },
  description: {
    type: DataTypes.TEXT,
  },
  
  // HOD (Head of Department)
  hod_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'Faculty assigned as HOD',
  },
  
  // Parent Department (for sub-departments)
  parent_department_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'departments',
      key: 'id',
    },
  },
  
  // Contact Information
  email: {
    type: DataTypes.STRING(255),
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING(20),
  },
  office_location: {
    type: DataTypes.STRING(200),
  },
  
  // Status
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  
  // Metadata
  established_date: {
    type: DataTypes.DATEONLY,
  },
  
  // Timestamps
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'departments',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['code'], unique: true },
    { fields: ['name'], unique: true },
    { fields: ['hod_id'] },
    { fields: ['is_active'] },
  ],
});

module.exports = Department;

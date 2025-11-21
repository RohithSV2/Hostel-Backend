const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING, // 'student' or 'admin'
    defaultValue: 'student'
  },
  // Student Specific Details
  rollNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  roomNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: { type: DataTypes.STRING, allowNull: true },
  guardianName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  guardianPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bloodGroup: { type: DataTypes.STRING, allowNull: true },
  profileImage: {
    type: DataTypes.STRING, // URL to image
    allowNull: true
  }
});

module.exports = User;
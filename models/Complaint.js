const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Complaint = sequelize.define('Complaint', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING, // Electrical, Plumbing, Carpentry, Cleaning, Internet, Food, Other
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Normal', 'High', 'Urgent'),
    defaultValue: 'Normal'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Pending', 'In Progress', 'Resolved', 'Rejected'),
    defaultValue: 'Pending'
  },
  adminRemarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = Complaint;
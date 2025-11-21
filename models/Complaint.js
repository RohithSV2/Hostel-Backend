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
    type: DataTypes.STRING, // Electrical, Plumbing, etc.
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Resolved'),
    defaultValue: 'Pending'
  },
  date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  // Note: We don't need to define userId here manually because 
  // models/index.js handles the relationships automatically.
});

module.exports = Complaint;
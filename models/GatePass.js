const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GatePass = sequelize.define('GatePass', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false
  },
  passType: {
    type: DataTypes.ENUM('Day Out', 'Night Stay', 'Home Visit', 'Emergency Leave'),
    defaultValue: 'Day Out'
  },
  from: {
    type: DataTypes.STRING,
    allowNull: false
  },
  to: {
    type: DataTypes.STRING,
    allowNull: false
  },
  departureTime: {
    type: DataTypes.STRING,
    allowNull: true
  },
  returnTime: {
    type: DataTypes.STRING,
    allowNull: true
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: { 
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Used', 'Expired'), 
    defaultValue: 'Pending' 
  },
  parentConsent: {
    type: DataTypes.STRING,
    defaultValue: 'Granted'
  },
  adminRemarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  passToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = GatePass;
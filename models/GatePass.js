const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GatePass = sequelize.define('GatePass', {
  reason: DataTypes.STRING,
  from: DataTypes.STRING,
  to: DataTypes.STRING,
  status: { type: DataTypes.STRING, defaultValue: 'Pending' }, // Pending, Approved, Rejected
  studentId: DataTypes.INTEGER
});

module.exports = GatePass;
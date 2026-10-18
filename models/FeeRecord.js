const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FeeRecord = sequelize.define('FeeRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    defaultValue: 'Semester Hostel & Mess Fee'
  },
  totalAmount: {
    type: DataTypes.INTEGER,
    defaultValue: 45000
  },
  paidAmount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  pendingAmount: {
    type: DataTypes.INTEGER,
    defaultValue: 45000
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Paid', 'Partial', 'Pending', 'Overdue'),
    defaultValue: 'Pending'
  },
  paymentDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  receiptNumber: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = FeeRecord;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notice = sequelize.define('Notice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('Normal', 'Important', 'Urgent'),
    defaultValue: 'Normal'
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'General'
  },
  targetBlock: {
    type: DataTypes.STRING,
    defaultValue: 'All'
  },
  postedBy: {
    type: DataTypes.STRING,
    defaultValue: 'Hostel Administration'
  }
});

module.exports = Notice;

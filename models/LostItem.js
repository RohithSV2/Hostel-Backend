const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = sequelize.define('LostItem', {
  item: DataTypes.STRING,
  location: DataTypes.STRING,
  contact: DataTypes.STRING,
  image: DataTypes.STRING, // URL
  type: { type: DataTypes.ENUM('LOST', 'FOUND'), defaultValue: 'LOST' },
  isResolved: { type: DataTypes.BOOLEAN, defaultValue: false },
  foundByContact: DataTypes.STRING
});
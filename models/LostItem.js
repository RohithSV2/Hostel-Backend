const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LostItem = sequelize.define('LostItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  item: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contact: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  proofImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  type: { 
    type: DataTypes.ENUM('LOST', 'FOUND'), 
    defaultValue: 'LOST' 
  },
  isResolved: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false 
  },
  foundByContact: {
    type: DataTypes.STRING,
    allowNull: true
  },
  date: {
    type: DataTypes.STRING,
    defaultValue: 'Recently'
  }
});

module.exports = LostItem;
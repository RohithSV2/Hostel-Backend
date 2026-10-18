const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MessFeedback = sequelize.define('MessFeedback', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  day: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mealType: {
    type: DataTypes.ENUM('Breakfast', 'Lunch', 'Snacks', 'Dinner'),
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  },
  comment: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = MessFeedback;

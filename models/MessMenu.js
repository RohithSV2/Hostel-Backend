const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MessMenu = sequelize.define('MessMenu', {
  day: { type: DataTypes.STRING, unique: true }, // Mon, Tue...
  breakfast: DataTypes.STRING,
  lunch: DataTypes.STRING,
  snacks: DataTypes.STRING,
  dinner: DataTypes.STRING
});

module.exports = MessMenu;
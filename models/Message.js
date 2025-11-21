const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  content: DataTypes.STRING,
  senderId: DataTypes.INTEGER,
  receiverId: DataTypes.INTEGER, // If NULL, it's a General Chat message
  isNotice: { type: DataTypes.BOOLEAN, defaultValue: false } // For Admin Broadcasts
});

module.exports = Message;
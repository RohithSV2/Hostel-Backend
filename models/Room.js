const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  roomNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  block: {
    type: DataTypes.STRING,
    defaultValue: 'A-Block'
  },
  floor: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  capacity: {
    type: DataTypes.INTEGER,
    defaultValue: 3
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: '3-Sharing Non-AC'
  },
  rentPerSemester: {
    type: DataTypes.INTEGER,
    defaultValue: 35000
  },
  status: {
    type: DataTypes.ENUM('AVAILABLE', 'FULL', 'MAINTENANCE'),
    defaultValue: 'AVAILABLE'
  },
  amenities: {
    type: DataTypes.STRING,
    defaultValue: 'Study Table, Wardrobe, High-Speed Wi-Fi'
  }
});

module.exports = Room;

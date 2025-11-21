const sequelize = require('../config/database');
const User = require('./User');
const Complaint = require('./Complaint');
const GatePass = require('./GatePass');
const MessMenu = require('./MessMenu');
const Message = require('./Message');
const LostItem = require('./LostItem'); // New Model below

// Relationships
User.hasMany(Complaint, { foreignKey: 'userId' });
Complaint.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(GatePass, { foreignKey: 'studentId' });
GatePass.belongsTo(User, { foreignKey: 'studentId' });

// Chat System
User.hasMany(Message, { as: 'SentMessages', foreignKey: 'senderId' });
User.hasMany(Message, { as: 'ReceivedMessages', foreignKey: 'receiverId' });
Message.belongsTo(User, { as: 'Sender', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'Receiver', foreignKey: 'receiverId' });

// Lost & Found
User.hasMany(LostItem, { foreignKey: 'reportedBy' });
LostItem.belongsTo(User, { foreignKey: 'reportedBy' });

module.exports = { sequelize, User, Complaint, GatePass, MessMenu, Message, LostItem };
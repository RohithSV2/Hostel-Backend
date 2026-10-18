const sequelize = require('../config/database');
const User = require('./User');
const Room = require('./Room');
const Complaint = require('./Complaint');
const GatePass = require('./GatePass');
const MessMenu = require('./MessMenu');
const MessFeedback = require('./MessFeedback');
const FeeRecord = require('./FeeRecord');
const Notice = require('./Notice');
const Message = require('./Message');
const LostItem = require('./LostItem');

// --- RELATIONSHIPS ---

// Complaints
User.hasMany(Complaint, { foreignKey: 'userId' });
Complaint.belongsTo(User, { foreignKey: 'userId' });

// Gate Passes
User.hasMany(GatePass, { foreignKey: 'studentId' });
GatePass.belongsTo(User, { foreignKey: 'studentId' });

// Fees
User.hasMany(FeeRecord, { foreignKey: 'studentId' });
FeeRecord.belongsTo(User, { foreignKey: 'studentId' });

// Mess Feedback
User.hasMany(MessFeedback, { foreignKey: 'studentId' });
MessFeedback.belongsTo(User, { foreignKey: 'studentId' });

// Chat System
User.hasMany(Message, { as: 'SentMessages', foreignKey: 'senderId' });
User.hasMany(Message, { as: 'ReceivedMessages', foreignKey: 'receiverId' });
Message.belongsTo(User, { as: 'Sender', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'Receiver', foreignKey: 'receiverId' });

// Lost & Found
User.hasMany(LostItem, { foreignKey: 'reportedBy' });
LostItem.belongsTo(User, { foreignKey: 'reportedBy' });

module.exports = {
  sequelize,
  User,
  Room,
  Complaint,
  GatePass,
  MessMenu,
  MessFeedback,
  FeeRecord,
  Notice,
  Message,
  LostItem
};
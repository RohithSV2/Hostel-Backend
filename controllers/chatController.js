const { Message, User } = require('../models');
const { Op } = require('sequelize');

// Get messages for General Chat (receiverId is null)
exports.getGeneralChat = async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { receiverId: null },
      include: [{ model: User, as: 'Sender', attributes: ['id', 'name', 'role'] }],
      order: [['createdAt', 'ASC']]
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Send a message (DM or General)
exports.sendMessage = async (req, res) => {
  try {
    const { content, senderId, receiverId, isNotice } = req.body;
    const msg = await Message.create({ content, senderId, receiverId, isNotice });
    
    // Fetch it back with Sender info to update UI instantly
    const fullMsg = await Message.findByPk(msg.id, {
      include: [{ model: User, as: 'Sender', attributes: ['id', 'name', 'role'] }]
    });
    
    res.json(fullMsg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get DMs for a specific user
exports.getMyDMs = async (req, res) => {
  try {
    const userId = req.params.userId;
    // Find all messages where user is sender OR receiver
    const messages = await Message.findAll({
      where: { 
        [Op.or]: [{ senderId: userId }, { receiverId: userId }],
        receiverId: { [Op.ne]: null } // Exclude general chat
      },
      include: [
        { model: User, as: 'Sender', attributes: ['id', 'name', 'profileImage'] },
        { model: User, as: 'Receiver', attributes: ['id', 'name', 'profileImage'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
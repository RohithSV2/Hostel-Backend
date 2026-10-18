const { Message, User } = require('../models');
const { Op } = require('sequelize');
const { getIO } = require('../utils/socket');

// @desc    Get all General Community chat messages
// @route   GET /api/chat/general
exports.getGeneralChat = async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { receiverId: null },
      include: [{ model: User, as: 'Sender', attributes: ['id', 'name', 'roomNumber', 'role'] }],
      order: [['createdAt', 'ASC']],
      limit: 100
    });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching general chat:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all DMs for a user
// @route   GET /api/chat/dms/:userId
exports.getMyDMs = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId || req.user?.id);
    if (!userId) return res.status(400).json({ message: 'User ID required' });

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: [
        { model: User, as: 'Sender', attributes: ['id', 'name', 'roomNumber'] },
        { model: User, as: 'Receiver', attributes: ['id', 'name', 'roomNumber'] }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching DMs:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Send a message (General or DM or Notice)
// @route   POST /api/chat/send
exports.sendMessage = async (req, res) => {
  try {
    const { content, senderId, receiverId, isNotice } = req.body;
    const actualSenderId = senderId || req.user?.id;

    if (!content || !actualSenderId) {
      return res.status(400).json({ message: 'Content and sender ID are required' });
    }

    const message = await Message.create({
      content,
      senderId: actualSenderId,
      receiverId: receiverId ? parseInt(receiverId) : null,
      isNotice: !!isNotice
    });

    const fullMessage = await Message.findByPk(message.id, {
      include: [
        { model: User, as: 'Sender', attributes: ['id', 'name', 'roomNumber', 'role'] },
        { model: User, as: 'Receiver', attributes: ['id', 'name', 'roomNumber'] }
      ]
    });

    // Real-time broadcast
    if (receiverId) {
      getIO().emit(`dm_${receiverId}`, fullMessage);
      getIO().emit(`dm_${actualSenderId}`, fullMessage);
    } else {
      getIO().emit('general_message', fullMessage);
    }

    res.status(201).json(fullMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
};
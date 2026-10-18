const { LostItem, User, Message } = require('../models');
const { getIO } = require('../utils/socket');

// @desc    Get all lost & found items
// @route   GET /api/lostfound
exports.getLostItems = async (req, res) => {
  try {
    const items = await LostItem.findAll({
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['id', 'name', 'roomNumber', 'phone'] }]
    });

    const formatted = items.map(item => ({
      id: item.id.toString(),
      item: item.item,
      location: item.location,
      contact: item.contact,
      type: item.type,
      image: item.image,
      proofImage: item.proofImage,
      date: item.date || item.createdAt.toISOString().split('T')[0],
      isResolved: item.isResolved,
      foundBy: item.foundByContact
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching lost items:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Report new Lost / Found item
// @route   POST /api/lostfound
exports.reportLostItem = async (req, res) => {
  try {
    const { item, location, contact, type, reportedBy, description } = req.body;
    let imageUrl = null;

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.image && typeof req.body.image === 'string') {
      imageUrl = req.body.image;
    }

    const newItem = await LostItem.create({
      item,
      location,
      contact,
      type: type || 'LOST',
      description: description || '',
      image: imageUrl,
      reportedBy: reportedBy ? parseInt(reportedBy) : null,
      date: 'Just Now',
      isResolved: false
    });

    const result = {
      id: newItem.id.toString(),
      item: newItem.item,
      location: newItem.location,
      contact: newItem.contact,
      type: newItem.type,
      image: newItem.image,
      date: newItem.date,
      isResolved: false
    };

    getIO().emit('new_lost_item', result);

    res.status(201).json(result);
  } catch (error) {
    console.error('Error reporting lost item:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Resolve a lost item / report found
// @route   PUT /api/lostfound/:id/resolve
exports.resolveLostItem = async (req, res) => {
  try {
    const { foundByContact, proofImage } = req.body;
    const item = await LostItem.findByPk(req.params.id);

    if (!item) return res.status(404).json({ message: 'Item not found' });

    item.isResolved = true;
    item.type = 'FOUND';
    if (foundByContact) item.foundByContact = foundByContact;
    if (proofImage) item.proofImage = proofImage;
    if (req.file) item.proofImage = `/uploads/${req.file.filename}`;

    await item.save();

    // Auto send notification message if reportedBy is set
    if (item.reportedBy) {
      await Message.create({
        content: `Great news! Your lost item "${item.item}" was reported found by ${foundByContact || 'a student'}. Check the Lost & Found section to claim it.`,
        senderId: 1, // Admin / system
        receiverId: item.reportedBy,
        isNotice: false
      });
    }

    getIO().emit('item_resolved', item);

    res.json({ success: true, item });
  } catch (error) {
    console.error('Error resolving lost item:', error);
    res.status(500).json({ error: error.message });
  }
};

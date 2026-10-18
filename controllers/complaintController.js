const { Complaint, User } = require('../models');
const { getIO } = require('../utils/socket');

// @desc    Submit a new complaint
// @route   POST /api/complaints
exports.createComplaint = async (req, res) => {
  const { title, category, priority, description, userId, image } = req.body;

  try {
    const studentId = userId || req.user?.id;
    if (!studentId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const complaint = await Complaint.create({
      title,
      category,
      priority: priority || 'Normal',
      description,
      image: image || (req.file ? `/uploads/${req.file.filename}` : null),
      status: 'Pending',
      userId: studentId
    });

    const fullComplaint = await Complaint.findByPk(complaint.id, {
      include: [{ model: User, attributes: ['id', 'name', 'roomNumber', 'phone'] }]
    });

    // Notify Admins in real-time
    getIO().emit('new_complaint', fullComplaint);

    res.status(201).json(fullComplaint);
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ message: 'Error creating complaint', error: error.message });
  }
};

// @desc    Get complaints for the logged-in student
// @route   GET /api/complaints/my/:userId
exports.getMyComplaints = async (req, res) => {
  try {
    const targetUserId = req.params.userId || req.user?.id;
    const complaints = await Complaint.findAll({
      where: { userId: targetUserId },
      order: [['createdAt', 'DESC']]
    });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching complaints', error: error.message });
  }
};

// @desc    Get ALL complaints (For Admin)
// @route   GET /api/complaints/all
exports.getAllComplaints = async (req, res) => {
  try {
    const { status, category } = req.query;
    const whereClause = {};

    if (status && status !== 'All') {
      whereClause.status = status;
    }
    if (category && category !== 'All') {
      whereClause.category = category;
    }

    const complaints = await Complaint.findAll({
      where: whereClause,
      include: [{ model: User, attributes: ['id', 'name', 'roomNumber', 'phone', 'guardianPhone', 'rollNumber'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all complaints', error: error.message });
  }
};

// @desc    Update complaint status & remarks (For Admin)
// @route   PUT /api/complaints/:id/status
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;
    const complaint = await Complaint.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'name', 'roomNumber'] }]
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.status = status;
    if (adminRemarks) complaint.adminRemarks = adminRemarks;
    if (status === 'Resolved') {
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    // Live update event
    getIO().emit('complaint_status_change', {
      complaintId: complaint.id,
      userId: complaint.userId,
      status: complaint.status,
      adminRemarks: complaint.adminRemarks
    });

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Error updating complaint', error: error.message });
  }
};

// @desc    Mark complaint as Resolved (Legacy compatibility)
// @route   PUT /api/complaints/:id/resolve
exports.resolveComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.status = 'Resolved';
    complaint.resolvedAt = new Date();
    if (req.body?.adminRemarks) {
      complaint.adminRemarks = req.body.adminRemarks;
    }

    await complaint.save();

    getIO().emit('complaint_status_change', {
      complaintId: complaint.id,
      userId: complaint.userId,
      status: 'Resolved'
    });

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Error updating complaint', error: error.message });
  }
};
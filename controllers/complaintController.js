const { Complaint, User } = require('../models'); // Import from central models index

// @desc    Submit a new complaint
// @route   POST /api/complaints
exports.createComplaint = async (req, res) => {
  const { title, category, description, userId } = req.body;

  try {
    const complaint = await Complaint.create({
      title,
      category,
      description,
      userId
    });
    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Error creating complaint', error });
  }
};

// @desc    Get complaints for the logged-in student
// @route   GET /api/complaints/my/:userId
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.findAll({
      where: { userId: req.params.userId },
      order: [['createdAt', 'DESC']]
    });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching complaints' });
  }
};

// @desc    Get ALL complaints (For Admin)
// @route   GET /api/complaints/all
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.findAll({
      include: [{ model: User, attributes: ['name', 'roomNumber'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all complaints' });
  }
};

// @desc    Mark complaint as Resolved
// @route   PUT /api/complaints/:id/resolve
exports.resolveComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id);
    if (complaint) {
      complaint.status = 'Resolved';
      await complaint.save();
      res.json(complaint);
    } else {
      res.status(404).json({ message: 'Complaint not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating complaint' });
  }
};
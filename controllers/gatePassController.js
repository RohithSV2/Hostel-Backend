const { GatePass, User } = require('../models');

// @desc    Create a new Gate Pass Request
// @route   POST /api/gatepass
exports.createGatePass = async (req, res) => {
  const { reason, from, to, studentId } = req.body;
  try {
    const newPass = await GatePass.create({
      reason, 
      from, 
      to, 
      studentId, 
      status: 'Pending'
    });
    
    // Return the pass with User data included for the frontend to display nicely immediately
    const fullPass = await GatePass.findByPk(newPass.id, {
        include: [{ model: User, attributes: ['name', 'roomNumber'] }]
    });
    
    res.status(201).json(fullPass);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get Gate Passes for a specific student
// @route   GET /api/gatepass/my/:studentId
exports.getMyGatePasses = async (req, res) => {
  try {
    const passes = await GatePass.findAll({
      where: { studentId: req.params.studentId },
      order: [['createdAt', 'DESC']]
    });
    res.json(passes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get ALL Gate Passes (For Admin)
// @route   GET /api/gatepass/all
exports.getAllGatePasses = async (req, res) => {
  try {
    const passes = await GatePass.findAll({
      include: [{ model: User, attributes: ['name', 'roomNumber'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(passes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Approve/Reject Gate Pass
// @route   PUT /api/gatepass/:id
exports.updateGatePassStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await GatePass.update({ status }, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
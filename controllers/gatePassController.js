const { GatePass, User } = require('../models');
const { getIO } = require('../utils/socket');

// @desc    Create a new Gate Pass Request
// @route   POST /api/gatepass
exports.createGatePass = async (req, res) => {
  const { reason, passType, from, to, departureTime, returnTime, destination, studentId } = req.body;
  try {
    const id = studentId || req.user?.id;
    if (!id) return res.status(400).json({ error: 'Student ID required' });

    const newPass = await GatePass.create({
      reason, 
      passType: passType || 'Day Out',
      from, 
      to, 
      departureTime: departureTime || '10:00 AM',
      returnTime: returnTime || '07:00 PM',
      destination: destination || 'City / Hometown',
      studentId: id, 
      status: 'Pending',
      parentConsent: 'Granted'
    });
    
    const fullPass = await GatePass.findByPk(newPass.id, {
      include: [{ model: User, attributes: ['id', 'name', 'roomNumber', 'rollNumber', 'phone', 'guardianPhone'] }]
    });

    getIO().emit('new_gatepass_request', fullPass);
    
    res.status(201).json(fullPass);
  } catch (err) {
    console.error('Gate pass create error:', err);
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get Gate Passes for a specific student
// @route   GET /api/gatepass/my/:studentId
exports.getMyGatePasses = async (req, res) => {
  try {
    const id = req.params.studentId || req.user?.id;
    const passes = await GatePass.findAll({
      where: { studentId: id },
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
      include: [{ model: User, attributes: ['id', 'name', 'roomNumber', 'rollNumber', 'phone', 'guardianPhone'] }],
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
    const { status, adminRemarks } = req.body;
    const pass = await GatePass.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'name', 'roomNumber', 'rollNumber'] }]
    });

    if (!pass) return res.status(404).json({ message: 'Gate pass not found' });

    pass.status = status;
    if (adminRemarks) pass.adminRemarks = adminRemarks;

    if (status === 'Approved') {
      pass.passToken = `GP-${pass.id}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    await pass.save();

    getIO().emit('gatepass_status_updated', {
      passId: pass.id,
      studentId: pass.studentId,
      status: pass.status,
      passToken: pass.passToken
    });

    res.json({ success: true, pass });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Verify Gate Pass by passToken (Security Guard action)
// @route   GET /api/gatepass/verify/:token
exports.verifyPassToken = async (req, res) => {
  try {
    const pass = await GatePass.findOne({
      where: { passToken: req.params.token },
      include: [{ model: User, attributes: ['name', 'rollNumber', 'roomNumber', 'phone'] }]
    });

    if (!pass) return res.status(404).json({ valid: false, message: 'Invalid Pass Token' });
    if (pass.status !== 'Approved') return res.status(400).json({ valid: false, message: `Pass is ${pass.status}` });

    res.json({ valid: true, pass });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
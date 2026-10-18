const { User, Room, GatePass, Complaint, MessMenu, Notice, FeeRecord } = require('../models');
const bcrypt = require('bcryptjs');
const { getIO } = require('../utils/socket');

// @desc    Add a new Student (Admin)
// @route   POST /api/admin/add-student
exports.addStudent = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      rollNo, 
      rollNumber, 
      roomNo, 
      roomNumber, 
      phone, 
      parentPhone, 
      guardianPhone, 
      guardianName,
      course,
      block,
      bedId
    } = req.body;

    const actualRoll = rollNumber || rollNo || `CS${Date.now().toString().slice(-4)}`;
    const actualRoom = roomNumber || roomNo || null;
    const actualPhone = phone || null;
    const actualParentPhone = guardianPhone || parentPhone || null;

    // Check if user already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || '123456', salt);

    const student = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'student',
      rollNumber: actualRoll,
      roomNumber: actualRoom,
      block: block || 'A-Block',
      bedId: bedId || 'A',
      phone: actualPhone,
      guardianName: guardianName || 'Guardian',
      guardianPhone: actualParentPhone,
      course: course || 'B.Tech - Computer Science',
      feesPending: 45000,
      checkInStatus: 'In Campus'
    });

    // If room is specified, update room record if exists
    if (actualRoom) {
      const room = await Room.findOne({ where: { roomNumber: actualRoom } });
      if (room) {
        const studentCount = await User.count({ where: { roomNumber: actualRoom, role: 'student' } });
        if (studentCount >= room.capacity) {
          room.status = 'FULL';
          await room.save();
        }
      }
    }

    // Create initial fee record
    await FeeRecord.create({
      studentId: student.id,
      title: 'Semester Hostel & Mess Fee',
      totalAmount: 45000,
      paidAmount: 0,
      pendingAmount: 45000,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Student added successfully',
      student
    });
  } catch (err) {
    console.error('Error adding student:', err);
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get all students
// @route   GET /api/admin/students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.findAll({
      where: { role: 'student' },
      attributes: { exclude: ['password'] },
      order: [['roomNumber', 'ASC'], ['name', 'ASC']]
    });
    res.json(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get student by ID with full details
// @route   GET /api/admin/students/:id
exports.getStudentById = async (req, res) => {
  try {
    const student = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: Complaint, limit: 5, order: [['createdAt', 'DESC']] },
        { model: GatePass, limit: 5, order: [['createdAt', 'DESC']] },
        { model: FeeRecord, limit: 5, order: [['createdAt', 'DESC']] }
      ]
    });

    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Update student details / room reallocation
// @route   PUT /api/admin/students/:id
exports.updateStudent = async (req, res) => {
  try {
    const student = await User.findByPk(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const { name, roomNumber, bedId, block, phone, guardianPhone, feesPending, course, checkInStatus } = req.body;

    if (name !== undefined) student.name = name;
    if (roomNumber !== undefined) student.roomNumber = roomNumber;
    if (bedId !== undefined) student.bedId = bedId;
    if (block !== undefined) student.block = block;
    if (phone !== undefined) student.phone = phone;
    if (guardianPhone !== undefined) student.guardianPhone = guardianPhone;
    if (feesPending !== undefined) student.feesPending = feesPending;
    if (course !== undefined) student.course = course;
    if (checkInStatus !== undefined) student.checkInStatus = checkInStatus;

    await student.save();
    res.json({ success: true, message: 'Student updated successfully', student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Delete student
// @route   DELETE /api/admin/students/:id
exports.deleteStudent = async (req, res) => {
  try {
    const student = await User.findByPk(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    await student.destroy();
    res.json({ success: true, message: 'Student removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get all gate passes for admin
// @route   GET /api/admin/gatepass
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

// @desc    Update gate pass status (Approve / Reject)
// @route   PUT /api/admin/gatepass/:id
exports.updateGatePassStatus = async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;
    const pass = await GatePass.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['name', 'rollNumber'] }]
    });

    if (!pass) return res.status(404).json({ message: 'Gate pass not found' });

    pass.status = status;
    if (adminRemarks) pass.adminRemarks = adminRemarks;

    if (status === 'Approved') {
      pass.passToken = `GP-${pass.id}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    await pass.save();

    // Emit live update
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

// @desc    Update mess menu
// @route   POST /api/admin/menu
exports.updateMenu = async (req, res) => {
  const { day, breakfast, lunch, snacks, dinner } = req.body;
  try {
    let menu = await MessMenu.findOne({ where: { day } });
    if (menu) {
      await menu.update({ breakfast, lunch, snacks, dinner });
    } else {
      await MessMenu.create({ day, breakfast, lunch, snacks, dinner });
    }
    res.json({ success: true, message: `Menu for ${day} updated successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Broadcast announcement notice
// @route   POST /api/admin/notice
exports.broadcastNotice = async (req, res) => {
  try {
    const { title, content, priority, category, targetBlock } = req.body;
    const notice = await Notice.create({
      title,
      content,
      priority: priority || 'Normal',
      category: category || 'General',
      targetBlock: targetBlock || 'All',
      postedBy: req.user?.name || 'Hostel Warden'
    });

    getIO().emit('new_notice', notice);
    res.status(201).json(notice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get all notices
// @route   GET /api/admin/notices
exports.getNotices = async (req, res) => {
  try {
    const notices = await Notice.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
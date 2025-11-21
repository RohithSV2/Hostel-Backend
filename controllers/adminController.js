const User = require('../models/User');
const GatePass = require('../models/GatePass');
const MessMenu = require('../models/MessMenu');
const bcrypt = require('bcryptjs');

// 1. ADD STUDENT (Req #3)
exports.addStudent = async (req, res) => {
  try {
    const { name, email, password, phone, parentPhone, rollNo, roomNo } = req.body;
    
    // Hash password so they can login
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name, email, password: hashedPassword,
      role: 'student',
      rollNumber: rollNo,
      roomNumber: roomNo,
      phone, // Make sure to add 'phone' to User.js model if missing
      guardianPhone: parentPhone
    });
    res.json(newUser);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// 2. MANAGE GATE PASS (Req #4)
exports.getAllGatePasses = async (req, res) => {
  const passes = await GatePass.findAll({ include: User, order: [['createdAt', 'DESC']] });
  res.json(passes);
};

exports.updateGatePassStatus = async (req, res) => {
  const { status } = req.body; // 'Approved' or 'Rejected'
  await GatePass.update({ status }, { where: { id: req.params.id } });
  res.json({ success: true });
};

// 3. UPDATE MENU (Req #2)
exports.updateMenu = async (req, res) => {
  const { day, breakfast, lunch, snacks, dinner } = req.body;
  // Upsert (Update if exists, Insert if not)
  const menu = await MessMenu.findOne({ where: { day } });
  if (menu) {
    await menu.update({ breakfast, lunch, snacks, dinner });
  } else {
    await MessMenu.create({ day, breakfast, lunch, snacks, dinner });
  }
  res.json({ success: true });
};

// 4. GET ALL STUDENTS (For Rooms Tab)
exports.getAllStudents = async (req, res) => {
  const students = await User.findAll({ where: { role: 'student' } });
  res.json(students);
};
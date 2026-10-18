const express = require('express');
const router = express.Router();
const { User, Room, Complaint, GatePass, FeeRecord } = require('../models');

// @desc    Get complete dashboard summary for logged-in student
// @route   GET /api/student/dashboard/:userId
router.get('/dashboard/:userId', async (req, res) => {
  try {
    const student = await User.findByPk(req.params.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Fetch roommates if student has a room
    let roommates = [];
    if (student.roomNumber) {
      roommates = await User.findAll({
        where: {
          roomNumber: student.roomNumber,
          role: 'student'
        },
        attributes: ['id', 'name', 'bedId', 'phone', 'rollNumber']
      });
      roommates = roommates.filter(r => r.id !== student.id);
    }

    // Pending issues count
    const pendingIssues = await Complaint.count({
      where: { userId: student.id, status: 'Pending' }
    });

    // Active gate passes count
    const activePasses = await GatePass.count({
      where: { studentId: student.id, status: 'Approved' }
    });

    // Fee records
    const fees = await FeeRecord.findAll({
      where: { studentId: student.id },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      student,
      roommates,
      pendingIssues,
      activePasses,
      fees
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

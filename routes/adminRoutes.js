const express = require('express');
const router = express.Router();
const { 
  addStudent, 
  getAllStudents, 
  getStudentById,
  updateStudent,
  deleteStudent,
  getAllGatePasses, 
  updateGatePassStatus, 
  updateMenu,
  broadcastNotice,
  getNotices
} = require('../controllers/adminController');
const { getDashboardStats } = require('../controllers/statsController');

// Dashboard Stats
router.get('/stats', getDashboardStats);

// Student Records CRUD
router.post('/add-student', addStudent);
router.get('/students', getAllStudents);
router.get('/students/:id', getStudentById);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);

// Gate Pass Review
router.get('/gatepass', getAllGatePasses);
router.put('/gatepass/:id', updateGatePassStatus);

// Mess Menu
router.post('/menu', updateMenu);

// Announcements / Notices
router.post('/notice', broadcastNotice);
router.get('/notices', getNotices);

module.exports = router;
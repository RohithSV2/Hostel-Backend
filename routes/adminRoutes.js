const express = require('express');
const router = express.Router();
const { 
  addStudent, 
  getAllStudents, 
  getAllGatePasses, 
  updateGatePassStatus, 
  updateMenu 
} = require('../controllers/adminController');
const { getDashboardStats } = require('../controllers/statsController');

// Stats
router.get('/stats', getDashboardStats);

// Students & Rooms
router.post('/add-student', addStudent);
router.get('/students', getAllStudents);

// Gate Pass
router.get('/gatepass', getAllGatePasses);
router.put('/gatepass/:id', updateGatePassStatus);

// Mess
router.post('/menu', updateMenu);

module.exports = router;
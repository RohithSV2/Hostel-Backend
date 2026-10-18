const express = require('express');
const router = express.Router();
const { 
  createComplaint, 
  getMyComplaints, 
  getAllComplaints, 
  resolveComplaint,
  updateComplaintStatus
} = require('../controllers/complaintController');
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/authMiddleware');

// Student Routes
router.post('/', upload.single('image'), authMiddleware, createComplaint);
router.get('/my', authMiddleware, getMyComplaints);
router.get('/my/:userId', getMyComplaints);

// Admin Routes
router.get('/all', getAllComplaints);
router.put('/:id/resolve', resolveComplaint);
router.put('/:id/status', updateComplaintStatus);

module.exports = router;
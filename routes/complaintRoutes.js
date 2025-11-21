const express = require('express');
const router = express.Router();
const { 
  createComplaint, 
  getMyComplaints, 
  getAllComplaints, 
  resolveComplaint 
} = require('../controllers/complaintController');

// Student Routes
router.post('/', createComplaint);
router.get('/my/:userId', getMyComplaints);

// Admin Routes
router.get('/all', getAllComplaints);
router.put('/:id/resolve', resolveComplaint);

module.exports = router;
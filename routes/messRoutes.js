const express = require('express');
const router = express.Router();
const { 
  getMenu, 
  updateMenu, 
  submitFeedback, 
  getFeedbackStats 
} = require('../controllers/messController');

router.get('/', getMenu);
router.post('/update', updateMenu);
router.post('/feedback', submitFeedback);
router.get('/feedback/stats', getFeedbackStats);

module.exports = router;
const express = require('express');
const router = express.Router();
const { 
  createGatePass, 
  getMyGatePasses, 
  getAllGatePasses, 
  updateGatePassStatus,
  verifyPassToken
} = require('../controllers/gatePassController');

const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createGatePass);
router.get('/my', authMiddleware, getMyGatePasses);
router.get('/my/:studentId', getMyGatePasses);
router.get('/all', getAllGatePasses);
router.put('/:id', updateGatePassStatus);
router.get('/verify/:token', verifyPassToken);

module.exports = router;
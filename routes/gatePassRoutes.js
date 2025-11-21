const express = require('express');
const router = express.Router();
const { createGatePass, getMyGatePasses, getAllGatePasses, updateGatePassStatus } = require('../controllers/gatePassController');

router.post('/', createGatePass);
router.get('/my/:studentId', getMyGatePasses);
router.get('/all', getAllGatePasses);
router.put('/:id', updateGatePassStatus);

module.exports = router;
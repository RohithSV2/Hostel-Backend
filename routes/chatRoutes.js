const express = require('express');
const router = express.Router();
const { getGeneralChat, sendMessage, getMyDMs } = require('../controllers/chatController');

router.get('/general', getGeneralChat);
router.get('/dms/:userId', getMyDMs);
router.post('/send', sendMessage);

module.exports = router;
const express = require('express');
const router = express.Router();
const { getMenu, updateMenu } = require('../controllers/messController');

// The URL here is relative to what is in server.js
router.get('/', getMenu);       // Maps to GET /api/mess/
router.post('/update', updateMenu); // Maps to POST /api/mess/update

module.exports = router;
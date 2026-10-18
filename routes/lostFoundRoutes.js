const express = require('express');
const router = express.Router();
const { 
  getLostItems, 
  reportLostItem, 
  resolveLostItem 
} = require('../controllers/lostFoundController');
const upload = require('../middleware/upload');

router.get('/', getLostItems);
router.post('/', upload.single('image'), reportLostItem);
router.put('/:id/resolve', upload.single('proofImage'), resolveLostItem);

module.exports = router;

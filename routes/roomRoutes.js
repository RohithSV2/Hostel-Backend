const express = require('express');
const router = express.Router();
const {
  getAllRooms,
  getRoomDetails,
  allocateRoom,
  deallocateRoom,
  updateRoomStatus,
  createRoom
} = require('../controllers/roomController');

router.get('/', getAllRooms);
router.get('/:roomNumber', getRoomDetails);
router.post('/allocate', allocateRoom);
router.post('/deallocate', deallocateRoom);
router.put('/:id/status', updateRoomStatus);
router.post('/', createRoom);

module.exports = router;

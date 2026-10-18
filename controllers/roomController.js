const { Room, User } = require('../models');

// @desc    Get all rooms with current occupants
// @route   GET /api/rooms
exports.getAllRooms = async (req, res) => {
  try {
    // 1. Fetch all rooms
    const rooms = await Room.findAll({
      order: [['block', 'ASC'], ['floor', 'ASC'], ['roomNumber', 'ASC']]
    });

    // 2. Fetch all students who have an assigned room
    const students = await User.findAll({
      where: { role: 'student' },
      attributes: ['id', 'name', 'rollNumber', 'roomNumber', 'bedId', 'phone', 'guardianPhone', 'email']
    });

    // 3. Map students to rooms
    const result = rooms.map(room => {
      const occupants = students.filter(s => s.roomNumber === room.roomNumber);
      const isFull = occupants.length >= room.capacity;
      
      return {
        id: room.id,
        roomNo: room.roomNumber,
        roomNumber: room.roomNumber,
        block: room.block,
        floor: room.floor,
        capacity: room.capacity,
        type: room.type,
        rentPerSemester: room.rentPerSemester,
        amenities: room.amenities,
        occupants: occupants,
        status: room.status === 'MAINTENANCE' ? 'MAINTENANCE' : (isFull ? 'FULL' : 'AVAILABLE'),
        availableBeds: Math.max(0, room.capacity - occupants.length)
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get single room details
// @route   GET /api/rooms/:roomNumber
exports.getRoomDetails = async (req, res) => {
  try {
    const room = await Room.findOne({ where: { roomNumber: req.params.roomNumber } });
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const occupants = await User.findAll({
      where: { roomNumber: room.roomNumber, role: 'student' },
      attributes: ['id', 'name', 'rollNumber', 'bedId', 'phone', 'guardianPhone', 'email']
    });

    res.json({
      ...room.toJSON(),
      occupants,
      availableBeds: Math.max(0, room.capacity - occupants.length)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Allocate student to room & bed
// @route   POST /api/rooms/allocate
exports.allocateRoom = async (req, res) => {
  try {
    const { studentId, roomNumber, bedId, block } = req.body;
    
    const student = await User.findByPk(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const room = await Room.findOne({ where: { roomNumber } });
    if (!room) return res.status(404).json({ message: 'Room not found' });

    // Check capacity
    const currentOccupants = await User.count({
      where: { roomNumber, role: 'student' }
    });

    if (currentOccupants >= room.capacity && student.roomNumber !== roomNumber) {
      return res.status(400).json({ message: 'Room is already at full capacity' });
    }

    // Determine bed ID if not provided
    let assignedBed = bedId;
    if (!assignedBed) {
      const existingBeds = (await User.findAll({
        where: { roomNumber, role: 'student' },
        attributes: ['bedId']
      })).map(u => u.bedId);

      const candidateBeds = ['A', 'B', 'C', 'D'];
      assignedBed = candidateBeds.find(b => !existingBeds.includes(b)) || 'A';
    }

    student.roomNumber = roomNumber;
    student.block = block || room.block;
    student.bedId = assignedBed;
    await student.save();

    // Check if room is now full
    const newCount = await User.count({ where: { roomNumber, role: 'student' } });
    if (newCount >= room.capacity) {
      room.status = 'FULL';
      await room.save();
    }

    res.json({
      success: true,
      message: `Student allocated to Room ${roomNumber} (Bed ${assignedBed})`,
      student
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Deallocate student from room
// @route   POST /api/rooms/deallocate
exports.deallocateRoom = async (req, res) => {
  try {
    const { studentId } = req.body;
    const student = await User.findByPk(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const oldRoomNo = student.roomNumber;
    student.roomNumber = null;
    student.bedId = null;
    await student.save();

    if (oldRoomNo) {
      const room = await Room.findOne({ where: { roomNumber: oldRoomNo } });
      if (room && room.status === 'FULL') {
        room.status = 'AVAILABLE';
        await room.save();
      }
    }

    res.json({ success: true, message: 'Student removed from room' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update room maintenance status
// @route   PUT /api/rooms/:id/status
exports.updateRoomStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'AVAILABLE' | 'FULL' | 'MAINTENANCE'
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    room.status = status;
    await room.save();
    res.json({ success: true, room });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create new room
// @route   POST /api/rooms
exports.createRoom = async (req, res) => {
  try {
    const { roomNumber, block, floor, capacity, type, rentPerSemester, amenities } = req.body;
    const existing = await Room.findOne({ where: { roomNumber } });
    if (existing) return res.status(400).json({ message: 'Room number already exists' });

    const room = await Room.create({
      roomNumber,
      block: block || 'A-Block',
      floor: floor || 1,
      capacity: capacity || 3,
      type: type || '3-Sharing Non-AC',
      rentPerSemester: rentPerSemester || 35000,
      amenities: amenities || 'Wi-Fi, Study Table, Wardrobe'
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

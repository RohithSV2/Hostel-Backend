const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'hostelmate_jwt_secret_key_2026_xyz';
  return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

// @desc    Register new user
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
  const { 
    name, 
    email, 
    password, 
    role, 
    rollNumber, 
    roomNumber, 
    block, 
    bedId, 
    phone, 
    guardianName, 
    guardianPhone,
    bloodGroup,
    course 
  } = req.body;

  try {
    // 1. Check if user exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    if (rollNumber) {
      const rollExists = await User.findOne({ where: { rollNumber } });
      if (rollExists) {
        return res.status(400).json({ message: 'Student with this roll number already exists' });
      }
    }

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || '123456', salt);

    // 3. Create User
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
      rollNumber: rollNumber || `STD${Date.now().toString().slice(-4)}`,
      roomNumber: roomNumber || null,
      block: block || 'A-Block',
      bedId: bedId || 'A',
      phone: phone || null,
      guardianName: guardianName || null,
      guardianPhone: guardianPhone || null,
      bloodGroup: bloodGroup || 'O+',
      course: course || 'B.Tech - Computer Science',
      feesPending: role === 'student' ? 45000 : 0
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      rollNumber: user.rollNumber,
      roomNumber: user.roomNumber,
      block: user.block,
      bedId: user.bedId,
      phone: user.phone,
      guardianName: user.guardianName,
      guardianPhone: user.guardianPhone,
      bloodGroup: user.bloodGroup,
      course: user.course,
      feesPending: user.feesPending,
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check for user email
    const user = await User.findOne({ where: { email } });

    // 2. Check password
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
        roomNumber: user.roomNumber,
        block: user.block,
        bedId: user.bedId,
        phone: user.phone,
        guardianName: user.guardianName,
        guardianPhone: user.guardianPhone,
        bloodGroup: user.bloodGroup,
        course: user.course,
        feesPending: user.feesPending,
        profileImage: user.profileImage,
        checkInStatus: user.checkInStatus,
        token: generateToken(user.id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile by ID
// @route   GET /api/auth/me/:id
exports.getMe = async (req, res) => {
  try {
    const targetId = req.params.id || req.user?.id;
    const user = await User.findByPk(targetId, {
      attributes: { exclude: ['password'] }
    });

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const targetId = req.user?.id || req.body.id;
    const user = await User.findByPk(targetId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { phone, guardianName, guardianPhone, bloodGroup, checkInStatus, profileImage } = req.body;
    
    if (phone !== undefined) user.phone = phone;
    if (guardianName !== undefined) user.guardianName = guardianName;
    if (guardianPhone !== undefined) user.guardianPhone = guardianPhone;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
    if (checkInStatus !== undefined) user.checkInStatus = checkInStatus;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const targetId = req.user?.id || req.body.id;
    const user = await User.findByPk(targetId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
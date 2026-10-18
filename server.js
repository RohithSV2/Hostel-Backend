const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { sequelize } = require('./models');
const socketUtil = require('./utils/socket');

// Load Environment Variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
socketUtil.init(server);

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploaded static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- MOUNT ROUTES ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/gatepass', require('./routes/gatePassRoutes'));
app.use('/api/mess', require('./routes/messRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/lostfound', require('./routes/lostFoundRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));

// Test / Health Route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'HostelMate Advanced Management API is Running!',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// --- SERVER START ---
const PORT = process.env.PORT || 5000;

sequelize.sync()
  .then(async () => {
    console.log('✅ SQLite Database & Tables Synced');

    // Auto-seed if database is fresh (crucial for Render deployments)
    try {
      const userCount = await User.count();
      if (userCount === 0) {
        console.log('🌱 Fresh database detected. Auto-seeding initial records...');
        const seed = require('./seed');
        await seed();
      }
    } catch (seedErr) {
      console.warn('⚠️ Auto-seed note:', seedErr.message);
    }

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 HostelMate Backend listening on port ${PORT}`);
      console.log(`📡 Local address: http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Database Sync Error:', err);
  });
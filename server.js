const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { sequelize } = require('./models'); // <--- We import the DB connection from our new index file
const { Server } = require('socket.io');
const http = require('http');

// Load Environment Variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// --- ROUTES ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
// app.use('/api/student', require('./routes/studentRoutes')); // Add this when you create the file
// app.use('/api/chat', require('./routes/chatRoutes')); // Add this when you create the file

//  latest
app.use('/api/complaints', require('./routes/complaintRoutes'));

// UNCOMMENT THIS LINE:
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/mess', require('./routes/messRoutes'));

//latest

// Simple Test Route
app.get('/', (req, res) => {
  res.send('Hostel Backend is Running!');
});

// --- SOCKET.IO SETUP ---
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// --- SERVER START ---
const PORT = process.env.PORT || 5000;

// We use 'sequelize.sync' here. The relationships are already handled inside ./models/index.js
sequelize.sync({ alter: true }) 
  .then(() => {
    console.log('✅ Database & Tables Synced (Schema Updated)');
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.log('❌ Database Error:', err));

  
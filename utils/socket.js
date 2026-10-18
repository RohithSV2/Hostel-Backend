let io;

module.exports = {
  init: (httpServer) => {
    const { Server } = require('socket.io');
    io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
      }
    });

    io.on('connection', (socket) => {
      console.log('⚡ Socket connected:', socket.id);

      socket.on('join_user_room', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`Socket ${socket.id} joined user_${userId}`);
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      console.warn('Socket.io not yet initialized');
      return {
        emit: () => {},
        to: () => ({ emit: () => {} })
      };
    }
    return io;
  }
};

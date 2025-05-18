// sockets/socket.js
let io = null;

const initSocket = (server) => {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    socket.on('joinTableRoom', ({ tableId }) => {
      if (tableId) {
        socket.join(`table-${tableId}`);
        console.log(`👥 Socket ${socket.id} joined table-${tableId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("⚠️ Socket.IO not initialized");
  return io;
};

module.exports = { initSocket, getIO };

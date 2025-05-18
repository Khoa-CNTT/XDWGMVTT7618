const { Server } = require("socket.io");

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*", // tuỳ chỉnh nếu bạn muốn giới hạn domain
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("✅ A user connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("❌ A user disconnected:", socket.id);
    });

    // socket.on(...) thêm các sự kiện tuỳ chỉnh ở đây
  });
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io chưa được khởi tạo! Gọi initSocket(server) trước.");
  }
  return io;
}

module.exports = { initSocket, getIO };

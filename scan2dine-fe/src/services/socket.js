// socket.js
import io from 'socket.io-client';

// Thay `http://localhost:3000` bằng URL và cổng thực tế của BE
const socket = io(`${process.env.REACT_APP_URL}`, {
    transports: ['websocket'], // Đảm bảo sử dụng websocket
    reconnection: true,       // Tự động kết nối lại nếu mất kết nối
    reconnectionAttempts: Infinity, // Số lần thử kết nối lại
    reconnectionDelay: 1000,  // Thời gian chờ giữa các lần thử
    autoConnect: true,       // Tự động kết nối khi khởi tạo
});

// Xử lý khi kết nối thành công
socket.on('connect', () => {
    console.log('Đã kết nối tới backend qua Socket.IO, socket ID:', socket.id);
});

// Xử lý khi mất kết nối
socket.on('disconnect', () => {
    console.log('Mất kết nối với backend');
});

// Xử lý lỗi kết nối
socket.on('connect_error', (error) => {
    console.error('Lỗi kết nối:', error);
});

export default socket;
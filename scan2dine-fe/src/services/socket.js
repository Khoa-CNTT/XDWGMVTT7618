import { io } from 'socket.io-client';

//sử dungj biến môi trường
const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const socket = io(SOCKET_URL, {
    transports: ['websocket'], // Tùy chọn: đảm bảo dùng WebSocket thay vì polling
    withCredentials: true,
});
console.log('Khởi tạo socket với URL:', SOCKET_URL); // Thêm log
export default socket;
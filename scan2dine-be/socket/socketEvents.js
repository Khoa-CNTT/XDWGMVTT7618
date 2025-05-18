const { getIO } = require('./socket');

/**
 * Gửi sự kiện socket chuẩn hóa
 * @param {string} type - Loại đối tượng: 'order', 'orderDetail', 'table', 'cartDetail'
 * @param {string} action - Hành động: 'created', 'updated', 'deleted', 'changed'
 * @param {object} data - Dữ liệu gửi đi
 * @param {string} [room] - Tùy chọn: gửi vào room cụ thể (ví dụ: table-abc)
 */

// Các hàm rút gọn tiện dụng

// Các hàm tiện lợi có thể gọi riêng
const notifyOrderCreated = (order) => {
  const io = getIO();
  io.to(`table-${order.table}`).emit('order:created', order);
};

module.exports = {
  notifyOrderCreated,
}
const { Order } = require('../model/model');
const { updateOrderDetailStatus } = require('../utils/orderDetailUtils');

const confirmAllPendingOrderDetails = async (orderId) => {
    const order = await Order.findById(orderId).populate('orderdetail');
    if (!order) throw new Error('Order not found');

    const updatedDetails = [];
    for (const detail of order.orderdetail) {
        // duyệt qua từng cái trong mảng orderdetail của order và kiểm tra trạng thái 
        if (detail.status === 'Chờ xác nhận') {
            // Gọi lại hàm bạn đã viết để xử lý từng cái và gộp nếu có
            const result = await updateOrderDetailStatus(orderId, detail._id.toString(), 'Xác nhận');
            updatedDetails.push(result);
        }
    }

    return {
        message: 'Đã chuyển tất cả OrderDetail từ Chờe xác nhận sang xác nhận',
        updates: updatedDetails,
        order: await Order.findById(orderId).populate('orderdetail')
    };
};



module.exports = {
    confirmAllPendingOrderDetails
};

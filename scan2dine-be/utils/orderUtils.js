const { Orderdetail, Product, Order } = require('../model/model');
const { notifyOrderUpdated } = require('./socketUtils');

const mergeDuplicateOrderDetails = async (orderId,io) => {
    const order = await Order.findById(orderId).populate('orderdetail');
    if (!order) throw new Error('Order not found');

    const mergedDetails = [];
    const deletedDetailIds = [];

    const grouped = {};

    // Gom nhóm theo product + status
    for (let detail of order.orderdetail) {
        const key = `${detail.products.toString()}-${detail.status}`;
        if (!grouped[key]) {
            grouped[key] = detail;
        } else {
            grouped[key].quantity += detail.quantity;
            await grouped[key].save();

            await Product.findByIdAndUpdate(detail.products, {
                $pull: { orderdetail: detail._id }
            });

            await Orderdetail.findByIdAndDelete(detail._id);
            order.orderdetail = order.orderdetail.filter(
                (od) => od._id.toString() !== detail._id.toString()
            );

            deletedDetailIds.push(detail._id);
        }
    }

    await order.save();

    return {
        message: 'Đã gộp các OrderDetail trùng nhau',
        merged: Object.values(grouped),
        deleted: deletedDetailIds,
        order
    };
};
const calculateTotalOrderPrice = async (orderId,io) => {
    try {
        // Lấy các OrderDetail liên quan đến đơn hàng
        const orderDetails = await Orderdetail.find({ order: orderId });

        // Tính tổng tiền
        let total = 0;
        for (let item of orderDetails) {
            total  += item.total || 0;
        }

        // Cập nhật vào Order nếu cần
        await Order.findByIdAndUpdate(orderId, { total_amount: total });
        // Phát sự kiện cập nhật tổng tiền
        // const io = req.app.get('io');
        notifyOrderUpdated(io, orderId, { orderId, total });
        return total;
    } catch (error) {
        console.error('Error calculating total order price:', error);
        throw error;
    }
};
module.exports = {
    mergeDuplicateOrderDetails,
    calculateTotalOrderPrice
};
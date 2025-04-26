const { Orderdetail, Product, Order } = require('../model/model');

const mergeDuplicateOrderDetails = async (orderId) => {
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
module.exports = {
    mergeDuplicateOrderDetails
};
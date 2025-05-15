const { Order, Orderdetail, Product } = require('../model/model');

const updateOrderDetailStatus = async (orderId, orderDetailId, newStatus) => {
    // Lấy đơn hàng và populate chi tiết đơn hàng
    const order = await Order.findById(orderId).populate('orderdetail');
    if (!order) throw new Error('Order not found');

    // Tìm OrderDetail cần cập nhật
    const targetDetail = order.orderdetail.find(
        (od) => od._id.toString() === orderDetailId
    );
    if (!targetDetail) throw new Error('OrderDetail not found');

    // Nếu trạng thái không thay đổi thì không làm gì cả
    if (targetDetail.status === newStatus) return {
        message: 'Trạng thái không thay đổi',
        order
    };
    console.log('newStatus:', `"${newStatus}"`);
    order.orderdetail.forEach(od => {
        console.log('od.status:', `"${od.status}"`, '==?', `"${newStatus}"`);
    });
    // Tìm OrderDetail khác có cùng sản phẩm và cùng trạng thái mới
    const duplicateDetail = order.orderdetail.find(
        (od) =>
            od._id.toString() !== orderDetailId &&
            od.products.toString() === targetDetail.products.toString() &&
            od.status.trim() === newStatus.trim() // loại bỏ khoảng trống 
    );

    if (duplicateDetail) {
        // Gộp số lượng
        duplicateDetail.quantity += targetDetail.quantity;
        await duplicateDetail.save();

        // Xoá khỏi bảng Product
        await Product.findByIdAndUpdate(targetDetail.products, {
            $pull: { orderdetail: targetDetail._id }
        });

        // Xoá OrderDetail khỏi DB
        await Orderdetail.findByIdAndDelete(targetDetail._id);

        // Xoá khỏi mảng order.orderdetail
        order.orderdetail = order.orderdetail.filter(
            (od) => od._id.toString() !== targetDetail._id.toString()
        );

        await order.save();

        // Trả về thông báo thành công gộp và kết quả gộp
        return {
            message: 'Gộp thành công',
            mergedDetail: duplicateDetail, // Chi tiết OrderDetail đã gộp
            deletedDetailId: targetDetail._id, // ID của OrderDetail đã bị xoá
            order // Trả về đơn hàng cập nhật
        };
    } else {
        // Chỉ cập nhật trạng thái nếu không có gì để gộp
        targetDetail.status = newStatus;
        await targetDetail.save();
        await order.save();

        return {
            message: 'Cập nhật trạng thái thành công',
            updatedDetail: targetDetail, // Chi tiết OrderDetail đã được cập nhật
            order // Trả về đơn hàng cập nhật
        };
    }
};

module.exports = {
    updateOrderDetailStatus,
};

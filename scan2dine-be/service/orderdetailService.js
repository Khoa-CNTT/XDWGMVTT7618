const { Orderdetail, Order, Product } = require('../model/model');
const { notifyOrderDetailChanged, notifyOrderTotalUpdated } = require('../utils/socketUtils');  // Import socket emitters
// Hàm tăng số lượng
const increaseOrderQuantity = async (io, orderID, productID, quantity = 1, note = '') => {
    let orderDetailItem = await Orderdetail.findOne({ order: orderID, products: productID });
    console.log(orderDetailItem);
    if (orderDetailItem) {
        orderDetailItem.quantity += quantity; // Tăng số lượng
        // Gộp note mới nếu có truyền vào
        if (note) {
            orderDetailItem.note = note;
        }
        await orderDetailItem.save();

        // Gửi thông báo qua socket khi tăng số lượng
        notifyOrderDetailChanged(io, orderID, 'updated', { orderDetail: orderDetailItem });

        // Cập nhật tổng đơn hàng
        notifyOrderTotalUpdated(io, orderID, { total: await calculateOrderTotal(orderID) });

        return { updated: true, detail: orderDetailItem };
    } else {
        // Nếu chưa có sản phẩm, tạo mới
        const newItem = new Orderdetail({
            order: orderID,
            products: productID,
            quantity: quantity,
            note: note,
        });
        await newItem.save();

        // Gửi thông báo qua socket khi thêm sản phẩm mới
        notifyOrderDetailChanged(io, orderID, 'added', { orderDetail: newItem });

        // Cập nhật tổng đơn hàng
        notifyOrderTotalUpdated(io, orderID, { total: await calculateOrderTotal(orderID) });

        return { updated: false, detail: newItem };
    }
};

// Hàm giảm số lượng
const decreaseOrderQuantity = async (io, order, products, quantity = 1) => {
    let orderDetailItem = await Orderdetail.findOne({ order: order, products: products });

    if (!orderDetailItem) {
        throw new Error("Sản phẩm không tồn tại trong giỏ hàng.");
    }

    // Giảm số lượng, nhưng không cho nhỏ hơn 1 (hoặc có thể xóa luôn nếu về 0, tùy yêu cầu)
    if (orderDetailItem.quantity >= 1) {
        orderDetailItem.quantity = Math.max(orderDetailItem.quantity - quantity, 0);
        await orderDetailItem.save();

        // Gửi thông báo qua socket khi giảm số lượng
        notifyOrderDetailChanged(io, order, 'updated', { orderDetail: orderDetailItem });

        // Cập nhật tổng đơn hàng
        notifyOrderTotalUpdated(io, order, { total: await calculateOrderTotal(order) });
    }

    return orderDetailItem;
};

// Hàm tính tổng đơn hàng (cần tùy chỉnh theo yêu cầu)
const calculateOrderTotal = async (orderID) => {
    let orderDetails = await Orderdetail.find({ order: orderID }).populate('products');
    let total = 0;
    orderDetails.forEach(detail => {
        total += detail.quantity * detail.products.price; // Giả sử mỗi sản phẩm có trường 'price'
    });
    return total;
};

module.exports = {
    increaseOrderQuantity,
    decreaseOrderQuantity,
};

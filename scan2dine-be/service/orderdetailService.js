// services/cartService.js
const {Orderdetail, Order, Product } = require('../model/model');

// Hàm tăng số lượng
const increaseOrderQuantity = async (orderID, productID, quantity = 1, note='') => {
    let orderDetailItem = await Orderdetail.findOne({ order: orderID, products: productID });
    console.log(orderDetailItem);
    if (orderDetailItem) {
        orderDetailItem.quantity += quantity; // Tăng số lượng
        // Gộp note mới nếu có truyền vào
        if (note) {
            orderDetailItem.note = note;
        }
        await orderDetailItem.save();
        return { updated: true, detail: orderDetailItem };
    } else {
        // Nếu chưa có sản phẩm, tạo mới
        const newItem = new Orderdetail({
            order:orderID,
            products: productID,
            quantity: quantity,
            note: note,
        });
        await newItem.save();
        return { updated: false, detail: newItem };
    }
};

// Hàm giảm số lượng
const decreaseOrderQuantity = async (order, products, quantity = 1) => {
    let orderDetailItem = await Orderdetail.findOne({ order: order, products: products });

    if (!orderDetailItem) {
        throw new Error("Sản phẩm không tồn tại trong giỏ hàng.");
    }

    // Giảm số lượng, nhưng không cho nhỏ hơn 1 (hoặc có thể xóa luôn nếu về 0, tùy yêu cầu)
    if(orderDetailItem.quantity >= 1){
        orderDetailItem.quantity = Math.max(orderDetailItem.quantity - quantity, 0);
    await orderDetailItem.save();
    }
    
    return orderDetailItem;
    
};
module.exports = {
    increaseOrderQuantity,
    decreaseOrderQuantity
};

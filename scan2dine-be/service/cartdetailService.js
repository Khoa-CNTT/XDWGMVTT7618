// services/cartService.js
const {CartDetail, Cart} = require('../model/model');

// Hàm tăng số lượng
const increaseCartQuantity = async (cartID, productID, quantity = 1, note) => {
    let cartDetailItem = await CartDetail.findOne({ cart: cartID, products: productID });
    console.log(cartDetailItem);
    if (cartDetailItem) {
        cartDetailItem.quantity += quantity; // Tăng số lượng
        await cartDetailItem.save();
        return { updated: true, detail: cartDetailItem };
    } else {
        // Nếu chưa có sản phẩm, tạo mới
        const newItem = new CartDetail({
            cart:cartID,
            products: productID,
            quantity: quantity, 
            note: note
        });
        await newItem.save();
        return { updated: false, detail: newItem };
    }
};

// Hàm giảm số lượng
const decreaseCartQuantity = async (cart, products, quantity = 1) => {
    let cartDetailItem = await CartDetail.findOne({ cart: cart, products: products });

    if (!cartDetailItem) {
        throw new Error("Sản phẩm không tồn tại trong giỏ hàng.");
    }

    // Giảm số lượng, nhưng không cho nhỏ hơn 1 (hoặc có thể xóa luôn nếu về 0, tùy yêu cầu)
    if(cartDetailItem.quantity >= 1){
    cartDetailItem.quantity = Math.max(cartDetailItem.quantity - quantity, 0);
    await cartDetailItem.save();
    }
    
    return cartDetailItem;
};


const calculateCartdetail = async (cartDetailID) => {
    try {
        const cartDetail = await CartDetail.findById(cartDetailID).populate('products', 'price');

        if (!cartDetail || !cartDetail.products) {
            throw new Error('Không tìm thấy CartDetail hoặc sản phẩm');
        }

        const price = parseFloat(cartDetail.products.price || 0);
        const quantity = cartDetail.quantity || 0;
        const total = price * quantity;

        return {
            product: cartDetail.products._id,
            quantity,
            unitPrice: price,
            totalPrice: total
        };
    } catch (error) {
        console.error('Lỗi khi tính tiền sản phẩm:', error.message);
        throw error;
    };

};
// (Tùy chọn) Hàm hỗ trợ phát Socket.IO từ service (nếu cần)
// const emitCartDetailUpdate = async (io, cartID, event, data) => {
//     if (io && cartID) {
//         io.to(`cart_${cartID}`).emit(event, data);
//     }
// }; 
module.exports = {
    increaseCartQuantity,
    decreaseCartQuantity,
    calculateCartdetail,
};

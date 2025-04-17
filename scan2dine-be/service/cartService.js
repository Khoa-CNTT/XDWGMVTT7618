// services/cartService.js
const {CartDetail, Cart} = require('../model/model');

// Hàm tăng số lượng
const increaseCartQuantity = async (cartID, productID, quantity = 1) => {
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
            quantity: quantity
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

module.exports = {
    increaseCartQuantity,
    decreaseCartQuantity
};

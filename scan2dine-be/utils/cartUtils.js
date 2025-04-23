// utils/cartUtils.js

const {Cart,CartDetail, Product} = require('../model/model');

const deleteCartDetailsByCartId = async (cartId) => {
            try {
            const cart = await Cart.findById(cartId);

            if (!cart) {
                throw new Error("Cart not found");
            }

            // Lấy danh sách CartDetail liên quan tới cart
            const relatedCartDetails = await CartDetail.find({ cart: cart._id });
            const cartDetailIds = relatedCartDetails.map(cd => cd._id);

            // Xoá các CartDetail liên quan đến cart
            await CartDetail.deleteMany({ cart: cart._id });

            // Gỡ CartDetail khỏi Product
            await Product.updateMany(
                { cartdetail: { $in: cartDetailIds } },
                { $pull: { cartdetail: { $in: cartDetailIds } } }
            );

            // Xoá mảng cartdetail trong Cart nếu có
            await Cart.findByIdAndUpdate(cart._id, {
                $set: { cartdetail: [] }
            });

            return cartDetailIds;

        } catch (error) {
            console.error("Error in deleteCartdetail:", error);
            throw error; 
            // return res.status(500).json({ message: "Server error", error: error.message || error });
        }
};

module.exports = { deleteCartDetailsByCartId };

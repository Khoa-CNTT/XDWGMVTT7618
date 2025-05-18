const { Cart, Customer} = require('../model/model');
const { creatCart } = require('../service/cartService');
const { deleteCartDetailsByCartId } = require('../utils/cartUtils');
const { createOrderFromCartService } = require('../service/orderService');
const cartController = {
    // add a cart
    addCart: async (req, res) => {
        try {
            const newCart = await creatCart(req.body);
            // req.body.customer: laays id cua customer
            if (req.body.customer) {
                const customer = await Customer.findById(req.body.customer);
                await customer.updateOne({
                    $push: {
                        cart: saveCart._id
                    }
                })
            };
            return res.status(200).json(newCart);
        } catch (error) {
            console.error("Error in:", error);
            return res.status(500).json({ message: "Server error", error: error.message || error });
        }
    },
    // get cart
    getCart: async (req, res) => {
        try {
            const cart = await Cart.find().populate({ path: "customer", select: "name" });
            return res.status(200).json(cart);
        } catch (error) {
            return res.status(500).json(error);
        }
    },

    //delete all cartdetail theo id của giỏ hàng
    deleteCartdetail: async (req, res) => {
        try {
            const deletedIds = await deleteCartDetailsByCartId(req.params.id);
            return res.status(200).json({
                message: "CartDetails deleted successfully",
                deletedCartDetailIds: deletedIds
            });
        } catch (error) {
            console.error("Error in deleteCartdetail:", error);
            return res.status(500).json({ message: "Server error", error: error.message });
        }
    },
    getAcart: async (req, res) => {
        try {
            const cart = await Cart.findById(req.params.id)
                .populate({
                    path: "cartdetail",
                    select: "quantity products",
                    populate: {
                        path: "products",
                        select: "pd_name price "
                    }
                });
            if (!cart) {
                return res.status(404).json({ message: "Cart not found" });
            }

            res.status(200).json(cart);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    deleteCart: async (req, res) => {
        try {
            const deleteCart = await Cart.findByIdAndDelete(req.params.id);
            if (!deleteCart) {
                return res.status(404).json({ message: "not found" });
            }

            // Gỡ liên kết với Customer
            if (deleteCart.customer) {
                await Customer.findByIdAndUpdate(deleteCart.customer, {
                    $pull: { cart: deleteCart._id },
                });
            }


            return res.status(200).json({ message: "Cart deleted successfully", delete: deleteCart });
        } catch (error) {
            console.error("Error in deleteCart:", error);
            return res.status(500).json({ message: "Server error", error: error.message || error });
        }
    },
    createOrderFromCart: async (req, res) => {
        try {
            const { cart, table } = req.body;
            
            const result = await createOrderFromCartService(cart, table);
            res.status(201).json(result);
        } catch (error) {
            console.error('Lỗi khi xử lý đơn hàng từ giỏ:', error);
            res.status(500).json({ message: error.message || 'Lỗi server' });
        }
    }

}
module.exports = cartController;
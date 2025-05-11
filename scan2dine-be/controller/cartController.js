const { Cart, Customer } = require('../model/model');
const { creatCart } = require('../service/cartService');
const { deleteCartDetailsByCartId } = require('../utils/cartUtils');
const { createOrderFromCartService } = require('../service/orderService');
const { notifyCartAdded, notifyCartDetailsDeleted, notifyCartDeleted } = require('../utils/socketUtils');

const cartController = {
    // Add a cart
    addCart: async (req, res) => {
        try {
            const newCart = await creatCart(req.body);
            // Liên kết giỏ hàng với customer nếu có customerId
            if (req.body.customer) {
                const customer = await Customer.findById(req.body.customer);
                if (!customer) {
                    return res.status(404).json({ message: 'Customer not found' });
                }
                await customer.updateOne({
                    $push: {
                        cart: newCart._id // Sửa từ saveCart thành newCart
                    }
                });
            }
            const io = req.app.get('io'); // Lấy io từ app
            if (!io) {
                console.error('Socket.IO is not initialized');
                return res.status(500).json({ message: 'Socket.IO not available' });
            }
            notifyCartAdded(io, newCart._id, {
                cartId: newCart._id,
                customerId: req.body.customer,
                message: 'Giỏ hàng mới đã được thêm',
            });
            return res.status(200).json(newCart);
        } catch (error) {
            console.error('Error in addCart:', error);
            return res.status(500).json({ message: 'Server error', error: error.message || error });
        }
    },

    // Get all carts
    getCart: async (req, res) => {
        try {
            const carts = await Cart.find().populate({ path: 'customer', select: 'name' });
            return res.status(200).json(carts);
        } catch (error) {
            console.error('Error in getCart:', error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    // Delete all cart details by cart ID
    deleteCartdetail: async (req, res) => {
        try {
            const io = req.app.get('io'); // Lấy io từ app
            if (!io) {
                console.error('Socket.IO is not initialized');
                return res.status(500).json({ message: 'Socket.IO not available' });
            }
            const deletedIds = await deleteCartDetailsByCartId(req.params.id);
            if (!deletedIds || deletedIds.length === 0) {
                return res.status(404).json({ message: 'No cart details found to delete' });
            }
            notifyCartDetailsDeleted(io, req.params.id, {
                cartId: req.params.id,
                deletedCartDetailIds: deletedIds,
                message: 'Chi tiết giỏ hàng đã bị xóa',
            });
            return res.status(200).json({
                message: 'CartDetails deleted successfully',
                deletedCartDetailIds: deletedIds
            });
        } catch (error) {
            console.error('Error in deleteCartdetail:', error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    // Get a single cart by ID
    getAcart: async (req, res) => {
        try {
            const cart = await Cart.findById(req.params.id).populate({
                path: 'cartdetail',
                select: 'quantity products',
                populate: {
                    path: 'products',
                    select: 'pd_name price'
                }
            });
            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }
            return res.status(200).json(cart);
        } catch (error) {
            console.error('Error in getAcart:', error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    // Delete a cart by ID
    deleteCart: async (req, res) => {
        try {
            const deletedCart = await Cart.findByIdAndDelete(req.params.id);
            if (!deletedCart) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            // Gỡ liên kết với Customer
            if (deletedCart.customer) {
                await Customer.findByIdAndUpdate(deletedCart.customer, {
                    $pull: { cart: deletedCart._id }
                });
            }

            const io = req.app.get('io');
            if (!io) {
                console.error('Socket.IO is not initialized');
                return res.status(500).json({ message: 'Socket.IO not available' });
            }
            notifyCartDeleted(io, deletedCart._id, {
                cartId: deletedCart._id,
                customerId: deletedCart.customer,
                message: 'Giỏ hàng đã bị xóa',
            });

            return res.status(200).json({ message: 'Cart deleted successfully', deletedCart });
        } catch (error) {
            console.error('Error in deleteCart:', error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    // Create order from cart
    createOrderFromCart: async (req, res) => {
        try {
            const { cart, table } = req.body;
            const io = req.app.get('io'); // Lấy io từ app
            if (!io) {
                console.error('Socket.IO is not initialized');
                return res.status(500).json({ message: 'Socket.IO not available' });
            }
            const result = await createOrderFromCartService(cart, table, io);
            return res.status(201).json(result);
        } catch (error) {
            console.error('Error in createOrderFromCart:', error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
};

module.exports = cartController;
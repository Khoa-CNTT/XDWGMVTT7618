const { Cart, Customer, Table, CartDetail, Orderdetail, Order, Product } = require('../model/model');
const { creatCart } = require('../service/cartService');
const { deleteCartDetailsByCartId } = require('../utils/cartUtils');
const moment = require('moment');
const { mergeDuplicateOrderDetails } = require('../utils/orderUtils');
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

    createOrderFromCart: async (req, res) => {
        try {
            const { cart, table } = req.body;


            const cartID = await Cart.findById(cart);
            if (!cartID) return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });

            const customerId = cartID.customer;
            const cartDetails = await CartDetail.find({ cart: cartID._id }).populate('products');
            if (cartDetails.length === 0) return res.status(400).json({ message: 'Giỏ hàng trống!' });

            let existingOrder = await Order.findOne({
                customer: customerId,
                od_status: '2'
            });

            if (!existingOrder) {
                existingOrder = new Order({
                    customer: customerId,
                    table: table,
                    od_status: '2'
                });
                await existingOrder.save();
                await Table.findByIdAndUpdate(table, { $push: { order: existingOrder._id } });
                await Customer.findByIdAndUpdate(customerId, { $push: { order: existingOrder._id } });
            }

            const orderDetails = [];

            for (const item of cartDetails) {
                const existingDetail = await Orderdetail.findOne({
                    order: existingOrder._id,
                    products: item.products._id,
                    status: '1'
                });

                if (existingDetail) {
                    existingDetail.quantity += item.quantity;
                    await existingDetail.save();
                    orderDetails.push(existingDetail);
                } else {
                    const newDetail = await Orderdetail.create({
                        order: existingOrder._id,
                        products: item.products._id,
                        quantity: item.quantity,
                        status: '1'
                    });
                    orderDetails.push(newDetail);
                    await Product.findByIdAndUpdate(item.products._id, {
                        $push: { orderdetail: newDetail._id }
                    });
                    existingOrder.orderdetail.push(newDetail._id);
                }
            }

            await existingOrder.save();

            // Gọi mergeDuplicateOrderDetails để dọn sạch các OrderDetail trùng lặp
            await mergeDuplicateOrderDetails(existingOrder._id);

            // Xoá cart detail sau khi xử lý xong
            await deleteCartDetailsByCartId(cartID._id);

            const populatedOrder = await Order.findById(existingOrder._id)
                .populate('customer', 'name phone')
                .populate('table', 'tb_number');

            const orderItemsToReturn = orderDetails.map(item => ({
                product: item.products,
                status:item.status,
                quantity: item.quantity
            }));

            const formattedCreatedAt = moment(populatedOrder.createdAt).format('DD/MM/YYYY HH:mm:ss');

            res.status(201).json({
                message: 'Đơn hàng đã được xử lý thành công!',
                order: {
                    _id: populatedOrder._id,
                    customer: populatedOrder.customer,
                    table: populatedOrder.table,
                    orderdetail: orderItemsToReturn,
                    status: populatedOrder.od_status,
                    createdAt: formattedCreatedAt
                }
            });

        } catch (error) {
            console.error('Lỗi khi xử lý đơn hàng từ giỏ:', error);
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }

}
module.exports = cartController;
const { Cart, Customer, Table, CartDetail, Orderdetail, Order, Product } = require('../model/model');
const { creatCart } = require('../service/cartService');
const { deleteCartDetailsByCartId } = require('../utils/cartUtils');

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
            console.log('req.body:', req.body);

            // Tìm giỏ hàng bằng ID
            const cartID = await Cart.findById(cart);
            if (!cartID) return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });

            const customerId = cartID.customer;  // Sử dụng cartID.customer để lấy customer

            // Lấy các chi tiết giỏ hàng
            const cartDetails = await CartDetail.find({ cart: cartID._id }).populate('products');
            if (cartDetails.length === 0) {
                return res.status(400).json({ message: 'Giỏ hàng trống!' });
            }

            // Tạo đơn hàng
            const newOrder = new Order({
                customer: customerId,
                table: table,
                status: 'pending'
            });
            await newOrder.save();

            // Tạo chi tiết đơn hàng từ giỏ hàng
            const orderDetailDocs = cartDetails.map(item => ({
                order: newOrder._id,  // Liên kết OrderDetail với Order
                products: item.products._id,  // Sử dụng item.products._id
                quantity: item.quantity,
                status: 'pending'
            }));
            const orderDetails = await Orderdetail.insertMany(orderDetailDocs);

            // Cập nhật lại trường orderdetail trong Order để lưu các ID của OrderDetail
            newOrder.orderdetail = orderDetails.map(od => od._id);
            await newOrder.save();  // Lưu lại đơn hàng với các orderdetail

            // Cập nhật mảng orders trong Table
            await Table.findByIdAndUpdate(table, {
                $push: { order: newOrder._id }  // Thêm ID của Order vào mảng order trong Table
            });

            // Cập nhật orderDetails vào trong sản phẩm
            for (let item of orderDetails) {
                await Product.findByIdAndUpdate(item.products, {
                    $push: { orderdetail: item._id }  // Thêm ID của OrderDetail vào mảng orderdetails của sản phẩm
                });
            }
            // Cập nhật mảng orders trong Customer
            await Customer.findByIdAndUpdate(customerId, {
                $push: { order: newOrder._id } 
            });
            // Tạo mảng orderdetail để trả về
            const orderItemsToReturn = cartDetails.map(item => ({
                product: item.products._id,  // Sử dụng item.products._id
                name: item.products.name,    // item.products.name
                price: item.products.price,  // item.products.price
                quantity: item.quantity,
                total: item.products.price * item.quantity
            }));

            // Xóa các chi tiết giỏ hàng đã xử lý
            await deleteCartDetailsByCartId(cartID._id);

            res.status(201).json({
                message: 'Đơn hàng đã được tạo thành công!',
                order: {
                    _id: newOrder._id,
                    customer: newOrder.customer,
                    table: newOrder.table,
                    orderdetail: orderItemsToReturn,  // Trả về orderdetail
                    status: newOrder.status,
                    createdAt: newOrder.createdAt
                }
            });

        } catch (error) {
            console.error('Lỗi khi xác nhận giỏ hàng:', error);
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }

}
module.exports = cartController;
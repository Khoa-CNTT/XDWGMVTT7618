const { Order, Customer, Table, Orderdetail } = require('../model/model');
const { confirmAllPendingOrderDetails } = require('../service/orderService');
const orderController = {
    // ADD ORDER
    addOrder: async (req, res) => {
        try {
            const newOrder = new Order(req.body);
            const saveOrder = await newOrder.save();

            // Update customer
            if (req.body.customer) {
                await Customer.findByIdAndUpdate(req.body.customer, {
                    $push: { order: saveOrder._id }
                });
            }

            // Update table
            if (req.body.table) {
                await Table.findByIdAndUpdate(req.body.table, {
                    $push: { order: saveOrder._id }
                });
            }

            return res.status(200).json(saveOrder);
        } catch (error) {
            console.error("Error in addOrder:", error);
            return res.status(500).json({ message: "Server error", error: error.message || error });
        }
    },
    // GET OERDER
    getOrder: async (req, res) => {
        try {
            const getOrder = await Order.find().populate({ path: 'customer', select: 'name' });

            return res.status(200).json(getOrder);
        } catch (error) {
            console.error("Error in DELETEREVIEW:", error);
            return res.status(500).json({ message: "Server error", error: error.message || error });
        }
    },
    // GET ORDER BY ID
    getAorder: async (req, res) => {
        try {
            const getAorder = await Order.findById(req.params.id).select('total_amount od_status')
                .populate({
                    path: "orderdetail",
                    select: "quantity products status total",
                    populate: {
                        path: "products",
                        select: "pd_name price stall image",
                        populate: {
                            path: "stall",
                            select: "stall_name"
                        }
                    }
                })
                .populate({
                    path: "customer",
                    select: "name phone"
                })
                .populate({
                    path: "table",
                    select: "tb_number status"
                });
            if (!getAorder) {
                return res.status(404).json('not found');
            };
            console.log(getAorder);
            return res.status(200).json(getAorder);
        } catch (error) {
            console.error("Error in DELETEREVIEW:", error);
            return res.status(500).json({ message: "Server error", error: error.message || error });
        }
    },
    // UPDATE ORDER
    updateOrder: async (req, res) => {
        try {
            const orderID = await Order.findById(req.params.id);
            if (!orderID) {
                return res.status(404).json('not found')
            }
            // kiểm tra id order có trong customer không
            if (req.body.customer && req.body.customer !== orderID.customer?.toString()) {
                if (orderID.customer) {
                    // xoá order cũ khỏi customer
                    await Customer.findByIdAndUpdate(orderID.customer,
                        {
                            $pull: {
                                order: orderID._id
                            }
                        }
                    )
                }
                // thêm order mới vào customer
                await Customer.findByIdAndUpdate(req.body.customer, {
                    $push: {
                        order: orderID._id
                    }
                })
            };
            // kiểm tra id order có trong table không
            if (req.body.table && req.body.table !== orderID.table?.toString()) {
                if (orderID.table) {
                    // xoá order cũ khỏi table
                    await Table.findByIdAndUpdate(orderID.table, {
                        $pull: {
                            order: orderID._id
                        }
                    })
                }
            }
            // thêm order mới vào table
            await Table.findByIdAndUpdate(req.body.table, {
                $addToSet: {
                    order: orderID._id
                }
            });
            const updateOrder = await Order.findByIdAndUpdate(req.params.id, {
                $set: req.body
            }, { new: true });
            return res.status(200).json({ message: "Update order successfully", updateOrder });
        } catch (error) {
            console.error("Error in DELETEREVIEW:", error);
            return res.status(500).json({ message: "Server error", error: error.message || error });
        }
    },
    // DELETE ORDER
    deleteOrder: async (req, res) => {
        try {
            const deleteOrder = await Order.findByIdAndDelete(req.params.id);

            if (!deleteOrder) {
                return res.status(404).json('not found');
            }
            await Orderdetail.deleteMany({ _id: { $in: deleteOrder.orderdetail } });

            await Customer.findByIdAndUpdate(deleteOrder.customer, {
                $pull: {
                    order: deleteOrder._id
                }
            });;
            await Table.findOneAndUpdate(deleteOrder.table, {
                $pull: {
                    order: deleteOrder._id
                }
            });

            return res.status(200).json({ message: "Delete order successfully", deleteOrder });
        } catch (error) {
            console.error("Error in DELETEREVIEW:", error);
            return res.status(500).json({ message: "Server error", error: error.message || error });
        }
    },
    confirmOrder: async (req, res) => {
        try {
            // câpj nhật trạng thái của tất cả các OrderDetail trong Order
            const result = await confirmAllPendingOrderDetails(req.params.id);
            // cập nhật trang thái của order 
            await Order.findByIdAndUpdate(req.params.id, {
                $set: {
                    od_status: '2'
                }
            });
            // cập nhật trạng thái của table
            await Table.findByIdAndUpdate(result.order.table, {
                $set: {
                    status: '2' //chổ này là 2 thay vì '3' vì lúc này mình xác nhận 
                }
            })
            // Lấy lại đơn hàng sau khi cập nhật để gửi về client
            const updatedOrder = await Order.findById(req.params.id)
                .populate('customer', 'name phone')
                .populate('table', 'tb_number status') // lấy luôn trạng thái bàn
                .populate({
                    path: 'orderdetail',
                    populate: { path: 'products', select: 'pd_name price' }
                });

            // Trả về thông tin chi tiết đã được cập nhật
            res.status(200).json({
                message: 'Xác nhận món thành công',
                order: {
                    _id: updatedOrder._id,
                    customer: updatedOrder.customer,
                    table: updatedOrder.table,
                    status: updatedOrder.od_status,
                    orderdetail: updatedOrder.orderdetail,
                    updatedAt: updatedOrder.updatedAt
                }
            });
        } catch (err) {
            console.error('Error confirming all OrderDetails:', err);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = orderController;
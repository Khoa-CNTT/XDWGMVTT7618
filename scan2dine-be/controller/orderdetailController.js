const { Orderdetail, Order, Product } = require('../model/model');
const { increaseOrderQuantity, decreaseOrderQuantity } = require('../service/orderdetailService');
const { updateOrderDetailStatus } = require('../utils/orderDetailUtils');
const { notifyOrderDetailChanged } = require('../utils/socketUtils');
const orderdetailCOntroller = {
    // ADD OERDER DETAIL
    addOrderdetail: async (req, res) => {
        try {
            const { order, products, quantity } = req.body;
            const upProduttoorderdetail = await increaseOrderQuantity(order, products, quantity || 1);
            // thêm id order detail vào product
            if (req.body.products) {
                const productID = await Product.findById(req.body.products);
                await productID.updateOne({
                    $addToSet: {
                        orderdetail: upProduttoorderdetail.detail._id
                    }
                })
            };
            // thêm id order detail vào order
            if (req.body.order) {
                const orderID = await Order.findById(req.body.order);
                await orderID.updateOne({
                    $addToSet: {
                        orderdetail: upProduttoorderdetail.detail._id
                    }
                })
            }
            const io = req.app.get('io'); // Lấy io từ app
            notifyOrderDetailChanged(io, order, 'added',{
                orderId: order,
                detailId: upProduttoorderdetail.detail._id,
                message: upProduttoorderdetail.updated ? 'Tăng số lượng sản phẩm' : 'Thêm sản phẩm mới',
            });
            return res.status(200).json({
                message: upProduttoorderdetail.updated ? "Tăng số lượng sản phẩm trong đơn hàng " : "Thêm sản phẩm vào đơn hàng ",
                order: upProduttoorderdetail
            });
        } catch (error) {
            console.error("Error in DELETEREVIEW:", error);
            return res.status(500).json({ message: "Server error", error: error.message || error });
        }

    },

    // GET ORDERDETAIL 
    getOrderdetail: async (req, res) => {
        try {
            const getOrderdetail = await Orderdetail.find().select("quantity products status order total") // lấy quantity và products
                .populate({
                    path: "products",
                    select: "pd_name price stall_id",
                    populate: {
                        path: "stall_id",
                        select: "stall_name" // chỉ lấy tên quầy hàng
                    }
                });
            console.log("OrderDetail:", getOrderdetail);
            if (getOrderdetail.length <= 0) return "không có order detail"
            return res.status(200).json(getOrderdetail);

        } catch (error) {
            console.error("Error in DELETEREVIEW:", error);
            return res.status(500).json({ message: "Server error", error: error.message || error });
        }
    },
    // DELETE ORDER DETAIL 
    deleteOrderdetail: async (req, res) => {
        try {
            const deleteOrderdetail = await Orderdetail.findByIdAndDelete(req.params.id);

            if (!deleteOrderdetail) {
                res.status(404).json('not found')
            }
            // xóa order detail khỏi product 
            await Product.findByIdAndUpdate(deleteOrderdetail.products,
                {
                    $pull: {
                        orderdetail: deleteOrderdetail._id
                    }
                }
            )

            await Order.findByIdAndUpdate(deleteOrderdetail.order,
                {
                    $pull: {
                        orderdetail: deleteOrderdetail._id
                    }
                }
            );
            const io = req.app.get('io');
            notifyOrderDetailChanged(io, deleteOrderdetail.order, 'deleted',{
                orderId: deleteOrderdetail.order,
                detailId: deleteOrderdetail._id,
                message: 'Chi tiết đơn hàng đã bị xóa',
            });
            res.status(200).json({ message: "Delete successfully", delete: deleteOrderdetail });
        } catch (error) {
            console.error("Error in DELETEREVIEW:", error);
            res.status(500).json({ message: "Server error", error: error.message || error });
        }

    },
    updateOrderdetial: async (req, res) => {
        try {
            const orderdetailID = await Orderdetail.findById(req.params.id);
            if (!orderdetailID) {
                res.status(404).json('not found')
            }
            // kiểm tra id orderdetail có trong order không
            if (req.body.order && req.body.order !== orderdetailID.order?.toString()) {
                if (orderdetailID.order) {
                    // xoá orderdetail cũ khỏi order
                    await Order.findByIdAndUpdate(orderdetailID.order, {
                        $pull: {
                            orderdetail: orderdetailID._id
                        }
                    })
                }
                // thêm order detail mới vào order
                await Order.findByIdAndUpdate(req.body.order, {
                    $push: {
                        orderdetail: orderdetailID._id
                    }
                })
            };
            // kiểm tra id orderdetail có trong product không
            if (req.body.products && req.body.products !== orderdetailID.products?.toString()) {
                if (orderdetailID.products) {
                    // xoá orderdetail cũ khỏi product
                    await Product.findByIdAndUpdate(orderdetailID.products,
                        {
                            $pull: {
                                orderdetail: orderdetailID._id
                            }
                        }
                    )
                }
                await Product.findByIdAndUpdate(req.body.products,
                    {
                        $push: {
                            orderdetail: orderdetailID._id
                        }
                    }
                )
            };
            const updateOrderdetial = await Orderdetail.findByIdAndUpdate(req.params.id, req.body, {
                new: true
            })
            const io = req.app.get('io');
            notifyOrderDetailChanged(io, updateOrderdetial.order, 'updated',{
                orderId: updateOrderDetial.order,
                detailId: updateOrderDetial._id,
                message: 'Thông tin chi tiết đơn hàng đã được cập nhật',
            });
            res.status(200).json({ message: "Update successfully", update: updateOrderdetial });
        } catch (error) {
            console.error("Error in DELETEREVIEW:", error);
            res.status(500).json({ message: "Server error", error: error.message || error });
        }
    },
    // quyền làm
    updateOrderDetail : async (req, res) => {
        try {
            const { id } = req.params; // lấy _id của orderdetail từ URL
            const { quantity, status, note, total } = req.body;

            const updatedOrderDetail = await Orderdetail.findByIdAndUpdate(
                id,
                {
                    ...(quantity !== undefined && { quantity }),
                    ...(status !== undefined && { status }),
                    ...(note !== undefined && { note }),
                    ...(total !== undefined && { total }),
                },
                { new: true }
            );

            if (!updatedOrderDetail) {
                return res.status(404).json({ message: "Không tìm thấy chi tiết đơn hàng." });
            }

            res.status(200).json({ message: "Cập nhật thành công", data: updatedOrderDetail });
        } catch (error) {
            console.error("Lỗi cập nhật chi tiết đơn hàng:", error);
            res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
        }
    },
    downQuantity: async (req, res) => {
        try {
            const { order, products, quantity } = req.body;

            if (!order || !products) {
                return res.status(400).json({ message: "Thiếu cartID hoặc productsId" });
            }

            const downQuantity = await decreaseOrderQuantity(order, products, quantity || 1);
            const io = req.app.get('io');
            // Nếu số lượng về 0 thì xoá luôn CartDetail và xoá liên kết
            if (downQuantity.quantity === 0) {
                await Orderdetail.findByIdAndDelete(downQuantity._id);
                await Order.findByIdAndUpdate(order, { $pull: { orderdetail: downQuantity._id } });
                await Product.findByIdAndUpdate(products, { $pull: { orderdetail: downQuantity._id } });
                notifyOrderDetailChanged(io, order,'deleted' ,{
                    orderId: order,
                    detailId: downQuantity._id,
                    message: 'Sản phẩm đã bị xóa khỏi đơn hàng',
                });
                return res.status(200).json({
                    message: "Sản phẩm đã bị xoá khỏi giỏ hàng",
                    detail: downQuantity
                });
            }

            // Nếu vẫn còn quantity > 0
            res.status(200).json({
                message: "Giảm số lượng sản phẩm trong đơn hàng",
                detail: downQuantity
            });

        } catch (error) {
            console.error("Error in downQuantity:", error);
            res.status(500).json({ message: "Server error", error: error.message || error });
        }
    },

    updateOrderdetailStatus: async (req, res) => {
        try {
            const { orderdetail } = req.params;
            const { order, newStatus } = req.body;
            const updateStatus = await updateOrderDetailStatus(order, orderdetail, newStatus);
            const io = req.app.get('io')
            notifyOrderDetailChanged(io, order,'updated',{
                orderId: order,
                detailId: orderdetail,
                newStatus,
                message: 'Trạng thái chi tiết đơn hàng đã được cập nhật',
            });
            return res.status(200).json({
                message: "Cập nhật trạng thái thành công",
                detail: updateStatus
            });
        } catch (error) {
            console.error("Error in downQuantity:", error);
            return res.status(500).json({ message: "Server error", error: error.message || error });
        }
    },
    // confirm orderdetail with status xác nhận -> đang chuẩn bị 
    confirmStatus3: async (req, res) => {
        try {
            const { orderdetail } = req.params;
            const { order, newStatus = "3" } = req.body;

            if (!order || !orderdetail) {
                return res.status(400).json({ message: "Thiếu order hoặc orderdetail" });
            }

            const confirmStatus = await updateOrderDetailStatus(order, orderdetail, newStatus);

            if (!confirmStatus) {
                return res.status(404).json({ message: "Không tìm thấy orderdetail để cập nhật" });
            }

            const io = req.app.get('io');
            notifyOrderDetailChanged(io, order,"updated", {
                orderId: order,
                detailId: orderdetail,
                newStatus,
                message: 'Trạng thái chi tiết đơn hàng đã được cập nhật thành "Đang chuẩn bị"',
            });
            return res.status(200).json({
                message: "Cập nhật trạng thái thành công",
                detail: confirmStatus
            });

        } catch (error) {
            console.error("Error in confirmStatus3:", error);
            return res.status(500).json({ message: "Server error", error: error.message || error });
        }
    },
    confirmStatusComplete: async (req, res) => {
        try {
            const { orderdetail } = req.params;
            const { order, newStatus = "4" } = req.body;

            if (!order || !orderdetail) {
                return res.status(400).json({ message: "Thiếu order hoặc orderdetail" });
            }

            const confirmStatus = await updateOrderDetailStatus(order, orderdetail, newStatus);

            if (!confirmStatus) {
                return res.status(404).json({ message: "Không tìm thấy orderdetail để cập nhật" });
            }

            const io = req.app.get('io');
            notifyOrderDetailChanged(io, order,"updated", {
                orderId: order,
                detailId: orderdetail,
                newStatus,
                message: 'Trạng thái chi tiết đơn hàng đã được cập nhật thành "Hoàn thành"',
            });
            return res.status(200).json({
                message: "Cập nhật trạng thái 'Hoàn thành' thành công",
                detail: confirmStatus
            });

        } catch (error) {
            console.error("Error in confirmStatus3:", error);
            return res.status(500).json({ message: "Server error", error: error.message || error });
        }
    }
}

module.exports = orderdetailCOntroller;
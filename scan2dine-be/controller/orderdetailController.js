const { Orderdetail, Order, Product } = require('../model/model');
const { increaseOrderQuantity, decreaseOrderQuantity } = require('../service/orderdetailService');
const { updateOrderDetailStatus } = require('../utils/orderDetailUtils');
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
            const updateOrderdetial = await OrderDetail.findByIdAndUpdate(req.params.id, req.body, {
                new: true
            })
            res.status(200).json({ message: "Update successfully", update: updateOrderdetial });
        } catch (error) {
            console.error("Error in DELETEREVIEW:", error);
            res.status(500).json({ message: "Server error", error: error.message || error });
        }
    },
    downQuantity: async (req, res) => {
        try {
            const { order, products, quantity } = req.body;

            if (!order || !products) {
                return res.status(400).json({ message: "Thiếu cartID hoặc productsId" });
            }

            const downQuantity = await decreaseOrderQuantity(order, products, quantity || 1);

            // Nếu số lượng về 0 thì xoá luôn CartDetail và xoá liên kết
            if (downQuantity.quantity === 0) {
                await OrderDetail.findByIdAndDelete(downQuantity._id);
                await Order.findByIdAndUpdate(order, { $pull: { orderdetail: downQuantity._id } });
                await Product.findByIdAndUpdate(products, { $pull: { orderdetail: downQuantity._id } });

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
            const {orderdetail } = req.params;
            const { order, newStatus } = req.body;
            const updateStatus = await updateOrderDetailStatus(order, orderdetail, newStatus);
            return res.status(200).json({
                message: "Cập nhật trạng thái thành công",
                detail: updateStatus
            });
        } catch (error) {
            console.error("Error in downQuantity:", error);
            return res.status(500).json({ message: "Server error", error: error.message || error });
        }
    }
}

module.exports = orderdetailCOntroller;
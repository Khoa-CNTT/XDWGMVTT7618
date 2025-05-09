const { Order, Table } = require('../model/model');

const tableController = {
    // add table
    addTable: async (req, res) => {
        try {
            const tables = await Table.find().sort({ tb_number: 1 }); // Lấy tất cả bàn, sắp theo số tăng dần

            let nextTableNumber = 1;

            for (let i = 0; i < tables.length; i++) {
                if (tables[i].tb_number !== i + 1) {
                    nextTableNumber = i + 1;
                    break;
                }
                nextTableNumber = tables.length + 1; // Không thiếu số nào
            }

            const newTable = new Table({
                ...req.body,
                tb_number: nextTableNumber,
            });

            const saved = await newTable.save();

            return res.status(200).json({
                ...saved.toObject(),
                name: `Bàn ${saved.tb_number}`
            });
        } catch (error) {
            console.error("Error in addTable:", error);
            return res.status(500).json({ message: "Server error", error: error.message });
        }
    },


    // get all table
    getTable: async (req, res) => {
        try {
            const tables = await Table.find().sort({ tb_number: 1 });
            const result = tables.map(t => ({
                ...t.toObject(),
                name: `Bàn ${t.tb_number}`
            }));
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ message: "Server error", error: error.message });
        }
    },
    // delete table
    deleteTable: async (req, res) => {
        try {
            const table = await Table.findByIdAndDelete(req.params.id);
            if (!table) {
                return res.status(404).json("Table not found");
            }
            return res.status(200).json({ message: "Table has been deleted successfully", delete: deleteTable });
        } catch (error) {
            return res.status(500).json("Error deleting table: " + error.message);
        }
    },
    // updatetable: async (req, res) => {
    //     try {
    //         const tableID = await Table.findById(req.params.id);
    //         if (!tableID) {
    //             return res.status(404).json('not found')
    //         }

    //         if (tableID.order && tableID.order !== req.body.order?.toString()) {
    //             await Order.findByIdAndUpdate(tableID.order, {
    //                 table: tableID._id,
    //             })
    //         }
    //         const updateTable = await Table.findByIdAndUpdate(req.params.id, req.body, {
    //             new: true
    //         })
    //         return res.status(200).json({ message: "Update successfully", update: updateTable });
    //     } catch (error) {

    //     }
    // }
    updatetable: async (req, res) => {
        try {
            const tableID = await Table.findById(req.params.id);
            if (!tableID) {
                return res.status(404).json('Table not found');
            }

            // Kiểm tra và cập nhật order nếu có sự thay đổi
            if (tableID.order && tableID.order !== req.body.order?.toString()) {
                await Order.findByIdAndUpdate(tableID.order, {
                    table: tableID._id,
                });
            }

            // Cập nhật status nếu có trong req.body
            if (req.body.status) {
                tableID.status = req.body.status;
            }

            // Cập nhật các trường khác (nếu cần thiết) bằng req.body
            const updateTable = await Table.findByIdAndUpdate(req.params.id, {
                status: tableID.status,  // Cập nhật status đã thay đổi
                order: req.body.order || tableID.order,  // Cập nhật order nếu có thay đổi
                // Có thể thêm các trường khác ở đây nếu cần
            }, { new: true });

            return res.status(200).json({ message: "Update successfully", update: updateTable });
        } catch (error) {
            console.error(error);  // Log lỗi để dễ dàng kiểm tra
            return res.status(500).json({ message: "An error occurred", error: error.message });
        }
    },
    // lấy order hiện tại của bàn đó ra
    getCurrentOrderByTable: async (req, res) => {
        try {
            // Tìm bàn theo ID từ params
            const table = await Table.findById(req.params.id);
            if (!table) {
                return res.status(404).json({ message: "Table not found" });
            }
    
            // Log để kiểm tra thông tin bàn
            console.log("Table found:", table);
    
            // Lọc các đơn hàng có trạng thái 1, 2
            const orders = await Order.find({
                table: table._id,
                od_status: { $in: ["1", "2"] } // 1: chờ xác nhận, 2: chưa thanh toán
            })
                .populate({
                    path: 'orderdetail',
                    populate: {
                        path: 'products',
                        model: 'Product'
                    }
                })
                .populate('customer')
                .populate('payment')
                .populate('notification')
                .populate('table');
    
            // Log thông tin các đơn hàng
            console.log("Orders found:", orders);
    
            if (orders.length === 0) {
                return res.status(404).json({ message: "No unpaid orders for this table" });
            }
    
            // Xử lý danh sách đơn hàng
            const ordersDetails = orders.map(order => ({
                orderId: order._id,
                od_note: order.od_status,
                customer: {
                    name: order.customer.name,
                    phone: order.customer.phone,
                    email: order.customer.email,
                },
                tableNumber: order.table ? order.table.tb_number : "Not assigned",
                tableStatus: table.status,
                totalAmount: order.total_amount,
                orderNote: order.od_note,
                paymentStatus: order.payment ? order.payment.status : "Not paid",
                products: order.orderdetail.map(detail => ({
                    id: detail._id, // 🆕 ID của orderdetail
                    productId: detail.products._id,
                    productName: detail.products.pd_name,
                    price: detail.products.price,
                    quantity: detail.quantity,
                    totalPrice: detail.quantity * detail.products.price,
                    image: detail.products.image,
                    status: detail.status
                })),
                updatedAt: order.updatedAt,
                createdAt: order.od_date,
            }));
    
            // Trả về kết quả
            res.status(200).json({
                tableNumber: table.tb_number,
                orders: ordersDetails
            });
    
        } catch (error) {
            console.error("Error fetching orders:", error);
            return res.status(500).json({ message: "Server error", error: error.message });
        }
    }
    ,
    // xóa bàn khi có status bằng 1
    deleteTableById: async (req, res) => {
        try {
            const tableId = req.params.id;

            // Tìm table theo id
            const table = await Table.findById(tableId);

            if (!table) {
                return res.status(404).json({ message: "Không tìm thấy bàn." });
            }

            if (table.status !== "1") {
                // Không xóa, trả về bàn + thông báo
                return res.status(200).json({
                    message: "Không thể xóa. Bàn không có status = '1'.",
                    table: table,
                });
            }

            // Nếu status = "1", xóa bàn
            const deletedTable = await Table.findByIdAndDelete(tableId);

            res.status(200).json({
                message: "Xóa bàn thành công.",
                table: deletedTable,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Đã xảy ra lỗi server." });
        }
    },
}
module.exports = tableController;
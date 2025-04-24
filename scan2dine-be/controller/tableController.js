const { Order, Table } = require('../model/model');

const tableController = {
    // add table
    addTable: async (req, res) => {
        try {
            const lastTable = await Table.findOne().sort({ tb_number: -1 });
            console.log("Last table:", lastTable);

            const nextTableNumber = lastTable ? lastTable.tb_number + 1 : 1;

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
}
module.exports = tableController;
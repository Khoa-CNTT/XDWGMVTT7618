const { Order, Table } = require('../model/model');

const tableController = {
    // add table
    addTable: async (req, res) => {
        try {
            // Tìm bàn có tb_number lớn nhất
            const lastTable = await Table.findOne().sort({ tb_number: -1 });

            // Tăng tb_number, nếu không có bàn nào thì bắt đầu từ 1
            const nextTableNumber = lastTable ? lastTable.tb_number + 1 : 1;

            // Tạo mới bàn với tb_number tự động tăng
            const newTable = new Table({
                ...req.body,
                tb_number: nextTableNumber,
            });

            // Lưu bàn mới vào DB
            const saved = await newTable.save();

            // Trả về thông tin bàn vừa tạo, bao gồm cả tên "Bàn X"
            res.status(200).json({
                ...saved.toObject(),
                name: `Bàn ${saved.tb_number}`
            });
        } catch (error) {
            console.error("Error in addTable:", error);
            res.status(500).json({ message: "Server error", error: error.message });
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
            res.status(200).json(result);

        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    },
    // delete table
    deleteTable: async (req, res) => {
        try {
            const table = await Table.findByIdAndDelete(req.params.id);
            if (!table) {
                return res.status(404).json("Table not found");
            }
            res.status(200).json({ message: "Table has been deleted successfully", delete: deleteTable });
        } catch (error) {
            res.status(500).json("Error deleting table: " + error.message);
        }
    },
    updatetable: async (req, res) => {
        try {
            const tableID = await Table.findById(req.params.id);
            if (!tableID) {
                res.status(404).json('not found')
            }

            if (tableID.order && tableID.order !== req.body.order?.toString()) {
                await Order.findByIdAndUpdate(tableID.order, {
                    table: tableID._id,
                })
            }
            const updateTable = await Table.findByIdAndUpdate(req.params.id, req.body, {
                new: true
            })
            res.status(200).json({ message: "Update successfully", update: updateTable });
        } catch (error) {

        }
    },

}

module.exports = tableController;
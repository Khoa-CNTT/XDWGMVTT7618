const { Order, Table } = require('../model/model');

const tableController = {
  // Add a new table
  addTable: async (req, res) => {
    try {
      const tables = await Table.find().sort({ tb_number: 1 }).lean();

      let nextTableNumber = 1;
      for (let i = 0; i < tables.length; i++) {
        if (tables[i].tb_number !== i + 1) {
          nextTableNumber = i + 1;
          break;
        }
        nextTableNumber = tables.length + 1;
      }

      const newTable = new Table({
        ...req.body,
        tb_number: nextTableNumber,
        status: req.body.status || '1' // Default to "Trống" if not provided
      });

      const savedTable = await newTable.save();



      return res.status(200).json({
        message: 'Thêm bàn thành công',
        table: {
          ...savedTable.toObject(),
          name: `Bàn ${savedTable.tb_number}`
        }
      });
    } catch (error) {
      console.error('Error in addTable:', error);
      return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  },

  // Get all tables
  getTable: async (req, res) => {
    try {
      const tables = await Table.find().sort({ tb_number: 1 }).lean();
      const result = tables.map(table => ({
        ...table,
        name: `Bàn ${table.tb_number}`
      }));

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getTable:', error);
      return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  },

  // Delete a table
  deleteTable: async (req, res) => {
    try {
      const table = await Table.findById(req.params.id);
      if (!table) {
        return res.status(404).json({ message: 'Không tìm thấy bàn' });
      }

      // Check if table has active orders
      if (table.order && table.order.length > 0) {
        return res.status(400).json({ message: 'Không thể xóa bàn vì có đơn hàng đang hoạt động' });
      }

      await Table.findByIdAndDelete(req.params.id);



      return res.status(200).json({
        message: 'Xóa bàn thành công',
        table
      });
    } catch (error) {
      console.error('Error in deleteTable:', error);
      return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  },


  updatetable: async (req, res) => {
    try {
      const table = await Table.findById(req.params.id);
      if (!table) {
        return res.status(404).json({ message: 'Không tìm thấy bàn' });
      }

      const { status, order } = req.body;


      // Validate status
      if (status && !['1', '2', '3', '4', '5'].includes(status)) {
        return res.status(400).json({ message: 'Trạng thái bàn không hợp lệ' });
      }

      // Prevent updating order if table has active orders
      if (order && table.order && table.order.length > 0 && order !== table.order.toString()) {
        return res.status(400).json({ message: 'Không thể cập nhật đơn hàng vì bàn đang có đơn hàng hoạt động' });
      }

      const updatedTable = await Table.findByIdAndUpdate(
        req.params.id,
        { $set: { status: status || table.status, order: order || table.order } },
        { new: true }
      );

      return res.status(200).json({
        message: 'Cập nhật bàn thành công',
        table: {
          ...updatedTable.toObject(),
          name: `Bàn ${updatedTable.tb_number}`
        }
      });
    } catch (error) {
      console.error('Error in updatetable:', error);
      return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  },

  // Get current orders by table
  getCurrentOrderByTable: async (req, res) => {
    try {
      const table = await Table.findById(req.params.id);
      if (!table) {
        return res.status(404).json({ message: 'Không tìm thấy bàn' });
      }

      const orders = await Order.find({
        table: table._id,
        od_status: { $in: ['1', '2'] }
      })
        .populate({
          path: 'orderdetail',
          populate: { path: 'products', model: 'Product' }
        })
        .populate('customer')
        .populate('payment')
        .populate('notification')
        .populate('table')
        .lean();

      if (orders.length === 0) {
        return res.status(404).json({ message: 'Không có đơn hàng chưa thanh toán cho bàn này' });
      }

      const ordersDetails = orders.map(order => ({
        orderId: order._id,
        od_status: order.od_status,
        customer: order.customer
          ? {
            name: order.customer.name,
            phone: order.customer.phone,
            email: order.customer.email
          }
          : null,
        tableNumber: order.table?.tb_number || 'Chưa gán',
        tableStatus: table.status,
        totalAmount: order.total_amount,
        orderNote: order.od_note,
        paymentStatus: order.payment ? order.payment.status : 'Chưa thanh toán',
        products: order.orderdetail.map(detail => ({
          id: detail._id,
          productId: detail.products._id,
          productName: detail.products.pd_name,
          price: detail.products.price,
          quantity: detail.quantity,
          totalPrice: detail.quantity * detail.products.price,
          image: detail.products.image,
          status: detail.status
        })),
        updatedAt: order.updatedAt,
        createdAt: order.od_date
      }));

      return res.status(200).json({
        tableNumber: table.tb_number,
        idTable: table._id || '',
        orders: ordersDetails
      });
    } catch (error) {
      console.error('Error in getCurrentOrderByTable:', error);
      return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  },

  // Delete a table by ID if status is '1'
  deleteTableById: async (req, res) => {
    try {
      const table = await Table.findById(req.params.id);
      if (!table) {
        return res.status(404).json({ message: 'Không tìm thấy bàn' });
      }

      if (table.status !== '1') {
        return res.status(400).json({
          message: 'Không thể xóa bàn vì trạng thái không phải "Trống"',
          table
        });
      }

      await Table.findByIdAndDelete(req.params.id);

      return res.status(200).json({
        message: 'Xóa bàn thành công',
        table
      });
    } catch (error) {
      console.error('Error in deleteTableById:', error);
      return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }
};

module.exports = tableController;
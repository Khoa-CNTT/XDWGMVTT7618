const { Order, Customer, Table, Orderdetail } = require('../model/model');
const { confirmAllPendingOrderDetails } = require('../service/orderService');
const { notifyOrderAdded, notifyOrderUpdated, notifyOrderDeleted, notifyOrderDetailRemoved, notifyOrderConfirmed } = require('../utils/socketUtils');

const orderController = {
  // Add a new order
  addOrder: async (req, res) => {
    try {
      const { customer, table } = req.body;

      const newOrder = new Order(req.body);
      const savedOrder = await newOrder.save();

      // Update customer
      if (customer) {
        await Customer.findByIdAndUpdate(customer, {
          $addToSet: { order: savedOrder._id }
        });
      }

      // Update table
      if (table) {
        await Table.findByIdAndUpdate(table, {
          $addToSet: { order: savedOrder._id }
        });
      }

      const io = req.app.get('io');
      if (!io) {
        console.error('Socket.IO is not initialized');
        return res.status(500).json({ message: 'Socket.IO not available' });
      }

      notifyOrderAdded(io, savedOrder._id, {
        orderId: savedOrder._id,
        customerId: customer,
        tableId: table,
        message: 'Đơn hàng mới đã được thêm'
      });

      return res.status(200).json(savedOrder);
    } catch (error) {
      console.error('Error in addOrder:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get all orders
  getOrder: async (req, res) => {
    try {
      const orders = await Order.find().populate({ path: 'customer', select: 'name' });
      return res.status(200).json(orders);
    } catch (error) {
      console.error('Error in getOrder:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get an order by ID
  getAorder: async (req, res) => {
    try {
      const order = await Order.findById(req.params.id)
        .select('total_amount od_status od_date')
        .populate({
          path: 'orderdetail',
          select: 'quantity products status total',
          populate: {
            path: 'products',
            select: 'pd_name price stall image',
            populate: { path: 'stall_id', select: 'stall_name' }
          }
        })
        .populate({ path: 'customer', select: 'name phone' })
        .populate({ path: 'table', select: 'tb_number status' });

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      return res.status(200).json(order);
    } catch (error) {
      console.error('Error in getAorder:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Update an order
  updateOrder: async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      const { customer, table } = req.body;

      // Update customer
      if (customer && customer !== order.customer?.toString()) {
        if (order.customer) {
          await Customer.findByIdAndUpdate(order.customer, {
            $pull: { order: order._id }
          });
        }
        await Customer.findByIdAndUpdate(customer, {
          $addToSet: { order: order._id }
        });
      }

      // Update table
      if (table && table !== order.table?.toString()) {
        if (order.table) {
          await Table.findByIdAndUpdate(order.table, {
            $pull: { order: order._id }
          });
        }
        await Table.findByIdAndUpdate(table, {
          $addToSet: { order: order._id }
        });
      }

      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );

      const io = req.app.get('io');
      if (!io) {
        console.error('Socket.IO is not initialized');
        return res.status(500).json({ message: 'Socket.IO not available' });
      }

      notifyOrderUpdated(io, updatedOrder._id, {
        orderId: updatedOrder._id,
        customerId: updatedOrder.customer,
        tableId: updatedOrder.table,
        message: 'Đơn hàng đã được cập nhật'
      });

      return res.status(200).json({
        message: 'Order updated successfully',
        order: updatedOrder
      });
    } catch (error) {
      console.error('Error in updateOrder:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Delete an order
  deleteOrder: async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Delete related order details
      await Orderdetail.deleteMany({ _id: { $in: order.orderdetail } });

      // Update customer
      if (order.customer) {
        await Customer.findByIdAndUpdate(order.customer, {
          $pull: { order: order._id }
        });
      }

      // Update table
      if (order.table) {
        await Table.findByIdAndUpdate(order.table, {
          $pull: { order: order._id }
        });
      }

      await Order.findByIdAndDelete(req.params.id);

      const io = req.app.get('io');
      if (!io) {
        console.error('Socket.IO is not initialized');
        return res.status(500).json({ message: 'Socket.IO not available' });
      }

      notifyOrderDeleted(io, order._id, {
        orderId: order._id,
        customerId: order.customer,
        tableId: order.table,
        message: 'Đơn hàng đã bị xóa'
      });

      return res.status(200).json({
        message: 'Order deleted successfully',
        order
      });
    } catch (error) {
      console.error('Error in deleteOrder:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Confirm an order
  confirmOrder: async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      const result = await confirmAllPendingOrderDetails(req.params.id);

      await Order.findByIdAndUpdate(req.params.id, {
        $set: { od_status: '2' }
      });

      if (result.order.table) {
        await Table.findByIdAndUpdate(result.order.table, {
          $set: { status: '2' }
        });
      }

      const updatedOrder = await Order.findById(req.params.id)
        .populate('customer', 'name phone')
        .populate('table', 'tb_number status')
        .populate({
          path: 'orderdetail',
          populate: { path: 'products', select: 'pd_name price' }
        });

      const io = req.app.get('io');
      if (!io) {
        console.error('Socket.IO is not initialized');
        return res.status(500).json({ message: 'Socket.IO not available' });
      }

      notifyOrderConfirmed(io, updatedOrder._id, {
        orderId: updatedOrder._id,
        customerId: updatedOrder.customer?._id,
        tableId: updatedOrder.table?._id,
        status: updatedOrder.od_status,
        message: 'Đơn hàng đã được xác nhận'
      });

      return res.status(200).json({
        message: 'Xác nhận đơn hàng thành công',
        order: {
          _id: updatedOrder._id,
          customer: updatedOrder.customer,
          table: updatedOrder.table,
          status: updatedOrder.od_status,
          orderdetail: updatedOrder.orderdetail,
          updatedAt: updatedOrder.updatedAt
        }
      });
    } catch (error) {
      console.error('Error in confirmOrder:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Remove order details by status
  removeOrderdetailbyStatus: async (req, res) => {
    try {
      const order = await Order.findById(req.params.id).populate('orderdetail');
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      const pendingOrderDetails = order.orderdetail.filter(od => od.status === '1');
      const orderDetailIds = pendingOrderDetails.map(od => od._id);

      if (orderDetailIds.length === 0) {
        return res.status(200).json({ message: 'Không có OrderDetail nào ở trạng thái "Chờ xác nhận" để xóa' });
      }

      const io = req.app.get('io');
      if (!io) {
        console.error('Socket.IO is not initialized');
        return res.status(500).json({ message: 'Socket.IO not available' });
      }

      if (pendingOrderDetails.length === order.orderdetail.length) {
        await Orderdetail.deleteMany({ _id: { $in: orderDetailIds } });
        await Order.findByIdAndDelete(order._id);

        if (order.customer) {
          await Customer.findByIdAndUpdate(order.customer, {
            $pull: { order: order._id }
          });
        }

        if (order.table) {
          await Table.findByIdAndUpdate(order.table, {
            $pull: { order: order._id },
            $set: { status: '1' }
          });
        }

        notifyOrderDeleted(io, order._id, {
          orderId: order._id,
          customerId: order.customer,
          tableId: order.table,
          message: 'Đơn hàng và tất cả OrderDetail "Chờ xác nhận" đã bị xóa'
        });

        return res.status(200).json({
          message: 'Đã xóa toàn bộ đơn hàng và OrderDetail "Chờ xác nhận"'
        });
      } else {
        await Orderdetail.deleteMany({ _id: { $in: orderDetailIds } });
        await Order.findByIdAndUpdate(order._id, {
          $pull: { orderdetail: { $in: orderDetailIds } }
        });

        if (order.table) {
          await Table.findByIdAndUpdate(order.table, {
            $set: { status: '2' }
          });
        }

        notifyOrderDetailRemoved(io, order._id, {
          orderId: order._id,
          removedOrderDetailIds: orderDetailIds,
          message: 'Các OrderDetail "Chờ xác nhận" đã bị xóa'
        });

        return res.status(200).json({
          message: 'Đã xóa các OrderDetail "Chờ xác nhận"',
          removed: orderDetailIds
        });
      }
    } catch (error) {
      console.error('Error in removeOrderdetailbyStatus:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = orderController;
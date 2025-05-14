const { Customer, Cart, Order } = require('../model/model');
const { creatCart } = require('../service/cartService');
const { notifyCustomerAdded, notifyCustomerUpdated, notifyCustomerDeleted } = require('../utils/socketUtils');

const customerController = {
  // Add a customer
  addCustomer: async (req, res) => {
    try {
      const { phone, name,status  } = req.body;

      if (!phone || !name) {
        return res.status(400).json({ message: 'Thiếu số điện thoại hoặc tên khách hàng' });
      }

      const existingCustomer = await Customer.findOne({ phone });
      if (existingCustomer) {
        return res.status(200).json({
          message: 'Khách hàng đã tồn tại',
          customer: existingCustomer
        });
      }

      const newCustomer = new Customer(req.body);
      const io = req.app.get('io');
      if (!io) {
        console.error('Socket.IO is not initialized');
        return res.status(500).json({ message: 'Socket.IO not available' });
      }

      const cart = await creatCart(null, io);
      newCustomer.cart = cart._id;
      const savedCustomer = await newCustomer.save();

      // Gắn customerId vào cart
      await Cart.findByIdAndUpdate(cart._id, {
        customer: savedCustomer._id
      });

      notifyCustomerAdded(io, savedCustomer._id, {
        customerId: savedCustomer._id,
        phone: savedCustomer.phone,
        name: savedCustomer.name,
        cartId: cart._id,
        message: 'Khách hàng mới đã được thêm'
      });

      return res.status(200).json(savedCustomer);
    } catch (error) {
      console.error('Error in addCustomer:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get all customers
  getAllCustomer: async (req, res) => {
    try {
      const customers = await Customer.find();
      return res.status(200).json(customers);
    } catch (error) {
      console.error('Error in getAllCustomer:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
// updateCustomer: async (req, res) => {
//   try {
//     console.log('➡️ Nhận dữ liệu body:', req.body); // Debug
//     const customerId = req.params.id;

//     // Tìm khách hàng
//     const customer = await Customer.findById(customerId);
//     if (!customer) {
//       return res.status(404).json({ message: 'Customer not found' });
//     }

//     // Nếu cart thay đổi thì cập nhật lại liên kết
//     if (req.body.cart && req.body.cart !== customer.cart?.toString()) {
//       // Gỡ cart cũ (nếu có)
//       if (customer.cart) {
//         await Cart.findByIdAndUpdate(customer.cart, { $unset: { customer: '' } });
//       }

//       // Gắn cart mới
//       await Cart.findByIdAndUpdate(req.body.cart, { customer: customer._id });
//     }

//     // Cập nhật dữ liệu khách hàng
//     const updatedCustomer = await Customer.findByIdAndUpdate(
//       customerId,
//       { $set: req.body },
//       { new: true, runValidators: true }
//     );

//     if (!updatedCustomer) {
//       return res.status(500).json({ message: 'Không thể cập nhật khách hàng' });
//     }

//     // Gửi socket nếu có
//     const io = req.app.get('io');
//     if (io) {
//       notifyCustomerUpdated(io, updatedCustomer._id, {
//         customerId: updatedCustomer._id,
//         phone: updatedCustomer.phone,
//         name: updatedCustomer.name,
//         cartId: updatedCustomer.cart,
//         status: updatedCustomer.status,
//         message: 'Thông tin khách hàng đã được cập nhật'
//       });
//     } else {
//       console.warn('⚠️ Socket.IO chưa được khởi tạo');
//     }

//     return res.status(200).json({
//       message: 'Customer updated successfully',
//       customer: updatedCustomer
//     });

//   } catch (error) {
//     console.error('❌ Lỗi trong updateCustomer:', error);
//     return res.status(500).json({ message: 'Server error', error: error.message });
//   }
// },

  // Update a customer
  updateCustomer: async (req, res) => {
    try {
      const customer = await Customer.findById(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      if (req.body.cart && req.body.cart !== customer.cart?.toString()) {
        // Gỡ liên kết với cart cũ (nếu có)
        if (customer.cart) {
          await Cart.findByIdAndUpdate(customer.cart, {
            $unset: { customer: '' }
          });
        }
        // Gắn liên kết với cart mới
        await Cart.findByIdAndUpdate(req.body.cart, {
          customer: customer._id
        });
      }
      const updatedCustomer = await Customer.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true,runValidators: true }
      );

      const io = req.app.get('io');
      if (!io) {
        console.error('Socket.IO is not initialized');
        return res.status(500).json({ message: 'Socket.IO not available' });
      }

      notifyCustomerUpdated(io, updatedCustomer._id, {
        customerId: updatedCustomer._id,
        phone: updatedCustomer.phone,
        name: updatedCustomer.name,
        // status: updatedCustomer.status,
        cartId: updatedCustomer.cart,
        message: 'Thông tin khách hàng đã được cập nhật'
      });

      return res.status(200).json({
        message: 'Customer updated successfully',
        customer: updatedCustomer
      });
    } catch (error) {
      console.error('Error in updateCustomer:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Delete a customer
  deleteCustomer: async (req, res) => {
    try {
      const customer = await Customer.findById(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      // Gỡ liên kết với cart
      if (customer.cart) {
        await Cart.findByIdAndUpdate(customer.cart, {
          $unset: { customer: '' }
        });
      }

      await Customer.findByIdAndDelete(req.params.id);

      const io = req.app.get('io');
      if (!io) {
        console.error('Socket.IO is not initialized');
        return res.status(500).json({ message: 'Socket.IO not available' });
      }

      notifyCustomerDeleted(io, customer._id, {
        customerId: customer._id,
        phone: customer.phone,
        name: customer.name,
        message: 'Khách hàng đã bị xóa'
      });

      return res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
      console.error('Error in deleteCustomer:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Check customer by phone
  checkCustomerByPhone: async (req, res) => {
    try {
      const { phone } = req.body;

      if (!phone) {
        return res.status(400).json({ message: 'Thiếu số điện thoại' });
      }

      const existingCustomer = await Customer.findOne({ phone });

      if (existingCustomer) {
        return res.status(200).json({
          message: 'Customer exists',
          customer: existingCustomer
        });
      }

      return res.status(404).json({
        message: 'Customer not found. Please enter your name.'
      });
    } catch (error) {
      console.error('Error in checkCustomerByPhone:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get customer statistics
  getCustomerStatistics: async (req, res) => {
    try {
      const data = await Order.aggregate([
        {
          $sort: { _id: -1 } // Sort by _id descending (newest first)
        },
        {
          $group: {
            _id: '$customer',
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: { $toDouble: '$total_amount' } },
            latestOrder: { $first: '$$ROOT' }
          }
        },
        {
          $lookup: {
            from: 'CUSTOMER', // Sửa 'CUSTOMER' thành 'customers' (tên collection thường là chữ thường)
            localField: '_id',
            foreignField: '_id',
            as: 'customerInfo'
          }
        },
        {
          $unwind: '$customerInfo'
        },
        {
          $project: {
            _id: 0,
            customer_id: '$_id',
            name: '$customerInfo.name',
            phone: '$customerInfo.phone',
            totalOrders: 1,
            totalSpent: 1,
            latestOrderDate: '$latestOrder.od_date',
            latestOrderAmount: { $toDouble: '$latestOrder.total_amount' },
            latestOrderNote: '$latestOrder.od_note'
          }
        }
      ]);

      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error in getCustomerStatistics:', error);
      return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }
};

module.exports = customerController;
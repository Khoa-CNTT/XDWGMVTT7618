const { Customer, Cart, Order } = require('../model/model');
const { creatCart } = require('../service/cartService');

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
      const cart = await creatCart(null, io);
      newCustomer.cart = cart._id;
      const savedCustomer = await newCustomer.save();

      // Gắn customerId vào cart
      await Cart.findByIdAndUpdate(cart._id, {
        customer: savedCustomer._id
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
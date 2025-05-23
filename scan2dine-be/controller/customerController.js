const { Customer, Cart, Order } = require('../model/model');
const { creatCart } = require('../service/cartService');

const customerController = {
  // Add a customer
  addCustomer: async (req, res) => {
    try {
      const { phone, name} = req.body;

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
      const cart = await creatCart(null);
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
        { new: true, runValidators: true }
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
  // quyền làm
  // updateCustomerStatus : async (req, res) => {
  //   try {
  //     const customerId = req.params.id;

  //     // Kiểm tra khách hàng có tồn tại không
  //     const existingCustomer = await Customer.findById(customerId);
  //     if (!existingCustomer) {
  //       return res.status(404).json({ message: "Không tìm thấy khách hàng." });
  //     }

  //     // Lấy dữ liệu cần cập nhật từ request body
  //     const updatedData = {};
  //     const allowedFields = ["name", "phone", "cart", "status"];

  //     allowedFields.forEach((field) => {
  //       if (req.body[field] !== undefined) {
  //         updatedData[field] = req.body[field];
  //       }
  //     });

  //     // Cập nhật dữ liệu
  //     const updatedCustomer = await Customer.findByIdAndUpdate(
  //       customerId,
  //       { $set: updatedData },
  //       { new: true }
  //     );

  //     res.status(200).json({
  //       message: "Cập nhật thông tin khách hàng thành công.",
  //       customer: updatedCustomer,
  //     });
  //   } catch (error) {
  //     console.error("Lỗi cập nhật khách hàng:", error);
  //     res.status(500).json({ message: "Đã xảy ra lỗi khi cập nhật khách hàng." });
  //   }
  // },
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
  // checkCustomerByPhone: async (req, res) => {
  //   try {
  //     const { phone } = req.body;

  //     if (!phone) {
  //       return res.status(400).json({ message: 'Thiếu số điện thoại' });
  //     }

  //     const existingCustomer = await Customer.findOne({ phone });

  //     if (existingCustomer) {
  //       if (existingCustomer.status !== "1") {
  //         // Nếu trạng thái khác 0 thì không cho đăng nhập
  //         return res.status(403).json({
  //           message: 'Tài khoản không được phép đăng nhập vì trạng thái không hợp lệ.'
  //         });
  //       }

  //       // Nếu trạng thái = 0 thì trả về thông tin khách hàng
  //       return res.status(200).json({
  //         message: 'Customer exists',
  //         customer: existingCustomer
  //       });
  //     }


  //     return res.status(404).json({
  //       message: 'Customer not found. Please enter your name.'
  //     });
  //   } catch (error) {
  //     console.error('Error in checkCustomerByPhone:', error);
  //     return res.status(500).json({ message: 'Server error', error: error.message });
  //   }
  // },
checkCustomerByPhone: async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Thiếu số điện thoại' });
    }

    const existingCustomer = await Customer.findOne({ phone });

    if (existingCustomer) {
      // Trả về customer cùng thông tin trạng thái
      return res.status(200).json({
        message: 'Customer exists',
        customer: existingCustomer,
        blocked: existingCustomer.status === "1"  // cờ báo tài khoản bị chặn
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
  // getCustomerStatistics: async (req, res) => {
  //   try {
  //     const data = await Order.aggregate([
  //       {
  //         $sort: { _id: -1 } // Sort by _id descending (newest first)
  //       },
  //       {
  //         $group: {
  //           _id: '$customer',
  //           totalOrders: { $sum: 1 },
  //           totalSpent: { $sum: { $toDouble: '$total_amount' } },
  //           latestOrder: { $first: '$$ROOT' }
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: 'CUSTOMER', // Sửa 'CUSTOMER' thành 'customers' (tên collection thường là chữ thường)
  //           localField: '_id',
  //           foreignField: '_id',
  //           as: 'customerInfo'
  //         }
  //       },
  //       {
  //         $unwind: '$customerInfo'
  //       },
  //       {
  //         $project: {
  //           _id: 0,
  //           customer_id: '$_id',
  //           name: '$customerInfo.name',
  //           phone: '$customerInfo.phone',
  //           status: '$customerInfo.status',
  //           totalOrders: 1,
  //           totalSpent: 1,
  //           latestOrderDate: '$latestOrder.od_date',
  //           latestOrderAmount: { $toDouble: '$latestOrder.total_amount' },
  //           latestOrderNote: '$latestOrder.od_note'
  //         }
  //       }
  //     ]);

  //     return res.status(200).json({ success: true, data });
  //   } catch (error) {
  //     console.error('Error in getCustomerStatistics:', error);
  //     return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  //   }
  // }
getCustomerStatistics: async (req, res) => {
  try {
    const data = await Customer.aggregate([
      {
        $lookup: {
          from: Order.collection.collectionName, // Lấy đúng tên collection 'orders'
          localField: '_id',
          foreignField: 'customer',
          as: 'orders'
        }
      },
      {
        $addFields: {
          totalOrders: { $size: '$orders' },
          totalSpent: {
            $sum: {
              $map: {
                input: '$orders',
                as: 'order',
                in: { $toDouble: '$$order.total_amount' }
              }
            }
          },
          latestOrder: {
            $arrayElemAt: [
              {
                $slice: [
                  {
                    $reverseArray: {
                      $sortArray: {
                        input: '$orders',
                        sortBy: { _id: -1 }
                      }
                    }
                  },
                  1
                ]
              },
              0
            ]
          }
        }
      },
      {
        $project: {
          _id: 0,
          customer_id: '$_id',
          name: 1,
          phone: 1,
          status: 1,
          totalOrders: 1,
          totalSpent: 1,
          latestOrderDate: '$latestOrder.od_date',
          latestOrderAmount: {
            $cond: {
              if: '$latestOrder',
              then: { $toDouble: '$latestOrder.total_amount' },
              else: null
            }
          },
          latestOrderNote: '$latestOrder.od_note'
        }
      }
    ]);

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error in getCustomerStatistics:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}
};

module.exports = customerController;
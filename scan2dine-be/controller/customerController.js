const { default: mongoose } = require("mongoose");
const { Customer, Cart, Order } = require("../model/model");
const { creatCart } = require("../service/cartService");
const { notifyCustomerAdded, notifyCustomerUpdated, notifyCustomerDeleted } = require("../utils/socketUtils");
const customerController = {
  //  ADD CUSTOMER
  addCustomer: async (req, res) => {
    try {
      const { phone, name } = req.body;
      const checkphone = await Customer.findOne({ phone });
      if (checkphone) {
        return res.status(200).json({
          message: "Khách hàng đã tồn tại",
          customer: checkphone,
        });
      }
      // nếu chưa tồn tại thì tạo mới
      const newCustomer = new Customer(req.body);
      const io = req.app.get("io");
      const cart = await creatCart(null, io);
      newCustomer.cart = cart._id;
      const saveCustomer = await newCustomer.save();
      // Gắn lại customerId vào cart (đảm bảo schema Cart có trường customer)
      await Cart.findByIdAndUpdate(cart._id, {
        customer: saveCustomer._id,
      });
      // thông báo cho client
      notifyCustomerAdded(io, saveCustomer._id, {
        customer: saveCustomer._id,
        phone: saveCustomer.phone,
        name: saveCustomer.name,
        cart: cart._id,
        message: "Khách hàng mới đã được thêm",
      });
      res.status(200).json(saveCustomer);
    } catch (error) {
      console.error("Error in creating customer:", error);
      res
        .status(500)
        .json({ message: "Lỗi server", error: error.message || error });
    }
  },

  // SHOW ALL CUSTOMER
  getAllCustomer: async (req, res) => {
    try {
      const customers = await Customer.find();
      // trả về kết quả all customer
      res.status(200).json(customers);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  // update customer
  updateCustomer: async (req, res) => {
    try {
      const customerID = await Customer.findById(req.params.id);
      if (!customerID) {
        res.status(404).json("not found");
      }
      // nếu có giỏ hagnf thif xóa
      if (req.body.cart && req.body.cart !== customerID.cart?.toString()) {
        // check có id của cart trong customer không
        if (customerID.cart) {
          await Cart.findByIdAndUpdate(customerID.cart, {
            $pull: {
              customer: customerID._id,
            },
          });
        }
        await Cart.findByIdAndUpdate(req.body.cart, {
          $push: {
            customer: customerID._id,
          },
        });
      }

      const updateCustomer = await Customer.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      const io = req.app.get('io');
      notifyCustomerUpdated(io, updateCustomer._id, {
        customerId: updateCustomer._id,
        phone: updateCustomer.phone,
        name: updateCustomer.name,
        cartId: updateCustomer.cart,
        message: 'Thông tin khách hàng đã được cập nhật',
      });
      res.status(200).json(updateCustomer);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  // delete customer
  deleteCustomer: async (req, res) => {
    try {
      const deleteCustomer = await Customer.findByIdAndDelete(req.params.id);
      if (!deleteCustomer) {
        res.status(404).json({ message: "not found" });
      }
      // xóa customer khoir giỏ hàng
      await Cart.findByIdAndUpdate(deleteCustomer.cart, {
        $pull: {
          customer: deleteCustomer._id,
        },
      });
      const io = req.app.get('io');
      notifyCustomerDeleted(io, deleteCustomer._id, {
        customerId: deleteCustomer._id,
        phone: deleteCustomer.phone,
        name: deleteCustomer.name,
        message: 'Khách hàng đã bị xóa',
      });
      res.status(200).json("Delete Succesfully");
    } catch (error) {
      res.status(500).json(error);
    }
  },
  // KIỂM TRA SỐ ĐIỆN THOẠI KHÁCH HÀNG
  checkCustomerByPhone: async (req, res) => {
    try {
      const phone = req.body.phone;

      // Kiểm tra số điện thoại có tồn tại trong database không
      const existingCustomer = await Customer.findOne({ phone });

      if (existingCustomer) {
        // Nếu đã có => trả về thông tin khách hàng
        res.status(200).json({
          message: "Customer exists",
          customer: existingCustomer,
        });
      } else {
        // Nếu chưa có => yêu cầu nhập tên để tạo mới
        res.status(404).json({
          message: "Customer not found. Please enter your name.",
        });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  },
  // show all KH mua hàng

  getCustomerStatistics: async (req, res) => {
    try {
      const data = await Order.aggregate([
        {
          $sort: { _id: -1 } // Đảm bảo đơn mới nhất nằm đầu tiên (dựa vào _id)
        },
        {
          $group: {
            _id: "$customer", // Gom nhóm theo khách hàng
            totalOrders: { $sum: 1 },
            totalSpent: {
              $sum: { $toDouble: "$total_amount" }
            },
            latestOrder: { $first: "$$ROOT" } // Lấy đơn mới nhất trong nhóm
          }
        },
        {
          $lookup: {
            from: "CUSTOMER",
            localField: "_id",
            foreignField: "_id",
            as: "customerInfo"
          }
        },
        {
          $unwind: "$customerInfo"
        },
        {
          $project: {
            _id: 0,
            customer_id: "$_id",
            name: "$customerInfo.name",
            phone: "$customerInfo.phone",
            totalOrders: 1,
            totalSpent: 1,
            latestOrderDate: "$latestOrder.od_date",
            latestOrderAmount: {
              $toDouble: "$latestOrder.total_amount"
            },
            latestOrderNote: "$latestOrder.od_note"
          }
        }
      ]);
  
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Lỗi khi lấy thống kê khách hàng:", error);
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  }
};

module.exports = customerController;

const { default: mongoose } = require("mongoose");
const { Customer, Cart } = require("../model/model");

const customerController = {
  //  ADD CUSTOMER
  addCustomer: async (req, res) => {
    try {
      // req.body là chỉ chấp nhận những trg có trong customer
      const newCustomer = new Customer(req.body);
      // lưu customer
      const saveCustomer = await newCustomer.save();
      // tra ve thong tin cua customer duoc luu
      res.status(200).json(saveCustomer);
    } catch (error) {
      res.status(500).json(error);
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
      //
      res.status(200).json("Delete Succesfully");
    } catch (error) {
      res.status(500).json(error);
    }
  },
};

module.exports = customerController;

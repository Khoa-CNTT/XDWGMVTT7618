const { json } = require('express');
const mongoose = require("mongoose");  // Khai báo mongoose duy nhất
const { Product, Category, Foodstall, Orderdetail, Order } = require('../model/model');
const fs = require('fs');
const path = require('path');

const productController = {
  // ADD PRODUCT và IMAGE
  addProduct: async (req, res) => {
    try {
      // In ra request body và file để kiểm tra
      console.log("Request body:", req.body);
      console.log("Request file:", req.file);

      // Kiểm tra nếu các giá trị bắt buộc không được cung cấp
      const { pd_name, price, description, category, stall_id } = req.body;
      if (!pd_name || !price || !category || !stall_id) {
        return res.status(400).json({ message: 'Missing required fields: pd_name, price, category, or stall_id.' });
      }

      // Tạo đối tượng mới từ body
      let newProductData = { ...req.body };

      // Nếu có ảnh thì xử lý thêm
      if (req.file) {
        const imagePath = req.file.path.replace(/\\/g, '/'); // Fix đường dẫn cho Windows
        newProductData.image = imagePath.replace('public/', '/'); // Clean path
      } else {
        return res.status(400).json({ message: 'Image is required!' });
      }

      const newProduct = new Product(newProductData);
      const saveProduct = await newProduct.save();

      // Cập nhật danh mục (category) nếu có
      if (category) {
        const categoryID = await Category.findById(category);
        if (!categoryID) {
          return res.status(404).json({ message: 'Category not found.' });
        }
        await categoryID.updateOne({ $push: { products: saveProduct._id } });
      }

      // Cập nhật gian hàng (stall) nếu có
      if (stall_id) {
        const stall = await Foodstall.findById(stall_id);
        if (!stall) {
          return res.status(404).json({ message: 'Stall not found.' });
        }
        await stall.updateOne({ $push: { products: saveProduct._id } });
      }

      // Trả về sản phẩm vừa tạo
      res.status(200).json(saveProduct);
    } catch (error) {
      console.error(error);  // In lỗi ra console để dễ dàng debug
      res.status(500).json({ message: 'Error creating product.', error: error.message });
    }
  },

  //  GET ALL PRODUCT
  getAllProduct: async (req, res) => {
    try {
      const products = await Product.find()
        .populate({
          path: "orderdetail",
          populate: { path: "order" }, // Populate thêm Order để lấy od_status
        })
        .lean();

      const productsWithFlags = products.map(product => {
        // Nếu không có orderdetail, cho phép chỉnh sửa/xóa
        if (!product.orderdetail || product.orderdetail.length === 0) {
          return {
            ...product,
            isEditable: true,
            isDisabled: false,
          };
        }

        // Kiểm tra od_status từ Order thông qua Orderdetail
        const hasCompletedOrder = product.orderdetail.some(detail =>
          detail.order && detail.order.od_status === "3"
        );
        const hasPendingOrder = product.orderdetail.some(detail =>
          detail.order && detail.order.od_status !== "3"
        );

        return {
          ...product,
          isEditable: hasCompletedOrder, // true nếu có đơn hàng hoàn thành (od_status = "3")
          isDisabled: hasPendingOrder, // true nếu có đơn hàng chưa hoàn thành (od_status !== "3")
        };
      });

      res.status(200).json(productsWithFlags);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  updateProduct: async (req, res) => {
    try {
      const productId = req.params.id;
      // const updatedData = req.body;
      const updatedData = {
        ...req.body,
        price: req.body.price ? parseFloat(req.body.price) : undefined,
        category: req.body.category ? req.body.category.toString() : undefined,
        stall_id: req.body.stall_id ? req.body.stall_id.toString() : undefined,
      };
      console.log("req.body:", req.body);
      console.log("typeof price:", typeof req.body.price);
      console.log("typeof category:", typeof req.body.category);

      // Kiểm tra sản phẩm có tồn tại không
      const oldProduct = await Product.findById(productId);
      if (!oldProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      const orderDetailIds = oldProduct.orderdetail;
      // Kiểm tra sản phẩm có nằm trong các OrderDetail của đơn hàng chưa hoàn thành không
      if (!orderDetailIds || orderDetailIds.length === 0) {
        // Tiếp tục cập nhật vì không có orderdetail liên quan
      } else {
        const orderDetails = await Orderdetail.find({
          _id: { $in: orderDetailIds },
        }).populate("order");

        const hasPendingOrder = orderDetails.some((detail) => {
          return detail.order && detail.order.od_status !== "3";
        });
        console.log("Có đơn hàng chưa hoàn thành liên quan đến sản phẩm này");
        if (hasPendingOrder) {
          return res.status(400).json({
            message: "Không thể cập nhật sản phẩm vì đang tồn tại trong đơn hàng chưa hoàn thành",
          });
        }
      }

      // Nếu có file ảnh mới
      if (req.file) {
        if (oldProduct.image) {
          const oldImagePath = path.join(__dirname, "../public", oldProduct.image);
          try {
            await fs.promises.unlink(oldImagePath);
          } catch (err) {
            console.error("Không thể xóa ảnh cũ:", err.message);
          }
        }
        updatedData.image = "/image/" + req.file.filename;
      }

      // Nếu category thay đổi
      if (
        updatedData.category &&
        oldProduct.category?.toString() !== updatedData.category.toString()
      ) {
        await Category.findByIdAndUpdate(oldProduct.category, {
          $pull: { products: productId },
        });
        await Category.findByIdAndUpdate(updatedData.category, {
          $push: { products: productId },
        });
      }

      // Nếu stall_id thay đổi
      if (
        updatedData.stall_id &&
        oldProduct.stall_id?.toString() !== updatedData.stall_id.toString()
      ) {
        if (!mongoose.Types.ObjectId.isValid(updatedData.stall_id)) {
          return res.status(400).json({ message: "Invalid stall_id" });
        }
        await Foodstall.findByIdAndUpdate(oldProduct.stall_id, {
          $pull: { products: productId },
        });
        await Foodstall.findByIdAndUpdate(updatedData.stall_id, {
          $push: { products: productId },
        });
      }
      // Cập nhật sản phẩm
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        updatedData,
        { new: true }
      );

      res.status(200).json(updatedProduct);
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error.message);
      res.status(500).json({ error: error.message });
    }
  },

  // ------------------------------------
  // DELETE PRODUCT
  deleteProduct: async (req, res) => {
    try {
      const productId = req.params.id;
      const findProduct = await Product.findById(productId);

      if (!findProduct) {
        return res.status(404).json({ message: "Sản phẩm không tồn tại" });
      }

      // Tìm tất cả orderdetails có liên quan, và populate order để kiểm tra trạng thái
      const orderDetailIds = findProduct.orderdetail;

      if (!orderDetailIds || orderDetailIds.length === 0) {
        // Không có orderdetail liên quan
      } else {
        const orderDetails = await Orderdetail.find({
          _id: { $in: orderDetailIds },
        }).populate("order");

        const hasUnfinishedOrders = orderDetails.some((detail) => {
          return detail.order && detail.order.od_status !== "3";
        });
        console.log("Có đơn hàng chưa hoàn thành liên quan đến sản phẩm này");

        if (hasUnfinishedOrders) {
          return res.status(400).json({
            message: "Không thể xóa sản phẩm vì đang tồn tại trong đơn hàng chưa hoàn thành",
          });

        }
      }

      // Tiến hành xóa sản phẩm
      const deletedProduct = await Product.findByIdAndDelete(productId);

      // Xóa ảnh nếu có
      if (deletedProduct.image) {
        const imagePath = path.join(__dirname, '../public', deletedProduct.image);
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error("Không thể xóa ảnh:", err.message);
          }
        });
      }

      // Gỡ sản phẩm khỏi category
      if (deletedProduct.category && mongoose.Types.ObjectId.isValid(deletedProduct.category)) {
        await Category.findByIdAndUpdate(deletedProduct.category, {
          $pull: { products: productId },
        });
      }

      res.status(200).json({ message: "Xóa sản phẩm thành công" });

    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      res.status(500).json({ error: error.message });
    }
  },
  filterProductsByPrice: async (req, res) => {
    try {
      const { min, max } = req.body;
      const query = {};

      if (min !== undefined && max !== undefined) {
        query.price = { $gte: Number(min), $lte: Number(max) };
      } else if (min !== undefined) {
        query.price = { $gte: Number(min) };
      } else if (max !== undefined) {
        query.price = { $lte: Number(max) };
      }

      console.log("Query:", query);

      const products = await Product.find(query).select("-orderdetail -cartdetail");

      console.log("Tổng số:", products.length);
      products.forEach(p => {
        console.log("->", p.pd_name, "-", p.price);
      });

      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

}

module.exports = productController;
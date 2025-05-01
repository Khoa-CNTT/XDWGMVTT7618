const { default: mongoose } = require("mongoose");
const { Product, Category, Foodstall, User, Table, Orderdetail } = require("../model/model");
const foodstallController = {
  //  GET ALL FOODSTALL
  getAllFoodstall: async (req, res) => {
    try {
      // Lấy danh sách quầy hàng
      const foodstalls = await Foodstall.find();

      // Lấy tất cả sản phẩm của tất cả các quầy hàng
      const allProducts = await Product.find({
        stall_id: { $in: foodstalls.map((stall) => stall._id) },
      });

      // Ghép thông tin quầy hàng với sản phẩm của quầy hàng đó
      const foodstallsWithProducts = foodstalls.map((stall) => {
        const stallProducts = allProducts.filter((product) =>
          product.stall_id.equals(stall._id)
        );
        return {
          ...stall._doc, // sao chép các thông tin quầy hàng
          products: stallProducts, // thêm sản phẩm của quầy hàng vào
        };
      });

      console.log(
        "Đã lấy danh sách quầy hàng với sản phẩm:",
        foodstallsWithProducts
      );

      res.status(200).json(foodstallsWithProducts);
    } catch (err) {
      console.error(" Lỗi khi lấy foodstall:", err);
      res.status(500).json({ error: err.message });
    }
  },
  // ADD

  addFoodstall: async (req, res) => {
    try {
      // Tạo mới Foodstall
      const newStall = new Foodstall(req.body);
      const saveStall = await newStall.save();

      // Kiểm tra nếu có trường user và thực hiện cập nhật stall_id vào User
      if (req.body.user) {
        const userID = await User.findById(req.body.user);
        if (!userID) {
          return res.status(404).json({ message: "User not found" });
        }

        // Cập nhật stall_id vào User
        await userID.updateOne({
          $push: {
            stall_id: saveStall._id,
          },
        });
      }

      return res.status(200).json(saveStall); // Trả về Foodstall vừa tạo
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error", error });
    }
  },
  getFoodstallByUserId: async (req, res) => {
    try {
      const userId = req.params.userId;
      console.log("Received userId:", userId); // Add this line

      const user = await User.findById(userId).populate("stall_id");
      console.log("Found user:", user); // Add this line

      if (!user || !user.stall_id) {
        return res
          .status(404)
          .json({ message: "No foodstall found for this user" });
      }

      // ... rest of the code
    } catch (error) {
      console.error("Error getting foodstall by user:", error);
      res.status(500).json({ error: error.message });
    }
  },

  deleteFoodstall: async (stallId) => {
    try {
      // Tìm foodstall cần xóa
      const foodstall = await Foodstall.findById(stallId);
      if (!foodstall) {
        return { message: "Foodstall not found" };
      }

      // Tìm các sản phẩm liên quan đến foodstall này
      const productsToDelete = await Product.find({ stall_id: stallId });
      if (productsToDelete.length > 0) {
        // Xóa các sản phẩm liên quan
        await Product.deleteMany({ stall_id: stallId });

        // Cập nhật Category để loại bỏ sản phẩm đã xóa khỏi danh sách của Category
        await Category.updateMany(
          { products: { $in: productsToDelete.map((p) => p._id) } },
          { $pull: { products: { $in: productsToDelete.map((p) => p._id) } } }
        );
      }

      // Xóa foodstall
      await foodstall.deleteOne();
      return { message: "Foodstall and related products deleted successfully" };
    } catch (error) {
      console.error("Error in deleteFoodstall:", error);
      return { error: error.message || error };
    }
  },

  deleteFoodstall: async (req, res) => {
    try {
      // Tìm foodstall cần xóa
      const foodstall = await Foodstall.findById(req.params.id);
      if (!foodstall) {
        return res.status(404).json({ message: "Foodstall not found" });
      }

      // Tìm các sản phẩm liên quan đến foodstall này
      const productsToDelete = await Product.find({ stall_id: req.params.id });
      if (productsToDelete.length > 0) {
        console.log(`Found ${productsToDelete.length} products to delete`);

        // Xóa các sản phẩm liên quan
        await Product.deleteMany({ stall_id: req.params.id });

        // Cập nhật Category để loại bỏ sản phẩm đã xóa khỏi danh sách của Category
        await Category.updateMany(
          { products: { $in: productsToDelete.map((p) => p._id) } },
          { $pull: { products: { $in: productsToDelete.map((p) => p._id) } } }
        );

        console.log("Products and Category updated after deletion");
      }

      // Xóa foodstall
      await foodstall.deleteOne();

      // Gửi phản hồi thành công
      return res.status(200).json({
        message: "Foodstall and related products deleted successfully",
        foodstall: foodstall,
      });
    } catch (error) {
      console.error("Error in deleteFoodstall:", error);
      return res
        .status(500)
        .json({ message: "Server error", error: error.message || error });
    }
  },
  // UPDATE
  updateFoodstall: async (req, res) => {
    try {
      const stallId = req.params.id;
      const updateData = req.body;

      const updatedStall = await Foodstall.findByIdAndUpdate(
        stallId,
        updateData,
        { new: true }
      );

      if (!updatedStall) {
        return res.status(404).json({ message: "Không tìm thấy quầy hàng." });
      }

      res.status(200).json({
        message: "Cập nhật quầy hàng thành công!",
        foodstall: updatedStall,
      });
    } catch (error) {
      console.error("Lỗi cập nhật quầy hàng:", error);
      res.status(500).json({ error: "Lỗi máy chủ khi cập nhật quầy hàng." });
    }
  },
  getAStall: async (req, res) => {
    try {
      const showAStall = await Foodstall.findById(req.params.id).populate({
        path: "products",
        select: "pd_name",
      });
      res.status(200).json(showAStall);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  getFoodstallByTableNumber: async (req, res) => {
    try {
      // Lấy stall id từ params
      const { id } = req.params;

      // Tìm quầy theo _id
      const foodstall = await Foodstall.findById(id);
      if (!foodstall) {
        return res.status(404).json({ message: "Không tìm thấy quầy hàng!" });
      }

      // Lấy tất cả sản phẩm thuộc quầy đó
      const products = await Product.find({ stall_id: foodstall._id }).select(
        "pd_name price image description"
      );

      // Trả về thông tin quầy + danh sách sản phẩm
      res.status(200).json({
        stall_id: foodstall._id,
        stallName: foodstall.stall_name,
        location: foodstall.location,
        products: products,
      });
    } catch (error) {
      console.error("Lỗi khi tìm kiếm quầy hàng:", error);
      res.status(500).json({ error: error.message });
    }
  },
  // lấy thông tin đơn hàng của quầy hàng
  getOrderDetailByStall: async (req, res) => {
    try {
      const { stall } = req.params;
      const orderDetails = await Orderdetail.find({
        stall: stall,
        status: { $ne: "1" },
      }).populate({
        path: "order",
        select: "table od_status orderdetail",
        populate: [
          {
            path: "table",
            select: "tb_number status",
          },
          {
            path: "orderdetail",
            populate: {
              path: "products",
              select: "pd_name price",
            },
          },
        ],
      });

      // Gom dữ liệu gọn lại cho FE
      const formatted = orderDetails.map((od) => {
        const order = od.order;
        return {
          order_id: order._id,
          order_status: order.od_status,
          table_number: order.table?.tb_number,
          table_status: order.table?.status,
          orderdetail: order.orderdetail.map((item) => ({
            product_name: item.products?.pd_name,
            price: item.products?.price,
            quantity: item.quantity,
            status: item.status,
          })),
        };
      });

      res.status(200).json(formatted);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },
};
module.exports = foodstallController;

const { default: mongoose } = require("mongoose");
const { Product, Category, Foodstall ,User} = require("../model/model");
const foodstallController = {
  //  GET ALL FOODSTALL
  getAllFoodstall: async (req, res) => {
    try {
      const foodstalls = await Foodstall.find();

      console.log("👉 Đã lấy danh sách quầy hàng:", foodstalls);

      res.status(200).json(foodstalls);
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
                    stall_id: saveStall._id
                }
            });
        }

        return res.status(200).json(saveStall); // Trả về Foodstall vừa tạo
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", error });
    }
},




  // addFoodstall: async (req, res) => {
  //   try {
  //     const { stall_name, location, review, owner_id, user, stall_id } =
  //       req.body;

  //     if (!stall_name || !location) {
  //       return res
  //         .status(400)
  //         .json({ message: "Vui lòng nhập đủ 'name' và 'location'" });
  //     }

  //     const newFoodstall = new Foodstall({
  //       stall_name,
  //       location,
  //       review,
  //       owner_id,
  //       user,
  //       stall_id,
  //     });
  //     await newFoodstall.save();
  //     res.status(201).json(newFoodstall);
  //   } catch (error) {
  //     res.status(500).json({ error: error.message });
  //   }
  // },
  // DELETE
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
                { products: { $in: productsToDelete.map(p => p._id) } },
                { $pull: { products: { $in: productsToDelete.map(p => p._id) } } }
            );

            console.log("Products and Category updated after deletion");
        }

        // Xóa foodstall
        await foodstall.deleteOne();

        // Gửi phản hồi thành công
        return res.status(200).json({
            message: "Foodstall and related products deleted successfully",
            foodstall: foodstall
        });
    } catch (error) {
        console.error("Error in deleteFoodstall:", error);
        return res.status(500).json({ message: "Server error", error: error.message || error });
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
};
module.exports = foodstallController;

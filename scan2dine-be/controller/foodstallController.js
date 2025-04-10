const { default: mongoose } = require('mongoose');
const {Product, Category, Foodstall}  = require('../model/model');
const foodstallController ={
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
          const { stall_name, location ,review,owner_id} = req.body;
      
          if (!stall_name || !location) {
            return res.status(400).json({ message: "Vui lòng nhập đủ 'name' và 'location'" });
          }
      
          const newFoodstall = new Foodstall({ stall_name, location ,review,owner_id});
          await newFoodstall.save();
          res.status(201).json(newFoodstall);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      },
      // DELETE
      deleteFoodstall : async (req, res) => {
        try {
          const stallId = req.params.id;
      
          // Bước 1: Lấy danh sách sản phẩm thuộc quầy này
          const products = await Product.find({ stall_id: stallId });
      
          // Bước 2: Xóa từng sản phẩm và cập nhật category
          for (const product of products) {
            // Gỡ product ra khỏi category tương ứng
            await Category.findByIdAndUpdate(product.category, {
              $pull: { products: product._id },
            });
      
            // Xóa sản phẩm
            await Product.findByIdAndDelete(product._id);
          }
      
          // Bước 3: Xóa foodstall
          await Foodstall.findByIdAndDelete(stallId);
      
          res.status(200).json({ message: "Đã xóa quầy hàng và các sản phẩm liên quan!" });
        } catch (err) {
          console.error("Lỗi khi xóa foodstall:", err);
          res.status(500).json({ error: "Lỗi máy chủ!" });
        }
      },
      // UPDATE
      updateFoodstall : async (req, res) => {
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
      }
};
module.exports = foodstallController;

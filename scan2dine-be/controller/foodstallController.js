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
          const { stall_name, location ,review,owner_id,user,stall_id} = req.body;
      
          if (!stall_name || !location) {
            return res.status(400).json({ message: "Vui lòng nhập đủ 'name' và 'location'" });
          }
      
          const newFoodstall = new Foodstall({ stall_name, location ,review,owner_id,user,stall_id});
          await newFoodstall.save();
          res.status(201).json(newFoodstall);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      },
      // DELETE
      deleteFoodstall: async(req,res)=>{
        try {
            const deleteStall  = await Foodstall.findByIdAndDelete(req.params.id);

            if(!deleteStall){
                res.status(404).json({message: "not found"})
            }
            
            if(deleteStall){
                await Product.deleteMany({stall: req.params.id})
            }
            res.status(200).json({
                message: "Foodstall and related foods deleted successfully",
                foodstall: deleteStall 
            })
        } catch (error) {
            console.error("Error in addCartdetail:", error);
            res.status(500).json({ message: "Server error", error: error.message || error });
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

const { default: mongoose } = require('mongoose');
const {Product, Category}  = require('../model/model');
const fs = require('fs');
const path = require('path');
const categoryController = {

    // ADD CATEGORY
    addCategory: async (req,res) =>{
        try {
            const newCategory  = new Category(req.body);
            const saveCategory = await newCategory.save();

            res.status(200).json(saveCategory);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    // GET ALL CATEGORY
    getAllCategory: async (req, res) =>{
        try {
            const categois = await Category.find();
            res.status(200).json(categois);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    // GET A CATEGORY
    getACategory: async (req, res) =>{
        try {
            // const Category  = Category.find(); // lấy hết danh mục
            //lấy danh mục theo id
            const category  =  await Category.findById(req.params.id).populate({path:"products"}); // params = dau :,
            res.status(200).json(category); 
        } catch (err) {
            res.status(500).json(err);  
        }
    },
    // UPDATE CATEGORY
    updateCategory: async(req,res) =>{
        try {
            const category = await Category.findById(req.params.id);
            await category.updateOne( {$set: req.body});
            res.status(200).json("succesfully");
        } catch (error) {
            res.status(500).json(error);
        }
    },
    // DELETE CATEGORY
    deleteCategory : async (req, res) => {
        try {
            const categoryId = req.params.id;
    
            // Tìm các sản phẩm thuộc category
            const products = await Product.find({ category: categoryId });
    
            // Xoá từng ảnh sản phẩm (nếu có)
            for (const product of products) {
                if (product.image) {
                    const imagePath = path.join(__dirname, '../public', product.image);
                    fs.unlink(imagePath, (err) => {
                        if (err) {
                            console.error(`Không thể xóa ảnh của sản phẩm ${product._id}:`, err.message);
                        }
                    });
                }
            }
    
            // Xóa toàn bộ sản phẩm thuộc danh mục
            await Product.deleteMany({ category: categoryId });
    
            // Xoá danh mục
            const deletedCategory = await Category.findByIdAndDelete(categoryId);
            if (!deletedCategory) {
                return res.status(404).json({ message: "Category not found" });
            }
    
            res.status(200).json({ message: "Category and all related products deleted successfully" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = categoryController;
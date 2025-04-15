const { json } = require('express');
const mongoose = require("mongoose");  // Khai báo mongoose duy nhất
const { Product, Category, Foodstall } = require('../model/model');
const fs = require('fs');
const path = require('path');
const productController ={
    //ADD PRODUCT và IMAGE
    addProduct: async (req, res) => {
        try {
            const { pd_name, price, description, category, stall_id } = req.body;
    
            if (!pd_name || !price || !category || !stall_id) {
                return res.status(400).json({ message: "Thiếu thông tin sản phẩm" });
            }
    
            // Xử lý ảnh nếu có
            let imagePath = null;
            if (req.file) {
                imagePath = '/image/' + req.file.filename; // Đường dẫn public
            }
    
            // Tạo sản phẩm mới
            const newProduct = new Product({
                pd_name,
                price,
                description,
                category,
                stall_id, // Đúng tên field trong schema
                image: imagePath
            });
    
            const savedProduct = await newProduct.save();
    
            // Cập nhật vào Category
            await Category.findByIdAndUpdate(category, {
                $push: { products: savedProduct._id }
            });
    
            // Cập nhật vào Foodstall
            await Foodstall.findByIdAndUpdate(stall_id, {
                $push: { products: savedProduct._id }
            });
    
            res.status(201).json(savedProduct);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },
    //  GET ALL PRODUCT
    getAllProduct: async(req,res)=>{
        try {
            const product = await Product.find();
            res.status(200).json(product);
        } catch (err) {
            res.status(500).json(err);
        }
    },


    updateProduct: async (req, res) => {
        try {
            const productId = req.params.id;
            const updatedData = req.body;
    
            const oldProduct = await Product.findById(productId);
            if (!oldProduct) {
                return res.status(404).json({ message: "Product not found" });
            }
    
            // Nếu có file ảnh mới
            if (req.file) {
                if (oldProduct.image) {
                    const oldImagePath = path.join(__dirname, '../public', oldProduct.image);
                    fs.unlink(oldImagePath, (err) => {
                        if (err) console.error("Không thể xóa ảnh cũ:", err.message);
                    });
                }
                updatedData.image = '/image/' + req.file.filename;
            }
    
            // Nếu category thay đổi
            if (updatedData.category && oldProduct.category?.toString() !== updatedData.category.toString()) {
                await Category.findByIdAndUpdate(oldProduct.category, {
                    $pull: { products: productId }
                });
                await Category.findByIdAndUpdate(updatedData.category, {
                    $push: { products: productId }
                });
            }
    
            // Nếu stall_id thay đổi
            if (updatedData.stall_id && oldProduct.stall_id?.toString() !== updatedData.stall_id.toString()) {
                if (!mongoose.Types.ObjectId.isValid(updatedData.stall_id)) {
                    return res.status(400).json({ message: "Invalid stall_id" });
                }
    
                await Foodstall.findByIdAndUpdate(oldProduct.stall_id, {
                    $pull: { products: productId }
                });
    
                await Foodstall.findByIdAndUpdate(updatedData.stall_id, {
                    $push: { products: productId }
                });
            }
    
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
            const deletedProduct = await Product.findByIdAndDelete(productId);
    
            if (!deletedProduct) {
                return res.status(404).json({ message: "Product not found" });
            }
    
            //  Xóa ảnh trong thư mục nếu có
            if (deletedProduct.image) {
                const imagePath = path.join(__dirname, '../public', deletedProduct.image);
                fs.unlink(imagePath, (err) => {
                    if (err) {
                        console.error("Không thể xóa ảnh:", err.message);
                    }
                });
            }
    
            //  Gỡ khỏi category
            await Category.findByIdAndUpdate(deletedProduct.category, {
                $pull: { products: productId }
            });
    
            res.status(200).json({ message: "Product deleted successfully" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = productController;
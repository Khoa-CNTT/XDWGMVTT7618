const { json } = require('express');
const mongoose = require("mongoose");  // Khai báo mongoose duy nhất
const { Product, Category, Stall } = require('../model/model');
const fs = require('fs');
const path = require('path');
const productController ={
    //ADD PRODUCT và IMAGE
    addProduct : async (req, res) => {
        try {
            const { name, price, description, category } = req.body;
    
            // Nếu có ảnh thì lấy đường dẫn ảnh
            let imagePath = null;
            if (req.file) {
                imagePath = '/image/' + req.file.filename; // lưu theo đường dẫn public
            }
    
            // Tạo sản phẩm mới
            const newProduct = new Product({
                name,
                price,
                description,
                category,
                image: imagePath
            });
    
            const savedProduct = await newProduct.save();
    
            // Cập nhật mảng sản phẩm trong Category
            await Category.findByIdAndUpdate(category, {
                $push: { products: savedProduct._id }
            });
    
            res.status(201).json(savedProduct);
        } catch (error) {
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
    // UPDATE PRODUCT
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
                // Nếu sản phẩm cũ có ảnh, thì xóa
                if (oldProduct.image) {
                    const oldImagePath = path.join(__dirname, '../public', oldProduct.image);
            
                    fs.unlink(oldImagePath, (err) => {
                        if (err) {
                            console.error("Không thể xóa ảnh cũ:", err.message);
                        }
                    });
                }
            
                // Cập nhật ảnh mới
                updatedData.image = '/image/' + req.file.filename;
            }
    
            // Nếu category thay đổi
            if (updatedData.category && updatedData.category !== oldProduct.category.toString()) {
                await Category.findByIdAndUpdate(oldProduct.category, {
                    $pull: { products: productId }
                });
                await Category.findByIdAndUpdate(updatedData.category, {
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
const { json } = require('express');
const mongoose = require("mongoose");  // Khai báo mongoose duy nhất
const { Product, Category, Foodstall } = require('../model/model');
const fs = require('fs');
const path = require('path');
const productController = {
    //ADD PRODUCT và IMAGE
    addProduct: async (req, res) => {
        try {
            let newProductData = { ...req.body };

            if (req.file) {
                const imagePath = req.file.path.replace(/\\/g, '/'); // windows path fix
                newProductData.image = imagePath.replace('public/', '/'); // clean path
            }

            const newProduct = new Product(newProductData);
            const saveProduct = await newProduct.save();

            if (req.body.category) {
                const categoryID = await Category.findById(req.body.category);
                await categoryID.updateOne({ $push: { products: saveProduct._id } });
            }

            if (req.body.stall_id) {
                const stall = await Foodstall.findById(req.body.stall_id);
                await stall.updateOne({ $push: { products: saveProduct._id } });
            }

            res.status(200).json(saveProduct);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    //  GET ALL PRODUCT
    getAllProduct: async (req, res) => {
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
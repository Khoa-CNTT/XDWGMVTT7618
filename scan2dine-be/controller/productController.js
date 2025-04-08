const { json } = require('express');
const mongoose = require("mongoose");  // Khai báo mongoose duy nhất
const { Product, Category, Stall } = require('../model/model');
const productController ={
    //ADD PRODUCT
    addProduct: async (req,res) =>{
        try {
            const newProduct = Product(req.body);
            const saveProduct  = await newProduct.save();
            if(req.body.category){ 
                const category = Category.findById(req.body.category);
                await category.updateOne({$push: {
                    products: saveProduct._id
                }})
            }
            res.status(200).json(saveProduct);
        } catch (error) {
            res.status(500).json(error);
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
    // updateproduct: async(req, res)=>{
    //     const product = Product.findById(req.params.id);
    //     await product.updateOne()
    // }
}

module.exports = productController;
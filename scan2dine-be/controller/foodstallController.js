const { default: mongoose } = require('mongoose');
const {Product, Category, Foodstall}  = require('../model/model');
const productController ={
    //  GET ALL FOODSTALL
    getAllProduct: async(req,res)=>{
        try {
            const foodstall = await Foodstall.find();
            res.status(200).json(foodstall);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    
};
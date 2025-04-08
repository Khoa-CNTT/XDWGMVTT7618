const { default: mongoose } = require('mongoose');
const {Product, Category}  = require('../model/model');

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
    }
}

module.exports = categoryController;
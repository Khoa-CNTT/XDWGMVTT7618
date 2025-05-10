const { default: mongoose } = require('mongoose');
const {Category}  = require('../model/model');
const { notifyCategoryAdded, notifyCategoryUpdated, notifyCategoryDeleted } = require('../utils/socketUtils');
const categoryController = {

    // ADD CATEGORY
    addCategory: async (req,res) =>{
        try {
            const newCategory  = new Category(req.body);
            const saveCategory = await newCategory.save();
            const io = req.app.get('io');
            notifyCategoryAdded(io, saveCategory._id, {
                categoryID: saveCategory._id,
                cate_name: saveCategory.cate_name,
                message: 'Danh mục mới đã được thêm',
            })
            res.status(200).json(saveCategory);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    // GET ALL CATEGORY
    getAllCategory: async (req, res) =>{
        try {
            const categois = await Category.find().populate({path:"products", select:"pd_name"});
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
            const updateCategory = await Category.findByIdAndUpdate(
                req.params.id,  // id category cần update
                req.body,       // dữ liệu cập nhật từ req body
                {new:true}      // trả về catedoty đã đc cập nhật  
            );
            if(!updateCategory){
                res.status(404).json("Not found")
            }
            const io = req.app.get('io');
            notifyCategoryUpdated(io, uodateCategory._id, {
                categoryID: updateCategory._id,
                cate_name: updateCategory.cate_name,
                message: 'Danh mục đã được cập nhật',
            })
            res.status(200).json("succesfully 2");
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // delete category khi
    deleteCategory: async(req,res)=>{
        try {
            const categoryID = await Category.findById(req.params.id);
        
            if (!categoryID) {
                return res.status(404).json({ message: 'Category not found' });
            }
            if (categoryID.products.length == 0){
                // neu danh muc k co san pham
                await Category.findByIdAndDelete(req.params.id);
                const io = req.app.get('io');
                notifyCategoryDeleted(io, categoryID._id, {
                    categoryId: categoryID._id,
                    name: categoryID.name, // Giả sử 'name' là trường trong schema
                    message: 'Danh mục đã được xóa',
                });
                res.status(200).json({ message: 'Delete category successfully' });
            } else{
                // await Product.updateMany(
                //     {
                //         // điều kiện tìm kiếm
                //         category: req.params.id
                //     }, {
                //     $set:{
                //         category: null
                //     }
                // }),
                // await Category.findByIdAndDelete(req.params.id);
                
                res.status(200).json("Không được xóa vì trong danh mục còn sản phẩmphẩm")
            }

        } catch (error) {
            res.status(500).json(error)
        }
    }
}

module.exports = categoryController;
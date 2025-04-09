var express = require("express");
const categoryController = require("../controller/categoryController");
const { route } = require(".");
var router = express.Router();

//add category : thêm danh mục
router.post('/', categoryController.addCategory);
// show all category:  hiênr thị tất cả danh mục
router.get('/', categoryController.getAllCategory);
// show a category : hiển thị danh mục sản phẩm theo ID danh mục
router.get('/:id', categoryController.getACategory);

// update category : cập nhật danh mục 
router.put('/:id', categoryController.updateCategory);
// delete category: 
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
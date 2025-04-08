var express =  require("express");
const productController = require("../controller/productController");
var router = express.Router();

// add prodcut : thêm sản phẩm
router.post('/', productController.addProduct);

// get all product: hiển thị danh dách sản phẩm
router.get('/', productController.getAllProduct);

// update product by ID 
// router.put('/:id', productController.updateProduct);
module.exports = router;
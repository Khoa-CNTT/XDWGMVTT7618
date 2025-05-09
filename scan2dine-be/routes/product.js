var express =  require("express");
const productController = require("../controller/productController");
var router = express.Router();
const upload = require('../middleware/upload');

// ADD
// router.post('/', upload.single('image'), productController.addProduct);
router.post('/', upload.single('image'), productController.addProduct);
// UPDATE
router.post('/:id', upload.single('image'), productController.updateProduct);

// lọc theo giá tiền
router.post("/filter/price", productController.filterProductsByPrice);

// get all product: hiển thị danh dách sản phẩm
router.get('/', productController.getAllProduct);

// DELETE PRODUCT
router.delete("/:id", productController.deleteProduct);

module.exports = router;